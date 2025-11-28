import { transporter, EMAIL_FROM } from '../config/email';

interface BookingEmailData {
    providerName: string;
    providerEmail: string;
    clientName: string;
    serviceName: string;
    variationName: string;
    startTime: Date;
    endTime: Date;
    finalPrice: string;
}

/**
 * Envia email de notificação de novo agendamento para o prestador
 */
export const sendBookingNotification = async (data: BookingEmailData): Promise<void> => {
    const { providerName, providerEmail, clientName, serviceName, variationName, startTime, endTime, finalPrice } = data;

    const formattedDate = new Intl.DateTimeFormat('pt-BR', {
        dateStyle: 'full',
        timeStyle: 'short',
        timeZone: 'America/Sao_Paulo',
    }).format(startTime);

    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .info-box { background: white; padding: 20px; margin: 20px 0; border-left: 4px solid #667eea; border-radius: 5px; }
                .info-row { margin: 10px 0; }
                .label { font-weight: bold; color: #667eea; }
                .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🎉 Novo Agendamento!</h1>
                </div>
                <div class="content">
                    <p>Olá <strong>${providerName}</strong>,</p>
                    <p>Você recebeu um novo agendamento! Confira os detalhes abaixo:</p>
                    
                    <div class="info-box">
                        <div class="info-row">
                            <span class="label">Cliente:</span> ${clientName}
                        </div>
                        <div class="info-row">
                            <span class="label">Serviço:</span> ${serviceName} - ${variationName}
                        </div>
                        <div class="info-row">
                            <span class="label">Data e Hora:</span> ${formattedDate}
                        </div>
                        <div class="info-row">
                            <span class="label">Valor:</span> R$ ${finalPrice}
                        </div>
                    </div>
                    
                    <p>Prepare-se para oferecer um excelente atendimento! 💪</p>
                </div>
                <div class="footer">
                    <p>Mini Marketplace - Conectando prestadores e clientes</p>
                </div>
            </div>
        </body>
        </html>
    `;

    try {
        await transporter.sendMail({
            from: EMAIL_FROM,
            to: providerEmail,
            subject: `🎉 Novo Agendamento - ${serviceName}`,
            html: htmlContent,
        });
        console.log(`✓ Email de agendamento enviado para ${providerEmail}`);
    } catch (error) {
        console.error('Erro ao enviar email de agendamento:', error);
        // Não lançar erro para não quebrar o fluxo principal
    }
};

/**
 * Envia email de notificação de cancelamento de agendamento
 */
export const sendBookingCancellation = async (data: BookingEmailData): Promise<void> => {
    const { providerName, providerEmail, clientName, serviceName, variationName, startTime } = data;

    const formattedDate = new Intl.DateTimeFormat('pt-BR', {
        dateStyle: 'full',
        timeStyle: 'short',
        timeZone: 'America/Sao_Paulo',
    }).format(startTime);

    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .info-box { background: white; padding: 20px; margin: 20px 0; border-left: 4px solid #f5576c; border-radius: 5px; }
                .info-row { margin: 10px 0; }
                .label { font-weight: bold; color: #f5576c; }
                .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>❌ Agendamento Cancelado</h1>
                </div>
                <div class="content">
                    <p>Olá <strong>${providerName}</strong>,</p>
                    <p>Informamos que um agendamento foi cancelado:</p>
                    
                    <div class="info-box">
                        <div class="info-row">
                            <span class="label">Cliente:</span> ${clientName}
                        </div>
                        <div class="info-row">
                            <span class="label">Serviço:</span> ${serviceName} - ${variationName}
                        </div>
                        <div class="info-row">
                            <span class="label">Data e Hora:</span> ${formattedDate}
                        </div>
                    </div>
                    
                    <p>Este horário agora está disponível para novos agendamentos.</p>
                </div>
                <div class="footer">
                    <p>Mini Marketplace - Conectando prestadores e clientes</p>
                </div>
            </div>
        </body>
        </html>
    `;

    try {
        await transporter.sendMail({
            from: EMAIL_FROM,
            to: providerEmail,
            subject: `❌ Agendamento Cancelado - ${serviceName}`,
            html: htmlContent,
        });
        console.log(`✓ Email de cancelamento enviado para ${providerEmail}`);
    } catch (error) {
        console.error('Erro ao enviar email de cancelamento:', error);
        // Não lançar erro para não quebrar o fluxo principal
    }
};

/**
 * Envia email de boas-vindas para novos usuários
 */
export const sendWelcomeEmail = async (name: string, email: string, role: 'CLIENT' | 'PROVIDER'): Promise<void> => {
    const roleText = role === 'PROVIDER' ? 'prestador de serviços' : 'cliente';
    const welcomeMessage = role === 'PROVIDER'
        ? 'Comece cadastrando seus serviços e definindo sua disponibilidade!'
        : 'Explore nossos serviços e faça seu primeiro agendamento!';

    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .cta-button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>👋 Bem-vindo ao Mini Marketplace!</h1>
                </div>
                <div class="content">
                    <p>Olá <strong>${name}</strong>,</p>
                    <p>É um prazer ter você conosco como ${roleText}!</p>
                    <p>${welcomeMessage}</p>
                    <p>Estamos aqui para conectar pessoas e facilitar o acesso a serviços de qualidade.</p>
                    <p style="text-align: center;">
                        <strong>Vamos começar? 🚀</strong>
                    </p>
                </div>
                <div class="footer">
                    <p>Mini Marketplace - Conectando prestadores e clientes</p>
                </div>
            </div>
        </body>
        </html>
    `;

    try {
        await transporter.sendMail({
            from: EMAIL_FROM,
            to: email,
            subject: '👋 Bem-vindo ao Mini Marketplace!',
            html: htmlContent,
        });
        console.log(`✓ Email de boas-vindas enviado para ${email}`);
    } catch (error) {
        console.error('Erro ao enviar email de boas-vindas:', error);
        // Não lançar erro para não quebrar o fluxo principal
    }
};
