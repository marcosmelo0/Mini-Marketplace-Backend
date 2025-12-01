import cron from 'node-cron';
import { prisma } from '../config/prisma';

export const startBookingCompletionJob = () => {
    cron.schedule('*/5 * * * *', async () => {
        console.log('Running booking completion job...');
        const now = new Date();

        try {
            const result = await prisma.booking.updateMany({
                where: {
                    status: 'CONFIRMED',
                    end_time: {
                        lt: now,
                    },
                },
                data: {
                    status: 'COMPLETED',
                },
            });

            if (result.count > 0) {
                console.log(`Completed ${result.count} bookings.`);
            }
        } catch (error) {
            console.error('Error running booking completion job:', error);
        }
    });
};
