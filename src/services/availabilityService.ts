import * as availabilityRepository from '../repositories/availabilityRepository';
import { Prisma } from '../lib/generated/prisma';

export const createAvailability = async (providerId: string, data: any) => {
    // Validar conflitos
    const startTime = new Date(`1970-01-01T${data.start_time}`);
    const endTime = new Date(`1970-01-01T${data.end_time}`);

    if (startTime >= endTime) {
        throw new Error('Start time must be before end time');
    }

    const hasConflict = await availabilityRepository.checkAvailabilityConflict(
        providerId,
        data.day_of_week,
        startTime,
        endTime
    );

    if (hasConflict) {
        throw new Error('Availability conflicts with existing slot');
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
        throw new Error('Availability not found');
    }

    if (availability.providerId !== providerId) {
        throw new Error('Unauthorized');
    }

    const startTime = data.start_time ? new Date(`1970-01-01T${data.start_time}`) : availability.start_time;
    const endTime = data.end_time ? new Date(`1970-01-01T${data.end_time}`) : availability.end_time;
    const dayOfWeek = data.day_of_week !== undefined ? data.day_of_week : availability.day_of_week;

    if (startTime >= endTime) {
        throw new Error('Start time must be before end time');
    }

    const hasConflict = await availabilityRepository.checkAvailabilityConflict(
        providerId,
        dayOfWeek,
        startTime,
        endTime,
        id
    );

    if (hasConflict) {
        throw new Error('Availability conflicts with existing slot');
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
        throw new Error('Availability not found');
    }

    if (availability.providerId !== providerId) {
        throw new Error('Unauthorized');
    }

    return availabilityRepository.deleteAvailability(id);
};

export const checkTimeSlotAvailability = async (providerId: string, date: Date, durationMinutes: number): Promise<boolean> => {
    const dayOfWeek = date.getDay(); // 0 = Domingo, 1 = Segunda, etc.

    // Extrair apenas o horário da data solicitada para comparar com a disponibilidade
    // A disponibilidade é salva com data 1970-01-01
    const requestTime = new Date(date);
    const requestHours = requestTime.getHours();
    const requestMinutes = requestTime.getMinutes();

    const slotStart = new Date(0);
    slotStart.setHours(requestHours, requestMinutes, 0, 0);

    const slotEnd = new Date(slotStart);
    slotEnd.setMinutes(slotEnd.getMinutes() + durationMinutes);

    // Buscar disponibilidades do provedor para esse dia da semana
    const availabilities = await availabilityRepository.findAvailabilitiesByProviderAndDay(providerId, dayOfWeek);

    // Verificar se o horário solicitado está dentro de algum intervalo disponível
    const isWithinAvailability = availabilities.some(avail => {
        const availStart = new Date(avail.start_time);
        const availEnd = new Date(avail.end_time);

        // Ajustar datas para comparação (apenas horário importa)
        availStart.setFullYear(1970, 0, 1);
        availEnd.setFullYear(1970, 0, 1);

        return slotStart >= availStart && slotEnd <= availEnd;
    });

    return isWithinAvailability;
};
