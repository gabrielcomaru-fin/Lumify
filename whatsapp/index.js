const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');

const app = express();

app.get('/', (req, res) => {
    res.send('Bot online');
});

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--single-process'
        ]
    }
});

client.on('qr', (qr) => {
    console.log('==============================');
    console.log('QR RECEBIDO');
    console.log('==============================');

    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('==============================');
    console.log('WhatsApp conectado!');
    console.log('==============================');
});

client.on('authenticated', () => {
    console.log('Autenticado com sucesso!');
});

client.on('auth_failure', (msg) => {
    console.error('Falha na autenticação:', msg);
});

client.on('disconnected', (reason) => {
    console.log('Cliente desconectado:', reason);
});

client.on('message', async (message) => {
    try {
        if (message.body === '!ping') {
            await message.reply('pong');
        }
    } catch (error) {
        console.error('Erro ao responder mensagem:', error);
    }
});

client.initialize();

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
    console.log('==============================');
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log('==============================');
});