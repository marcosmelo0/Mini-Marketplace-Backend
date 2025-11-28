import 'dotenv/config';
import { PrismaClient } from '../src/lib/generated/prisma';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';
import Redis from 'ioredis';

const connectionString = process.env.DATABASE_URL!;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Redis client para popular visualizações
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

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

    const massagista = await prisma.user.create({
        data: {
            name: 'Fernanda Lima',
            email: 'fernanda.massagem@email.com',
            password_hash: hashedPassword,
            role: 'PROVIDER',
            phone: '11987654325',
        },
    });

    const eletricista = await prisma.user.create({
        data: {
            name: 'Roberto Alves',
            email: 'roberto.eletricista@email.com',
            password_hash: hashedPassword,
            role: 'PROVIDER',
            phone: '11987654326',
        },
    });

    // 2. Criar Clientes
    console.log('👥 Criando clientes...');

    const cliente1 = await prisma.user.create({
        data: {
            name: 'Ana Costa',
            email: 'ana.cliente@email.com',
            password_hash: hashedPassword,
            role: 'CLIENT',
            phone: '11987654324',
        },
    });

    const cliente2 = await prisma.user.create({
        data: {
            name: 'Pedro Souza',
            email: 'pedro.cliente@email.com',
            password_hash: hashedPassword,
            role: 'CLIENT',
            phone: '11987654327',
        },
    });

    const cliente3 = await prisma.user.create({
        data: {
            name: 'Julia Mendes',
            email: 'julia.cliente@email.com',
            password_hash: hashedPassword,
            role: 'CLIENT',
            phone: '11987654328',
        },
    });

    const cliente4 = await prisma.user.create({
        data: {
            name: 'Lucas Ferreira',
            email: 'lucas.cliente@email.com',
            password_hash: hashedPassword,
            role: 'CLIENT',
            phone: '11987654329',
        },
    });

    // 3. Criar Serviços do Barbeiro
    console.log('✂️ Criando serviços de barbearia...');

    const servicoBarbeiro1 = await prisma.service.create({
        data: {
            name: 'Corte de Cabelo Masculino Premium',
            description: 'Corte de cabelo masculino com acabamento premium, incluindo lavagem e finalização com produtos de alta qualidade.',
            providerId: barbeiro.id,
            category: 'Barbearia',
            photos: ['https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=500'],
            variations: {
                create: [
                    {
                        name: 'Corte Simples',
                        price: 45.00,
                        duration_minutes: 30,
                        discount_percentage: 15,
                        discount_days: [1, 3], // Segunda e Quarta
                    },
                    {
                        name: 'Corte + Barba',
                        price: 70.00,
                        duration_minutes: 50,
                        discount_percentage: 10,
                        discount_days: [1], // Segunda
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

    const servicoBarbeiro2 = await prisma.service.create({
        data: {
            name: 'Barba',
            description: 'Serviço de barba profissional com navalha e produtos premium.',
            providerId: barbeiro.id,
            category: 'Barbearia',
            photos: ['https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=500'],
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
                        discount_percentage: 20,
                        discount_days: [5], // Sexta
                    },
                ],
            },
        },
    });

    // 4. Criar Serviços da Manicure
    console.log('💅 Criando serviços de manicure...');

    const servicoManicure1 = await prisma.service.create({
        data: {
            name: 'Manicure e Pedicure',
            description: 'Serviços completos de cuidados com unhas das mãos e pés.',
            providerId: manicure.id,
            category: 'Manicure',
            photos: ['https://images.unsplash.com/photo-1604654894610-df63bc536371?w=500'],
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
                        discount_percentage: 10,
                        discount_days: [2, 4], // Terça e Quinta
                    },
                ],
            },
        },
    });

    const servicoManicure2 = await prisma.service.create({
        data: {
            name: 'Unhas em Gel',
            description: 'Aplicação de unhas em gel com design personalizado.',
            providerId: manicure.id,
            category: 'Manicure',
            photos: ['https://images.unsplash.com/photo-1610992015732-2449b76344bc?w=500'],
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

    const servicoPersonal1 = await prisma.service.create({
        data: {
            name: 'Personal Training',
            description: 'Treino personalizado com acompanhamento profissional.',
            providerId: personal.id,
            category: 'Personal Trainer',
            photos: ['https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=500'],
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
                        discount_percentage: 10,
                        discount_days: [1, 2, 3, 4, 5], // Todos os dias úteis
                    },
                    {
                        name: 'Pacote 10 Sessões',
                        price: 850.00,
                        duration_minutes: 60,
                        discount_percentage: 15,
                        discount_days: [1, 2, 3, 4, 5],
                    },
                ],
            },
        },
    });

    const servicoPersonal2 = await prisma.service.create({
        data: {
            name: 'Avaliação Física',
            description: 'Avaliação física completa com bioimpedância e medidas.',
            providerId: personal.id,
            category: 'Personal Trainer',
            photos: ['https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500'],
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

    // 6. Criar Serviços da Massagista
    console.log('💆 Criando serviços de massagem...');

    const servicoMassagem = await prisma.service.create({
        data: {
            name: 'Massagem Relaxante',
            description: 'Massagem terapêutica para alívio de tensões e relaxamento.',
            providerId: massagista.id,
            category: 'Massagem',
            photos: ['https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=500'],
            variations: {
                create: [
                    {
                        name: 'Massagem 30 minutos',
                        price: 60.00,
                        duration_minutes: 30,
                    },
                    {
                        name: 'Massagem 60 minutos',
                        price: 100.00,
                        duration_minutes: 60,
                        discount_percentage: 15,
                        discount_days: [0, 6], // Domingo e Sábado
                    },
                    {
                        name: 'Massagem 90 minutos',
                        price: 140.00,
                        duration_minutes: 90,
                    },
                ],
            },
        },
    });

    // 7. Criar Serviços do Eletricista
    console.log('⚡ Criando serviços de eletricista...');

    const servicoEletricista = await prisma.service.create({
        data: {
            name: 'Serviços Elétricos Residenciais',
            description: 'Instalação e manutenção elétrica residencial.',
            providerId: eletricista.id,
            category: 'Eletricista',
            photos: ['https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500'],
            variations: {
                create: [
                    {
                        name: 'Instalação de Tomadas/Interruptores',
                        price: 80.00,
                        duration_minutes: 60,
                    },
                    {
                        name: 'Instalação de Ventilador de Teto',
                        price: 120.00,
                        duration_minutes: 90,
                    },
                    {
                        name: 'Manutenção Elétrica Geral',
                        price: 150.00,
                        duration_minutes: 120,
                    },
                ],
            },
        },
    });

    // 8. Criar Disponibilidades
    console.log('📅 Criando disponibilidades...');

    const providers = [barbeiro, manicure, personal, massagista, eletricista];
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

    // Massagista também trabalha no fim de semana
    await prisma.availability.create({
        data: {
            providerId: massagista.id,
            day_of_week: 6, // Sábado
            start_time: new Date('1970-01-01T10:00:00Z'),
            end_time: new Date('1970-01-01T16:00:00Z'),
        },
    });

    await prisma.availability.create({
        data: {
            providerId: massagista.id,
            day_of_week: 0, // Domingo
            start_time: new Date('1970-01-01T10:00:00Z'),
            end_time: new Date('1970-01-01T14:00:00Z'),
        },
    });

    // 9. Buscar variações de serviços para criar agendamentos
    console.log('📅 Criando agendamentos...');

    const variacaoBarbeiro = await prisma.serviceVariation.findFirst({
        where: { service: { providerId: barbeiro.id } },
        include: { service: true }
    });

    const variacaoManicure = await prisma.serviceVariation.findFirst({
        where: { service: { providerId: manicure.id } },
        include: { service: true }
    });

    const variacaoPersonal = await prisma.serviceVariation.findFirst({
        where: { service: { providerId: personal.id } },
        include: { service: true }
    });

    const variacaoMassagem = await prisma.serviceVariation.findFirst({
        where: { service: { providerId: massagista.id } },
        include: { service: true }
    });

    // Agendamentos Passados (Concluídos)
    if (variacaoBarbeiro) {
        const booking1 = await prisma.booking.create({
            data: {
                clientId: cliente1.id,
                serviceVariationId: variacaoBarbeiro.id,
                start_time: new Date(Date.now() - 7 * 86400000), // 7 dias atrás
                end_time: new Date(Date.now() - 7 * 86400000 + variacaoBarbeiro.duration_minutes * 60000),
                status: 'COMPLETED',
                final_price: variacaoBarbeiro.price,
            }
        });

        await prisma.review.create({
            data: {
                serviceId: variacaoBarbeiro.serviceId,
                clientId: cliente1.id,
                rating: 5,
                comment: 'Excelente serviço! Muito profissional e atencioso. Recomendo!',
            }
        });
    }

    if (variacaoManicure) {
        const booking2 = await prisma.booking.create({
            data: {
                clientId: cliente2.id,
                serviceVariationId: variacaoManicure.id,
                start_time: new Date(Date.now() - 5 * 86400000), // 5 dias atrás
                end_time: new Date(Date.now() - 5 * 86400000 + variacaoManicure.duration_minutes * 60000),
                status: 'COMPLETED',
                final_price: variacaoManicure.price,
            }
        });

        await prisma.review.create({
            data: {
                serviceId: variacaoManicure.serviceId,
                clientId: cliente2.id,
                rating: 5,
                comment: 'Adorei! Ficou perfeito, super caprichado.',
            }
        });
    }

    if (variacaoPersonal) {
        const booking3 = await prisma.booking.create({
            data: {
                clientId: cliente3.id,
                serviceVariationId: variacaoPersonal.id,
                start_time: new Date(Date.now() - 3 * 86400000), // 3 dias atrás
                end_time: new Date(Date.now() - 3 * 86400000 + variacaoPersonal.duration_minutes * 60000),
                status: 'COMPLETED',
                final_price: variacaoPersonal.price,
            }
        });

        await prisma.review.create({
            data: {
                serviceId: variacaoPersonal.serviceId,
                clientId: cliente3.id,
                rating: 4,
                comment: 'Muito bom! Treino bem planejado e personalizado.',
            }
        });
    }

    // Agendamento Cancelado
    if (variacaoMassagem) {
        const bookingCancelado = await prisma.booking.create({
            data: {
                clientId: cliente4.id,
                serviceVariationId: variacaoMassagem.id,
                start_time: new Date(Date.now() - 2 * 86400000), // 2 dias atrás
                end_time: new Date(Date.now() - 2 * 86400000 + variacaoMassagem.duration_minutes * 60000),
                status: 'CANCELLED',
                final_price: variacaoMassagem.price,
            }
        });

        await prisma.notification.create({
            data: {
                providerId: massagista.id,
                type: 'BOOKING_CANCELLED',
                title: 'Agendamento Cancelado',
                message: `${cliente4.name} cancelou o agendamento de ${variacaoMassagem.name}.`,
                bookingId: bookingCancelado.id,
                read: false,
            }
        });
    }

    // Agendamentos Futuros (Confirmados)
    if (variacaoBarbeiro) {
        const futureBooking1 = await prisma.booking.create({
            data: {
                clientId: cliente2.id,
                serviceVariationId: variacaoBarbeiro.id,
                start_time: new Date(Date.now() + 1 * 86400000), // Amanhã
                end_time: new Date(Date.now() + 1 * 86400000 + variacaoBarbeiro.duration_minutes * 60000),
                status: 'CONFIRMED',
                final_price: variacaoBarbeiro.price,
            }
        });

        await prisma.notification.create({
            data: {
                providerId: barbeiro.id,
                type: 'NEW_BOOKING',
                title: 'Novo Agendamento',
                message: `${cliente2.name} agendou ${variacaoBarbeiro.name} para amanhã.`,
                bookingId: futureBooking1.id,
                read: false,
            }
        });
    }

    if (variacaoManicure) {
        const futureBooking2 = await prisma.booking.create({
            data: {
                clientId: cliente1.id,
                serviceVariationId: variacaoManicure.id,
                start_time: new Date(Date.now() + 2 * 86400000), // Daqui 2 dias
                end_time: new Date(Date.now() + 2 * 86400000 + variacaoManicure.duration_minutes * 60000),
                status: 'CONFIRMED',
                final_price: variacaoManicure.price,
            }
        });

        await prisma.notification.create({
            data: {
                providerId: manicure.id,
                type: 'NEW_BOOKING',
                title: 'Novo Agendamento',
                message: `${cliente1.name} agendou ${variacaoManicure.name} para daqui 2 dias.`,
                bookingId: futureBooking2.id,
                read: false,
            }
        });
    }

    if (variacaoPersonal) {
        const futureBooking3 = await prisma.booking.create({
            data: {
                clientId: cliente4.id,
                serviceVariationId: variacaoPersonal.id,
                start_time: new Date(Date.now() + 3 * 86400000), // Daqui 3 dias
                end_time: new Date(Date.now() + 3 * 86400000 + variacaoPersonal.duration_minutes * 60000),
                status: 'CONFIRMED',
                final_price: variacaoPersonal.price,
            }
        });

        await prisma.notification.create({
            data: {
                providerId: personal.id,
                type: 'NEW_BOOKING',
                title: 'Novo Agendamento',
                message: `${cliente4.name} agendou ${variacaoPersonal.name} para daqui 3 dias.`,
                bookingId: futureBooking3.id,
                read: false,
            }
        });
    }

    if (variacaoMassagem) {
        const futureBooking4 = await prisma.booking.create({
            data: {
                clientId: cliente3.id,
                serviceVariationId: variacaoMassagem.id,
                start_time: new Date(Date.now() + 5 * 86400000), // Daqui 5 dias
                end_time: new Date(Date.now() + 5 * 86400000 + variacaoMassagem.duration_minutes * 60000),
                status: 'CONFIRMED',
                final_price: variacaoMassagem.price,
            }
        });

        await prisma.notification.create({
            data: {
                providerId: massagista.id,
                type: 'NEW_BOOKING',
                title: 'Novo Agendamento',
                message: `${cliente3.name} agendou ${variacaoMassagem.name} para daqui 5 dias.`,
                bookingId: futureBooking4.id,
                read: true, // Esta já foi lida
            }
        });
    }

    // Criar mais algumas avaliações para outros serviços
    console.log('⭐ Criando avaliações adicionais...');

    const servicoBarbeiroId = servicoBarbeiro1.id;
    const servicoManicureId = servicoManicure1.id;

    // Cliente 3 avalia serviço do barbeiro (sem ter agendado - para testar validação)
    // Na verdade, vamos criar um agendamento passado primeiro
    if (variacaoBarbeiro) {
        await prisma.booking.create({
            data: {
                clientId: cliente3.id,
                serviceVariationId: variacaoBarbeiro.id,
                start_time: new Date(Date.now() - 10 * 86400000),
                end_time: new Date(Date.now() - 10 * 86400000 + variacaoBarbeiro.duration_minutes * 60000),
                status: 'COMPLETED',
                final_price: variacaoBarbeiro.price,
            }
        });

        await prisma.review.create({
            data: {
                serviceId: servicoBarbeiroId,
                clientId: cliente3.id,
                rating: 4,
                comment: 'Muito bom! Ambiente agradável e profissional competente.',
            }
        });
    }

    // 10. Popular Serviços Populares no Redis (Visualizações Simuladas)
    console.log('📊 Populando visualizações de serviços no Redis...');

    // Buscar todos os serviços criados
    const allServices = await prisma.service.findMany({
        select: { id: true, name: true }
    });

    // Simular visualizações com números variados para criar um ranking
    const viewCounts = [
        { views: 150, serviceIndex: 0 }, // Corte de Cabelo (mais popular)
        { views: 120, serviceIndex: 1 }, // Barba
        { views: 100, serviceIndex: 2 }, // Manicure e Pedicure
        { views: 85, serviceIndex: 3 },  // Unhas em Gel
        { views: 70, serviceIndex: 4 },  // Personal Training
        { views: 55, serviceIndex: 5 },  // Avaliação Física
        { views: 40, serviceIndex: 6 },  // Massagem
        { views: 25, serviceIndex: 7 },  // Eletricista
    ];

    for (const { views, serviceIndex } of viewCounts) {
        if (allServices[serviceIndex]) {
            const serviceId = allServices[serviceIndex].id;

            // Incrementar visualizações
            await redis.set(`service:${serviceId}:views`, views);

            // Adicionar ao ranking de populares (sorted set)
            await redis.zadd('popular_services', views, serviceId);
        }
    }

    console.log('✅ Seed concluído com sucesso!');
    console.log('\\n📊 Resumo:');
    console.log(`   - 9 usuários criados (5 prestadores + 4 clientes)`);
    console.log(`   - 8 serviços criados`);
    console.log(`   - 24 variações de serviços criadas`);
    console.log(`   - 27 disponibilidades criadas`);
    console.log(`   - 8 agendamentos criados (4 concluídos, 1 cancelado, 3 futuros)`);
    console.log(`   - 4 avaliações criadas`);
    console.log(`   - 4 notificações criadas`);
    console.log(`   - Visualizações de serviços populadas no Redis`);
    console.log('\\n🔐 Credenciais de acesso:');
    console.log('   Senha padrão para todos: 123456');
    console.log('\\n   Prestadores:');
    console.log('   - joao.barbeiro@email.com (Barbearia)');
    console.log('   - maria.manicure@email.com (Manicure)');
    console.log('   - carlos.personal@email.com (Personal Trainer)');
    console.log('   - fernanda.massagem@email.com (Massagem)');
    console.log('   - roberto.eletricista@email.com (Eletricista)');
    console.log('\\n   Clientes:');
    console.log('   - ana.cliente@email.com');
    console.log('   - pedro.cliente@email.com');
    console.log('   - julia.cliente@email.com');
    console.log('   - lucas.cliente@email.com');
}

main()
    .catch((e) => {
        console.error('❌ Erro ao executar seed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
        await redis.quit();
    });
