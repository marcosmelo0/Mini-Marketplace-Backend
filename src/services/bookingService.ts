import * as bookingRepository from '../repositories/bookingRepository';
import * as serviceRepository from '../repositories/serviceRepository';
import * as availabilityService from './availabilityService';
import * as notificationService from './notificationService';
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
    // Get service variation to calculate end time
    const variation = await serviceRepository.findServiceVariationById(data.serviceVariationId);
    if (!variation) {
        throw new Error('Service variation not found');
    }

    const service = await serviceRepository.findServiceById(variation.serviceId);
    if (!service) {
        throw new Error('Service not found');
    }

    // Calculate end time using explicit timezone
    const startTime = toZonedTime(data.start_time, TIMEZONE);
    const endTime = new Date(startTime.getTime() + variation.duration_minutes * 60000);

    // 1. Check for conflicts with other bookings
    const hasConflict = await bookingRepository.checkBookingConflict(
        data.serviceVariationId,
        startTime,
        endTime
    );

    if (hasConflict) {
        throw new Error('Time slot is already booked');
    }

    // 2. Check provider availability
    const isAvailable = await availabilityService.checkTimeSlotAvailability(
        service.providerId,
        startTime,
        variation.duration_minutes
    );

    if (!isAvailable) {
        throw new Error('Provider is not available at this time');
    }

    // Calculate final price with discount
    let finalPrice = variation.price;
    const dayOfWeek = startTime.getDay(); // 0-6 (Sun-Sat)

    if (
        variation.discount_percentage &&
        variation.discount_percentage > 0 &&
        variation.discount_days &&
        variation.discount_days.includes(dayOfWeek)
    ) {
        const discountAmount = (Number(variation.price) * variation.discount_percentage) / 100;
        finalPrice = new (variation.price.constructor as any)(Number(variation.price) - discountAmount);
    }

    // Create booking
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

    // Invalidar cache de slots do prestador para esta data
    const dateStr = format(startTime, 'yyyy-MM-dd');
    await invalidateSlots(service.providerId, dateStr);

    // Notificar prestador
    await notificationService.createBookingNotification(booking.id);

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
        throw new Error('Booking not found');
    }

    // Get service variation and the related service to check provider
    const variation = await serviceRepository.findServiceVariationById(booking.serviceVariationId);
    if (!variation) {
        throw new Error('Service variation not found');
    }

    // Fetch the service associated with the variation
    const service = await serviceRepository.findServiceById(variation.serviceId);
    if (!service) {
        throw new Error('Service not found');
    }

    // Check authorization
    const isClient = userRole === 'CLIENT' && booking.clientId === userId;
    const isProvider = userRole === 'PROVIDER' && service.providerId === userId;

    if (!isClient && !isProvider) {
        throw new Error('Unauthorized');
    }

    if (booking.status === 'CANCELLED') {
        throw new Error('Booking is already cancelled');
    }

    const updatedBooking = await bookingRepository.updateBookingStatus(bookingId, 'CANCELLED');

    // Invalidar cache de slots do prestador para esta data
    const dateStr = format(booking.start_time, 'yyyy-MM-dd');
    await invalidateSlots(service.providerId, dateStr);

    // Notificar sobre cancelamento
    await notificationService.createCancellationNotification(bookingId, isClient ? 'CLIENT' : 'PROVIDER');

    return updatedBooking;
};
