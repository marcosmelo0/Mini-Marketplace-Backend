import nodemailer from 'nodemailer';

// Configuração do transporter SMTP
export const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465', // true para porta 465, false para outras portas
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

// Verificar conexão SMTP na inicialização
export const verifyEmailConnection = async () => {
    try {
        await transporter.verify();
        console.log('✓ Email service connected');
    } catch (error) {
        console.error('✗ Email service connection failed:', error);
        console.warn('⚠️  Email notifications will not be sent');
    }
};

// Endereço de email padrão do remetente
export const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@minimarketplace.com';
