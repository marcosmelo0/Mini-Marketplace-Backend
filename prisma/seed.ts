import 'dotenv/config';
import { PrismaClient } from '../src/lib/generated/prisma';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';

const connectionString = process.env.DATABASE_URL!;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('🌱 Iniciando seed do banco de dados...');

    // Limpar dados existentes
    console.log('🧹 Limpando dados existentes...');
    await prisma.notification.deleteMany();
    await prisma.review.deleteMany();
    await prisma.booking.deleteMany();
    await prisma.availability.deleteMany();
    await prisma.serviceVariation.deleteMany();
    await prisma.service.deleteMany();
    await prisma.refreshToken.deleteMany();
    await prisma.user.deleteMany();

    // Criar senha hash
    const hashedPassword = await bcrypt.hash('123456', 10);

    // 1. Criar Prestadores
    console.log('👤 Criando prestadores...');

    const barbeiro = await prisma.user.create({
        data: {
            name: 'João Silva',
            email: 'joao.barbeiro@email.com',
            password_hash: hashedPassword,
            role: 'PROVIDER',
            phone: '11987654321',
        },
    });

    const manicure = await prisma.user.create({
        data: {
            name: 'Maria Santos',
            email: 'maria.manicure@email.com',
            password_hash: hashedPassword,
            role: 'PROVIDER',
            phone: '11987654322',
        },
    });

    const personal = await prisma.user.create({
        data: {
            name: 'Carlos Oliveira',
            email: 'carlos.personal@email.com',
            password_hash: hashedPassword,
            role: 'PROVIDER',
            phone: '11987654323',
        },
    });

    // 2. Criar Cliente
    console.log('👥 Criando cliente...');

    const cliente = await prisma.user.create({
        data: {
            name: 'Ana Costa',
            email: 'ana.cliente@email.com',
            password_hash: hashedPassword,
            role: 'CLIENT',
            phone: '11987654324',
        },
    });

    // 3. Criar Serviços do Barbeiro
    console.log('✂️ Criando serviços de barbearia...');

    await prisma.service.create({
        data: {
            name: 'Corte de Cabelo Masculino Premium',
            description: 'Corte de cabelo masculino com acabamento premium, incluindo lavagem e finalização com produtos de alta qualidade.',
            providerId: barbeiro.id,
            category: 'Barbearia',
            photos: [],
            variations: {
                create: [
                    {
                        name: 'Corte Simples',
                        price: 45.00,
                        duration_minutes: 30,
                    },
                    {
                        name: 'Corte + Barba',
                        price: 70.00,
                        duration_minutes: 50,
                    },
                    {
                        name: 'Corte Premium + Barba + Sobrancelha',
                        price: 95.00,
                        duration_minutes: 80,
                    },
                ],
            },
        },
    });

    await prisma.service.create({
        data: {
            name: 'Barba',
            description: 'Serviço de barba profissional com navalha e produtos premium.',
            providerId: barbeiro.id,
            category: 'Barbearia',
            photos: [],
            variations: {
                create: [
                    {
                        name: 'Barba Simples',
                        price: 30.00,
                        duration_minutes: 20,
                    },
                    {
                        name: 'Barba Completa',
                        price: 50.00,
                        duration_minutes: 35,
                    },
                ],
            },
        },
    });

    // 4. Criar Serviços da Manicure
    console.log('💅 Criando serviços de manicure...');

    await prisma.service.create({
        data: {
            name: 'Manicure e Pedicure',
            description: 'Serviços completos de cuidados com unhas das mãos e pés.',
            providerId: manicure.id,
            category: 'Manicure',
            photos: [],
            variations: {
                create: [
                    {
                        name: 'Manicure Simples',
                        price: 35.00,
                        duration_minutes: 40,
                    },
                    {
                        name: 'Pedicure Simples',
                        price: 40.00,
                        duration_minutes: 50,
                    },
                    {
                        name: 'Manicure + Pedicure',
                        price: 70.00,
                        duration_minutes: 90,
                    },
                ],
            },
        },
    });

    await prisma.service.create({
        data: {
            name: 'Unhas em Gel',
            description: 'Aplicação de unhas em gel com design personalizado.',
            providerId: manicure.id,
            category: 'Manicure',
            photos: [],
            variations: {
                create: [
                    {
                        name: 'Gel Simples',
                        price: 80.00,
                        duration_minutes: 60,
                    },
                    {
                        name: 'Gel com Decoração',
                        price: 120.00,
                        duration_minutes: 90,
                    },
                ],
            },
        },
    });

    // 5. Criar Serviços do Personal Trainer
    console.log('💪 Criando serviços de personal trainer...');

    await prisma.service.create({
        data: {
            name: 'Personal Training',
            description: 'Treino personalizado com acompanhamento profissional.',
            providerId: personal.id,
            category: 'Personal Trainer',
            photos: [],
            variations: {
                create: [
                    {
                        name: 'Sessão Avulsa',
                        price: 100.00,
                        duration_minutes: 60,
                    },
                    {
                        name: 'Pacote 5 Sessões',
                        price: 450.00,
                        duration_minutes: 60,
                    },
                    {
                        name: 'Pacote 10 Sessões',
                        price: 850.00,
                        duration_minutes: 60,
                    },
                ],
            },
        },
    });

    await prisma.service.create({
        data: {
            name: 'Avaliação Física',
            description: 'Avaliação física completa com bioimpedância e medidas.',
            providerId: personal.id,
            category: 'Personal Trainer',
            photos: [],
            variations: {
                create: [
                    {
                        name: 'Avaliação Básica',
                        price: 50.00,
                        duration_minutes: 30,
                    },
                    {
                        name: 'Avaliação Completa',
                        price: 150.00,
                        duration_minutes: 60,
                    },
                ],
            },
        },
    });

    // 6. Criar Disponibilidades
    console.log('📅 Criando disponibilidades...');

    const providers = [barbeiro, manicure, personal];
    const daysOfWeek = [1, 2, 3, 4, 5]; // Seg-Sex

    for (const provider of providers) {
        for (const day of daysOfWeek) {
            await prisma.availability.create({
                data: {
                    providerId: provider.id,
                    day_of_week: day,
                    start_time: new Date('1970-01-01T09:00:00Z'),
                    end_time: new Date('1970-01-01T18:00:00Z'),
                },
            });
        }
    }

    // 7. Criar Agendamentos e Avaliações
    console.log('📅 Criando agendamentos e avaliações...');

    // Buscar uma variação de serviço para agendar
    const serviceVariation = await prisma.serviceVariation.findFirst({
        where: {
            service: {
                providerId: barbeiro.id
            }
        },
        include: {
            service: true
        }
    });

    if (serviceVariation) {
        // Agendamento Passado (Concluído e Avaliado)
        const pastBooking = await prisma.booking.create({
            data: {
                clientId: cliente.id,
                serviceVariationId: serviceVariation.id,
                start_time: new Date(Date.now() - 86400000), // Ontem
                end_time: new Date(Date.now() - 86400000 + serviceVariation.duration_minutes * 60000),
                status: 'COMPLETED',
                final_price: serviceVariation.price,
            }
        });

        // Avaliação para o agendamento passado
        await prisma.review.create({
            data: {
                serviceId: serviceVariation.serviceId,
                clientId: cliente.id,
                rating: 5,
                comment: 'Excelente serviço! Muito profissional.',
            }
        });

        // Agendamento Futuro (Confirmado)
        const futureBooking = await prisma.booking.create({
            data: {
                clientId: cliente.id,
                serviceVariationId: serviceVariation.id,
                start_time: new Date(Date.now() + 86400000), // Amanhã
                end_time: new Date(Date.now() + 86400000 + serviceVariation.duration_minutes * 60000),
                status: 'CONFIRMED',
                final_price: serviceVariation.price,
            }
        });

        // Notificação de novo agendamento para o prestador
        await prisma.notification.create({
            data: {
                providerId: barbeiro.id,
                type: 'NEW_BOOKING',
                title: 'Novo Agendamento',
                message: `Você tem um novo agendamento de ${serviceVariation.name} para amanhã.`,
                bookingId: futureBooking.id,
                read: false,
            }
        });
    }

    console.log('✅ Seed concluído com sucesso!');
    console.log('\n📊 Resumo:');
    console.log(`   - 4 usuários criados (3 prestadores + 1 cliente)`);
    console.log(`   - 6 serviços criados`);
    console.log(`   - 15 variações de serviços criadas`);
    console.log('\n🔐 Credenciais de acesso:');
    console.log('   Senha padrão para todos: 123456');
    console.log('\n   Prestadores:');
    console.log('   - joao.barbeiro@email.com (Barbeiro)');
    console.log('   - maria.manicure@email.com (Manicure)');
    console.log('   - carlos.personal@email.com (Personal Trainer)');
    console.log('\n   Cliente:');
    console.log('   - ana.cliente@email.com');
}

main()
    .catch((e) => {
        console.error('❌ Erro ao executar seed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });
