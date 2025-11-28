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

// Dados para geração dinâmica
const NICHES = [
    {
        category: 'Cabelereiro',
        services: [
            {
                name: 'Corte de Cabelo',
                description: 'Corte moderno com acabamento na navalha e lavagem inclusa.',
                photos: ['https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=800'],
                variations: [
                    { name: 'Corte Simples', price: 45.00, duration: 30 },
                    { name: 'Corte + Barba', price: 80.00, duration: 60, discount: 10, days: [1, 2] }
                ]
            },
            {
                name: 'Barba Completa',
                description: 'Modelagem de barba com toalha quente e hidratação.',
                photos: ['https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=800'],
                variations: [
                    { name: 'Barba Express', price: 35.00, duration: 30 },
                    { name: 'Barba Terapia', price: 55.00, duration: 45 }
                ]
            }
        ]
    },
    {
        category: 'Manicure',
        services: [
            {
                name: 'Manicure e Pedicure',
                description: 'Cuidado completo para suas mãos e pés com esmaltes de alta qualidade.',
                photos: ['https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800'],
                variations: [
                    { name: 'Mão Simples', price: 30.00, duration: 30 },
                    { name: 'Pé Simples', price: 35.00, duration: 40 },
                    { name: 'Mão e Pé', price: 60.00, duration: 80, discount: 5, days: [2, 3] }
                ]
            },
            {
                name: 'Alongamento de Unhas',
                description: 'Técnicas modernas de alongamento em gel ou fibra.',
                photos: ['https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=800'],
                variations: [
                    { name: 'Aplicação Fibra', price: 150.00, duration: 120 },
                    { name: 'Manutenção', price: 90.00, duration: 90 }
                ]
            }
        ]
    },
    {
        category: 'Personal Trainer',
        services: [
            {
                name: 'Consultoria Online',
                description: 'Planilhas de treino personalizadas para seu objetivo.',
                photos: ['https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800'],
                variations: [
                    { name: 'Plano Mensal', price: 120.00, duration: 60 },
                    { name: 'Plano Trimestral', price: 300.00, duration: 60 }
                ]
            },
            {
                name: 'Aula Presencial',
                description: 'Acompanhamento exclusivo durante seu treino na academia.',
                photos: ['https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800'],
                variations: [
                    { name: 'Aula Avulsa', price: 80.00, duration: 60 },
                    { name: 'Pacote 10 Aulas', price: 700.00, duration: 60, discount: 10, days: [1, 3, 5] }
                ]
            }
        ]
    },
    {
        category: 'Massagem',
        services: [
            {
                name: 'Massagem Relaxante',
                description: 'Técnicas manuais para alívio do estresse e dores musculares.',
                photos: ['https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800'],
                variations: [
                    { name: 'Sessão 50min', price: 90.00, duration: 50 },
                    { name: 'Sessão 80min', price: 130.00, duration: 80 }
                ]
            },
            {
                name: 'Drenagem Linfática',
                description: 'Massagem para redução de retenção de líquidos.',
                photos: ['https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=800'],
                variations: [
                    { name: 'Sessão Única', price: 100.00, duration: 60 },
                    { name: 'Pacote 5 Sessões', price: 450.00, duration: 60 }
                ]
            }
        ]
    },
    {
        category: 'Eletricista',
        services: [
            {
                name: 'Instalações Elétricas',
                description: 'Serviços de instalação e reparo em rede elétrica residencial.',
                photos: ['https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800'],
                variations: [
                    { name: 'Visita Técnica', price: 80.00, duration: 60 },
                    { name: 'Instalação Chuveiro', price: 120.00, duration: 60 },
                    { name: 'Troca de Fiação (m²)', price: 45.00, duration: 120 }
                ]
            }
        ]
    },
    {
        category: 'Encanador',
        services: [
            {
                name: 'Reparos Hidráulicos',
                description: 'Conserto de vazamentos, pias, torneiras e tubulações.',
                photos: ['https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=800'],
                variations: [
                    { name: 'Visita Técnica', price: 70.00, duration: 60 },
                    { name: 'Desentupimento Simples', price: 150.00, duration: 90 }
                ]
            }
        ]
    },
    {
        category: 'Diarista',
        services: [
            {
                name: 'Faxina Residencial',
                description: 'Limpeza completa e detalhada da sua casa ou apartamento.',
                photos: ['https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800'],
                variations: [
                    { name: 'Apartamento Pequeno', price: 180.00, duration: 240 },
                    { name: 'Casa Média', price: 250.00, duration: 360 },
                    { name: 'Faxina Pesada', price: 350.00, duration: 480 }
                ]
            }
        ]
    },
    {
        category: 'Jardineiro',
        services: [
            {
                name: 'Manutenção de Jardim',
                description: 'Poda, corte de grama e cuidados gerais com suas plantas.',
                photos: ['https://images.unsplash.com/photo-1599687351724-dfa3c4ff81b1?w=800'],
                variations: [
                    { name: 'Manutenção Básica', price: 120.00, duration: 180 },
                    { name: 'Paisagismo (hora)', price: 200.00, duration: 60 }
                ]
            }
        ]
    },
    {
        category: 'Maquiagem',
        services: [
            {
                name: 'Maquiagem Social',
                description: 'Maquiagem profissional para eventos, festas e casamentos.',
                photos: ['https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=800'],
                variations: [
                    { name: 'Maquiagem Simples', price: 150.00, duration: 60 },
                    { name: 'Maquiagem Artística', price: 250.00, duration: 120 },
                    { name: 'Noiva', price: 500.00, duration: 180 }
                ]
            }
        ]
    },
    {
        category: 'Fotógrafo',
        services: [
            {
                name: 'Ensaio Fotográfico',
                description: 'Sessão de fotos profissional externa ou em estúdio.',
                photos: ['https://plus.unsplash.com/premium_vector-1725674962815-e76ff4e61fce?w=800'],
                variations: [
                    { name: 'Ensaio 1h', price: 300.00, duration: 60 },
                    { name: 'Ensaio 2h', price: 500.00, duration: 120 },
                    { name: 'Cobertura Evento (h)', price: 400.00, duration: 60 }
                ]
            }
        ]
    }
];

const FIRST_NAMES = ['Ana', 'Bruno', 'Carlos', 'Daniela', 'Eduardo', 'Fernanda', 'Gabriel', 'Helena', 'Igor', 'Julia', 'Lucas', 'Mariana', 'Nicolas', 'Olivia', 'Pedro', 'Rafaela', 'Samuel', 'Tatiana', 'Vitor', 'Yasmin'];
const LAST_NAMES = ['Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves', 'Pereira', 'Lima', 'Gomes', 'Costa', 'Ribeiro', 'Martins', 'Carvalho', 'Almeida', 'Lopes', 'Soares', 'Fernandes', 'Vieira', 'Barbosa'];

function getRandomElement<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
}

async function main() {
    console.log('🌱 Iniciando seed do banco de dados...');

    // Limpar dados existentes
    console.log('🧹 Limpando dados existentes...');
    await redis.del('popular_services'); // Limpa ranking de populares
    await prisma.notification.deleteMany();
    await prisma.review.deleteMany();
    await prisma.booking.deleteMany();
    await prisma.availability.deleteMany();
    await prisma.serviceVariation.deleteMany();
    await prisma.service.deleteMany();
    await prisma.refreshToken.deleteMany();
    await prisma.user.deleteMany();

    const hashedPassword = await bcrypt.hash('123456', 10);

    // Criar Clientes (5 clientes fixos)
    console.log('👥 Criando clientes...');
    const clients = [];
    for (let i = 1; i <= 5; i++) {
        const client = await prisma.user.create({
            data: {
                name: `Cliente ${i}`,
                email: `cliente${i}@email.com`,
                password_hash: hashedPassword,
                role: 'CLIENT',
                phone: `1199999000${i}`,
            },
        });
        clients.push(client);

        console.log(`Criando clientes, email: cliente${i}@email.com`);
    }

    // Criar 10 Prestadores
    console.log('👤 Criando 10 prestadores e seus serviços...');
    const providers = [];
    const allServices = [];

    for (let i = 0; i < 10; i++) {
        const nicheIndex = i % NICHES.length; // Distribui equitativamente entre os nichos
        const niche = NICHES[nicheIndex];

        const firstName = getRandomElement(FIRST_NAMES);
        const lastName = getRandomElement(LAST_NAMES);
        const fullName = `${firstName} ${lastName}`;
        const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@email.com`; // Adiciona índice para garantir unicidade
        console.log(`Criando prestador, email: ${email}`);

        // Criar Prestador
        const provider = await prisma.user.create({
            data: {
                name: fullName,
                email: email,
                password_hash: hashedPassword,
                role: 'PROVIDER',
                phone: `119${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
            },
        });
        providers.push(provider);
        console.log('Senha de todos os usuários: 123456')

        // Criar Disponibilidade (Seg-Sex, 9h-18h)
        for (let day = 1; day <= 5; day++) {
            await prisma.availability.create({
                data: {
                    providerId: provider.id,
                    day_of_week: day,
                    start_time: new Date('1970-01-01T09:00:00Z'),
                    end_time: new Date('1970-01-01T18:00:00Z'),
                },
            });
        }

        // Criar Serviços do Nicho
        for (const serviceData of niche.services) {
            const service = await prisma.service.create({
                data: {
                    name: serviceData.name,
                    description: serviceData.description,
                    providerId: provider.id,
                    category: niche.category,
                    photos: serviceData.photos,
                    variations: {
                        create: serviceData.variations.map(v => ({
                            name: v.name,
                            price: v.price,
                            duration_minutes: v.duration,
                            discount_percentage: v.discount || 0,
                            discount_days: v.days || [],
                        }))
                    }
                },
                include: { variations: true }
            });
            allServices.push(service);
        }
    }

    // Criar Agendamentos e Avaliações Aleatórias
    console.log('📅 Criando histórico de agendamentos e avaliações...');

    for (const client of clients) {
        // Cada cliente faz 3-5 agendamentos
        const numBookings = Math.floor(Math.random() * 3) + 3;

        for (let j = 0; j < numBookings; j++) {
            const randomService = getRandomElement(allServices);
            const randomVariation = getRandomElement(randomService.variations);

            // 70% chance de ser passado (COMPLETED), 20% futuro (CONFIRMED), 10% cancelado
            const rand = Math.random();
            let status: 'COMPLETED' | 'CONFIRMED' | 'CANCELLED';
            let startTime: Date;

            if (rand < 0.7) {
                status = 'COMPLETED';
                const daysAgo = Math.floor(Math.random() * 30) + 1;
                startTime = new Date(Date.now() - daysAgo * 86400000);
            } else if (rand < 0.9) {
                status = 'CONFIRMED';
                const daysAhead = Math.floor(Math.random() * 14) + 1;
                startTime = new Date(Date.now() + daysAhead * 86400000);
            } else {
                status = 'CANCELLED';
                const daysAgo = Math.floor(Math.random() * 10) + 1;
                startTime = new Date(Date.now() - daysAgo * 86400000);
            }

            const endTime = new Date(startTime.getTime() + randomVariation.duration_minutes * 60000);

            const booking = await prisma.booking.create({
                data: {
                    clientId: client.id,
                    serviceVariationId: randomVariation.id,
                    start_time: startTime,
                    end_time: endTime,
                    status: status,
                    final_price: randomVariation.price,
                }
            });

            // Se completado, criar avaliação
            if (status === 'COMPLETED') {
                const rating = Math.floor(Math.random() * 2) + 4; // 4 ou 5 estrelas
                const comments = [
                    'Excelente profissional!',
                    'Gostei muito, recomendo.',
                    'Serviço impecável.',
                    'Muito atencioso e pontual.',
                    'Voltarei com certeza!'
                ];

                // Verifica se já existe avaliação deste cliente para este serviço
                const existingReview = await prisma.review.findUnique({
                    where: {
                        serviceId_clientId: {
                            serviceId: randomService.id,
                            clientId: client.id
                        }
                    }
                });

                if (!existingReview) {
                    await prisma.review.create({
                        data: {
                            serviceId: randomService.id,
                            clientId: client.id,
                            rating: rating,
                            comment: getRandomElement(comments),
                        }
                    });
                }
            }
        }
    }

    // Popular Redis com visualizações
    console.log('📊 Populando visualizações no Redis...');
    for (const service of allServices) {
        // Gera um número de visualizações aleatório entre 10 e 500
        const views = Math.floor(Math.random() * 490) + 10;
        await redis.set(`service:${service.id}:views`, views);
        await redis.zadd('popular_services', views, service.id);
    }

    console.log('✅ Seed concluído com sucesso!');
    console.log(`   - 10 prestadores criados em ${NICHES.length} nichos`);
    console.log(`   - ${clients.length} clientes criados`);
    console.log(`   - ${allServices.length} serviços criados`);
    console.log('   - Agendamentos e avaliações gerados aleatoriamente');
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
