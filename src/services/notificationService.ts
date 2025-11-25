import * as notificationRepository from '../repositories/notificationRepository';
import * as bookingRepository from '../repositories/bookingRepository';

export const createBookingNotification = async (bookingId: string) => {
    const booking = await bookingRepository.findBookingById(bookingId);
    if (!booking) return;

    // Notificar o prestador sobre o novo agendamento
    const providerId = booking.serviceVariation?.service?.providerId;
    if (providerId) {
        await notificationRepository.createNotification({
            provider: { connect: { id: providerId } },
            type: 'NEW_BOOKING',
            title: 'Novo Agendamento',
            message: `Você tem um novo agendamento de ${booking.serviceVariation?.name} para ${booking.start_time.toLocaleString()}`,
            booking: { connect: { id: bookingId } },
        });
    }
};

export const createCancellationNotification = async (bookingId: string, cancelledBy: 'CLIENT' | 'PROVIDER') => {
    const booking = await bookingRepository.findBookingById(bookingId);
    if (!booking) return;

    const providerId = booking.serviceVariation?.service?.providerId;

    // Se foi cancelado pelo cliente, notificar o prestador
    if (cancelledBy === 'CLIENT' && providerId) {
        await notificationRepository.createNotification({
            provider: { connect: { id: providerId } },
            type: 'BOOKING_CANCELLED',
            title: 'Agendamento Cancelado',
            message: `O agendamento de ${booking.serviceVariation?.name} para ${booking.start_time.toLocaleString()} foi cancelado pelo cliente.`,
            booking: { connect: { id: bookingId } },
        });
    }

    // TODO: Se foi cancelado pelo prestador, poderíamos notificar o cliente (se tivéssemos notificações para clientes)
};

export const getProviderNotifications = async (providerId: string, page: number = 1, limit: number = 20) => {
    const skip = (page - 1) * limit;
    const notifications = await notificationRepository.findNotificationsByProvider(providerId, skip, limit);
    const total = await notificationRepository.countNotificationsByProvider(providerId);

    return {
        data: notifications,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};

export const markAsRead = async (id: string, providerId: string) => {
    const notification = await notificationRepository.findNotificationById(id);
    if (!notification) {
        throw new Error('Notification not found');
    }

    if (notification.providerId !== providerId) {
        throw new Error('Unauthorized');
    }

    return notificationRepository.markAsRead(id);
};

export const getUnreadCount = async (providerId: string) => {
    return notificationRepository.countUnreadNotifications(providerId);
};
