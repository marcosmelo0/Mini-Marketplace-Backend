import * as reviewRepository from '../repositories/reviewRepository';
import * as serviceRepository from '../repositories/serviceRepository';
import * as bookingRepository from '../repositories/bookingRepository';

export const createReview = async (
    clientId: string,
    serviceId: string,
    rating: number,
    comment?: string
) => {
    // 1. Verificar se o serviço existe
    const service = await serviceRepository.findServiceById(serviceId);
    if (!service) {
        throw new Error('Serviço não encontrado');
    }

    // 2. Verificar se o cliente já contratou este serviço e se o status é COMPLETED ou CONFIRMED
    // Buscar todos os bookings sem paginação para validação
    const clientBookings = await bookingRepository.findBookingsByClient(clientId, undefined, undefined);

    // Precisamos verificar se algum booking do cliente pertence a uma variação deste serviço
    const hasBookingForService = clientBookings.some(booking =>
        booking.serviceVariation &&
        booking.serviceVariation.serviceId === serviceId &&
        (booking.status === 'COMPLETED' || booking.status === 'CONFIRMED')
    );

    if (!hasBookingForService) {
        throw new Error('Você só pode avaliar serviços que agendou');
    }

    // 3. Criar review
    try {
        const review = await reviewRepository.createReview({
            client: { connect: { id: clientId } },
            service: { connect: { id: serviceId } },
            rating,
            comment
        });
        return review;
    } catch (error: any) {
        if (error.code === 'P2002') {
            throw new Error('Você já avaliou este serviço');
        }
        throw error;
    }
};

export const getReviewsByService = async (serviceId: string, page: number = 1, limit: number = 20) => {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
        reviewRepository.findReviewsByService(serviceId, skip, limit),
        reviewRepository.countReviews(serviceId),
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
