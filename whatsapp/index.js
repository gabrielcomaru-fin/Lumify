const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const QRCode = require('qrcode');
const express = require('express');
const { getUserByPhone, getCategorias, insertGasto, insertReceita, insertLog } = require('./supabase');
const { parseFinanceiro } = require('./ai');

const app = express();

// ─── Estado do bot ───────────────────────────────────────────────────────────

let botConnected = false;
let currentQrData = null; // string raw do QR (para gerar imagem base64)

// ─── Middleware de autenticação admin ────────────────────────────────────────

function requireAdminToken(req, res, next) {
    const token = req.headers['x-admin-token'];
    if (!token || token !== process.env.BOT_ADMIN_TOKEN) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
}

// ─── Endpoints HTTP ──────────────────────────────────────────────────────────

app.get('/', (req, res) => {
    res.send('Bot online');
});

app.get('/status', requireAdminToken, (req, res) => {
    res.json({ connected: botConnected });
});

app.get('/qr', requireAdminToken, async (req, res) => {
    if (botConnected) {
        return res.json({ connected: true, qr: null });
    }
    if (!currentQrData) {
        return res.json({ connected: false, qr: null, message: 'QR ainda não gerado' });
    }
    try {
        const qrBase64 = await QRCode.toDataURL(currentQrData);
        res.json({ connected: false, qr: qrBase64 });
    } catch (err) {
        res.status(500).json({ error: 'Erro ao gerar QR' });
    }
});

// ─── Cliente WhatsApp ────────────────────────────────────────────────────────

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
    currentQrData = qr;
    botConnected = false;
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('==============================');
    console.log('WhatsApp conectado!');
    console.log('==============================');
    botConnected = true;
    currentQrData = null;
});

client.on('authenticated', () => {
    console.log('Autenticado com sucesso!');
});

client.on('auth_failure', (msg) => {
    console.error('Falha na autenticação:', msg);
    botConnected = false;
});

client.on('disconnected', (reason) => {
    console.log('Cliente desconectado:', reason);
    botConnected = false;
    currentQrData = null;
});

// ─── Mensagens de resposta ───────────────────────────────────────────────────

const MSG_AJUDA = `*Lumify — Agente Financeiro* 🤖

Envie uma mensagem em linguagem natural e eu registro automaticamente:

• *Gastei 200 em gasolina*
• *Paguei 89,90 de internet*
• *Recebi 3000 de salário*
• *Ganhei 500 de freela*

Outros comandos:
• *!ajuda* — exibe esta mensagem

_Para vincular sua conta, acesse Lumify > Configurações > Agente WhatsApp._`;

const MSG_NAO_VINCULADO = `Seu número não está vinculado ao Lumify. 😕

Acesse o app em *Configurações → Agente WhatsApp* e cadastre este número para começar a registrar despesas pelo WhatsApp.`;

const MSG_ERRO_IA = `Não consegui entender sua mensagem. 🤔

Tente algo como:
• _Gastei 50 no mercado_
• _Recebi 1000 de salário_
• _Paguei 120 de conta de luz_`;

// ─── Formatadores ────────────────────────────────────────────────────────────

function formatarValor(valor) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatarData(dataStr) {
    const [ano, mes, dia] = dataStr.split('-');
    return `${dia}/${mes}/${ano}`;
}

function montarConfirmacao(tipo, { valor, descricao, categoria_id, data }, categorias) {
    const cat = categorias.find((c) => c.id === categoria_id);
    const emoji = tipo === 'gasto' ? '💸' : '💰';
    const tipoLabel = tipo === 'gasto' ? 'Despesa' : 'Receita';
    const catLabel = cat ? cat.nome : 'Sem categoria';
    return (
        `${emoji} *${tipoLabel} registrada!*\n\n` +
        `📌 *${descricao}*\n` +
        `💵 Valor: ${formatarValor(valor)}\n` +
        `🏷️ Categoria: ${catLabel}\n` +
        `📅 Data: ${formatarData(data)}`
    );
}

// ─── Handler de mensagens ────────────────────────────────────────────────────

client.on('message', async (message) => {
    if (message.isGroupMsg) return;

    const texto = message.body.trim();
    const phone = message.from.replace(/@c\.us$/, '').replace(/\D/g, '');

    if (texto.toLowerCase() === '!ajuda' || texto.toLowerCase() === '!help') {
        await message.reply(MSG_AJUDA);
        return;
    }

    if (texto.startsWith('!')) return;
    if (texto.length < 5) return;

    try {
        // 1. Verificar vínculo
        const usuario = await getUserByPhone(message.from);
        if (!usuario) {
            await message.reply(MSG_NAO_VINCULADO);
            await insertLog(phone, texto, 'not_linked');
            return;
        }

        // 2. Buscar categorias
        const categorias = await getCategorias(usuario.id);

        // 3. Interpretar com IA
        let dados;
        try {
            dados = await parseFinanceiro(texto, categorias);
        } catch (erroIA) {
            console.error('[AI] Erro ao interpretar mensagem:', erroIA.message);
            await message.reply(MSG_ERRO_IA);
            await insertLog(phone, texto, 'parse_error', null, erroIA.message);
            return;
        }

        // 4. Inserir no banco
        let inserido;
        if (dados.tipo === 'receita') {
            inserido = await insertReceita(usuario.id, dados);
        } else {
            inserido = await insertGasto(usuario.id, dados);
        }

        if (!inserido) {
            await message.reply('❌ Erro ao salvar no banco. Tente novamente em instantes.');
            await insertLog(phone, texto, 'error', dados, 'Falha ao inserir no banco');
            return;
        }

        // 5. Confirmar e logar
        const confirmacao = montarConfirmacao(dados.tipo, dados, categorias);
        await message.reply(confirmacao);
        await insertLog(phone, texto, 'success', dados);

    } catch (error) {
        console.error('[message] Erro inesperado:', error);
        await message.reply('❌ Ocorreu um erro inesperado. Tente novamente.');
        await insertLog(phone, texto, 'error', null, error.message);
    }
});

client.initialize();

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
    console.log('==============================');
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log('==============================');
});
