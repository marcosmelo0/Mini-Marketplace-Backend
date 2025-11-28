import * as availabilityRepository from '../repositories/availabilityRepository';
import { Prisma } from '../lib/generated/prisma';

export const createAvailability = async (providerId: string, data: any) => {
    // Validar conflitos
    const startTime = new Date(`1970-01-01T${data.start_time}`);
    const endTime = new Date(`1970-01-01T${data.end_time}`);

    if (startTime >= endTime) {
        throw new Error('Horário de início deve ser anterior ao horário de término');
    }

    const hasConflict = await availabilityRepository.checkAvailabilityConflict(
        providerId,
        data.day_of_week,
        startTime,
        endTime
    );

    if (hasConflict) {
        throw new Error('Disponibilidade conflita com horário existente');
    }

    return availabilityRepository.createAvailability({
        provider: { connect: { id: providerId } },
        day_of_week: data.day_of_week,
        start_time: startTime,
        end_time: endTime,
    });
};

export const getAvailabilitiesByProvider = async (providerId: string, page: number = 1, limit: number = 20) => {
    const skip = (page - 1) * limit;
    const availabilities = await availabilityRepository.findAvailabilitiesByProvider(providerId, skip, limit);
    const total = await availabilityRepository.countAvailabilitiesByProvider(providerId);

    return {
        data: availabilities,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};

export const updateAvailability = async (id: string, providerId: string, data: any) => {
    const availability = await availabilityRepository.findAvailabilityById(id);
    if (!availability) {
        throw new Error('Disponibilidade não encontrada');
    }

    if (availability.providerId !== providerId) {
        throw new Error('Não autorizado');
    }

    const startTime = data.start_time ? new Date(`1970-01-01T${data.start_time}`) : availability.start_time;
    const endTime = data.end_time ? new Date(`1970-01-01T${data.end_time}`) : availability.end_time;
    const dayOfWeek = data.day_of_week !== undefined ? data.day_of_week : availability.day_of_week;

    if (startTime >= endTime) {
        throw new Error('Horário de início deve ser anterior ao horário de término');
    }

    const hasConflict = await availabilityRepository.checkAvailabilityConflict(
        providerId,
        dayOfWeek,
        startTime,
        endTime,
        id
    );

    if (hasConflict) {
        throw new Error('Disponibilidade conflita com horário existente');
    }

    return availabilityRepository.updateAvailability(id, {
        day_of_week: dayOfWeek,
        start_time: startTime,
        end_time: endTime,
    });
};

export const deleteAvailability = async (id: string, providerId: string) => {
    const availability = await availabilityRepository.findAvailabilityById(id);
    if (!availability) {
        throw new Error('Disponibilidade não encontrada');
    }

    if (availability.providerId !== providerId) {
        throw new Error('Não autorizado');
    }

    return availabilityRepository.deleteAvailability(id);
};

export const checkTimeSlotAvailability = async (providerId: string, date: Date, durationMinutes: number): Promise<boolean> => {
    const dayOfWeek = date.getDay(); // 0 = Domingo, 1 = Segunda, etc.

    // Extrair apenas o horário da data solicitada para comparar com a disponibilidade
    // A disponibilidade é salva com data 1970-01-01 em UTC
    const requestHours = date.getUTCHours();
    const requestMinutes = date.getUTCMinutes();

    // Criar horários usando UTC para comparação consistente
    const slotStart = new Date(Date.UTC(1970, 0, 1, requestHours, requestMinutes, 0, 0));
    const slotEnd = new Date(slotStart.getTime() + durationMinutes * 60000);

    // Buscar disponibilidades do provedor para esse dia da semana
    const availabilities = await availabilityRepository.findAvailabilitiesByProviderAndDay(providerId, dayOfWeek);

    // Verificar se o horário solicitado está dentro de algum intervalo disponível
    const isWithinAvailability = availabilities.some(avail => {
        const availStart = new Date(avail.start_time);
        const availEnd = new Date(avail.end_time);

        return slotStart >= availStart && slotEnd <= availEnd;
    });

    return isWithinAvailability;
};

/**
 * Obter slots disponíveis de um prestador para uma data específica
 */
export const getAvailableSlots = async (
    providerId: string,
    date: Date,
    serviceVariationId: string
) => {
    const serviceRepository = await import('../repositories/serviceRepository');
    const bookingRepository = await import('../repositories/bookingRepository');

    // Buscar variação do serviço para obter duração
    const variation = await serviceRepository.findServiceVariationById(serviceVariationId);
    if (!variation) {
        throw new Error('Variação de serviço não encontrada');
    }

    const durationMinutes = variation.duration_minutes;
    const dayOfWeek = date.getDay();

    // Buscar disponibilidades do prestador para esse dia da semana
    const availabilities = await availabilityRepository.findAvailabilitiesByProviderAndDay(providerId, dayOfWeek);

    if (availabilities.length === 0) {
        return [];
    }

    // Buscar agendamentos confirmados do prestador nessa data
    const bookings = await bookingRepository.findBookingsByProviderAndDate(providerId, date);

    // Gerar slots baseados na duração do serviço
    const slots: Array<{ start_time: string; end_time: string; available: boolean }> = [];
    const slotIntervalMinutes = durationMinutes;

    for (const availability of availabilities) {
        const availStart = new Date(availability.start_time);
        const availEnd = new Date(availability.end_time);

        // Criar data base para o dia solicitado
        const currentSlot = new Date(date);
        currentSlot.setHours(availStart.getHours(), availStart.getMinutes(), 0, 0);

        const endLimit = new Date(date);
        endLimit.setHours(availEnd.getHours(), availEnd.getMinutes(), 0, 0);

        while (currentSlot < endLimit) {
            const slotEnd = new Date(currentSlot);
            slotEnd.setMinutes(slotEnd.getMinutes() + durationMinutes);

            // Verificar se o slot + duração do serviço cabe no horário de trabalho
            if (slotEnd <= endLimit) {
                // Verificar se não conflita com agendamentos existentes
                const hasConflict = bookings.some(booking => {
                    const bookingStart = new Date(booking.start_time);
                    const bookingEnd = new Date(booking.end_time);

                    // Verifica sobreposição
                    return (
                        (currentSlot >= bookingStart && currentSlot < bookingEnd) ||
                        (slotEnd > bookingStart && slotEnd <= bookingEnd) ||
                        (currentSlot <= bookingStart && slotEnd >= bookingEnd)
                    );
                });

                if (!hasConflict) {
                    slots.push({
                        start_time: currentSlot.toISOString(),
                        end_time: slotEnd.toISOString(),
                        available: true,
                    });
                }
            }

            // Avançar para o próximo slot
            currentSlot.setMinutes(currentSlot.getMinutes() + slotIntervalMinutes);
        }
    }

    return slots;
};
