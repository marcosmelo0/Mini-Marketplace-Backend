import * as bookingRepository from '../repositories/bookingRepository';
import * as serviceRepository from '../repositories/serviceRepository';
import * as availabilityService from './availabilityService';
import * as notificationService from './notificationService';
import * as emailService from './emailService';
import { invalidateSlots } from '../config/redis';
import { toZonedTime } from 'date-fns-tz';
import { format } from 'date-fns';

const TIMEZONE = 'America/Sao_Paulo';

export const createBooking = async (
    clientId: string,
    data: {
        serviceVariationId: string;
        start_time: Date;
    }
) => {
    const variation = await serviceRepository.findServiceVariationById(data.serviceVariationId);
    if (!variation) {
        throw new Error('Variação de serviço não encontrada');
    }

    const service = await serviceRepository.findServiceById(variation.serviceId);
    if (!service) {
        throw new Error('Serviço não encontrado');
    }

    const startTime = toZonedTime(data.start_time, TIMEZONE);
    const endTime = new Date(startTime.getTime() + variation.duration_minutes * 60000);

    const hasConflict = await bookingRepository.checkBookingConflict(
        data.serviceVariationId,
        startTime,
        endTime
    );

    if (hasConflict) {
        throw new Error('Horário já reservado');
    }

    const isAvailable = await availabilityService.checkTimeSlotAvailability(
        service.providerId,
        startTime,
        variation.duration_minutes
    );

    if (!isAvailable) {
        throw new Error('Prestador não está disponível neste horário');
    }

    let finalPrice = variation.price;
    const dayOfWeek = startTime.getDay(); 

    if (
        variation.discount_percentage &&
        variation.discount_percentage > 0 &&
        variation.discount_days &&
        variation.discount_days.includes(dayOfWeek)
    ) {
        const discountAmount = (Number(variation.price) * variation.discount_percentage) / 100;
        finalPrice = new (variation.price.constructor as any)(Number(variation.price) - discountAmount);
    }

    const booking = await bookingRepository.createBooking({
        client: {
            connect: { id: clientId },
        },
        serviceVariation: {
            connect: { id: data.serviceVariationId },
        },
        start_time: startTime,
        end_time: endTime,
        status: 'CONFIRMED',
        final_price: finalPrice,
    });

    const dateStr = format(startTime, 'yyyy-MM-dd');
    await invalidateSlots(service.providerId, dateStr);

    await notificationService.createBookingNotification(booking.id);

    const fullBooking = await bookingRepository.findBookingById(booking.id);
    if (fullBooking && fullBooking.serviceVariation.service.provider) {
        await emailService.sendBookingNotification({
            providerName: fullBooking.serviceVariation.service.provider.name,
            providerEmail: fullBooking.serviceVariation.service.provider.email,
            clientName: fullBooking.client.name,
            serviceName: fullBooking.serviceVariation.service.name,
            variationName: fullBooking.serviceVariation.name,
            startTime: fullBooking.start_time,
            endTime: fullBooking.end_time,
            finalPrice: (fullBooking?.final_price ?? booking.final_price ?? 0).toString(),
        });
    }

    return booking;
};

export const getBookingsByClient = async (clientId: string, page: number = 1, limit: number = 20) => {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
        bookingRepository.findBookingsByClient(clientId, skip, limit),
        bookingRepository.countBookingsByClient(clientId),
    ]);

    return {
        data,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};

export const getBookingsByProvider = async (providerId: string, page: number = 1, limit: number = 20) => {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
        bookingRepository.findBookingsByProvider(providerId, skip, limit),
        bookingRepository.countBookingsByProvider(providerId),
    ]);

    return {
        data,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};

export const cancelBooking = async (bookingId: string, userId: string, userRole: string) => {
    const booking = await bookingRepository.findBookingById(bookingId);
    if (!booking) {
        throw new Error('Agendamento não encontrado');
    }

    const variation = await serviceRepository.findServiceVariationById(booking.serviceVariationId);
    if (!variation) {
        throw new Error('Variação de serviço não encontrada');
    }

    const service = await serviceRepository.findServiceById(variation.serviceId);
    if (!service) {
        throw new Error('Serviço não encontrado');
    }

    const isClient = userRole === 'CLIENT' && booking.clientId === userId;
    const isProvider = userRole === 'PROVIDER' && service.providerId === userId;

    if (!isClient && !isProvider) {
        throw new Error('Não autorizado');
    }

    if (booking.status === 'CANCELLED') {
        throw new Error('Agendamento já cancelado');
    }

    const updatedBooking = await bookingRepository.updateBookingStatus(bookingId, 'CANCELLED');

    const dateStr = format(booking.start_time, 'yyyy-MM-dd');
    await invalidateSlots(service.providerId, dateStr);

    await notificationService.createCancellationNotification(bookingId, isClient ? 'CLIENT' : 'PROVIDER');

    const fullBooking = await bookingRepository.findBookingById(bookingId);
    if (fullBooking && fullBooking.serviceVariation.service.provider) {
        await emailService.sendBookingCancellation({
            providerName: fullBooking.serviceVariation.service.provider.name,
            providerEmail: fullBooking.serviceVariation.service.provider.email,
            clientName: fullBooking.client.name,
            serviceName: fullBooking.serviceVariation.service.name,
            variationName: fullBooking.serviceVariation.name,
            startTime: fullBooking.start_time,
            endTime: fullBooking.end_time,
            finalPrice: (fullBooking?.final_price ?? updatedBooking.final_price ?? 0).toString(),
        });
    }

    return updatedBooking;
};
