import app from './app';
import { prisma } from './config/prisma';
import { initializeSearchIndex } from './config/initializeSearch';
import './config/redis';
import { verifyEmailConnection } from './config/email';
import { startBookingCompletionJob } from './jobs/completeBookings';

const PORT = process.env.PORT || 3000;

async function main() {
    try {
        await prisma.$connect();
        console.log('Connected to database');

        try {
            await initializeSearchIndex();
        } catch (error) {
            console.warn('Elasticsearch not available:', error);
        }

        // Verificar conexão com serviço de email
        await verifyEmailConnection();

        // Start background jobs
        startBookingCompletionJob();

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

main();
