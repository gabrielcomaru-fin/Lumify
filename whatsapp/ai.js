/**
 * Módulo de parsing de linguagem natural para dados financeiros.
 * Suporta OpenAI, Google Gemini e Anthropic via variáveis de ambiente:
 *   AI_PROVIDER = openai | gemini | anthropic
 *   AI_API_KEY  = chave da API
 *   AI_MODEL    = modelo específico (opcional, usa padrão por provedor)
 */

const PROVIDER = (process.env.AI_PROVIDER || 'gemini').toLowerCase();
const API_KEY = process.env.AI_API_KEY;
const MODEL = process.env.AI_MODEL;

const DEFAULTS = {
    openai: 'gpt-4o-mini',
    gemini: 'gemini-2.5-flash',
    anthropic: 'claude-3-haiku-20240307',
};

function buildSystemPrompt(categorias) {
    const hoje = new Date().toISOString().split('T')[0];
    const listaCategorias = categorias
        .map((c) => `  - id: "${c.id}", nome: "${c.nome}", tipo: "${c.tipo}"`)
        .join('\n');

    return `Você é um assistente financeiro pessoal. Extraia informações financeiras da mensagem do usuário e retorne SOMENTE um objeto JSON válido, sem markdown, sem explicações.

Data de hoje: ${hoje}

Categorias disponíveis:
${listaCategorias}

Regras:
- "tipo" deve ser "gasto" ou "receita"
- "valor" deve ser um número positivo
- "descricao" deve ser uma descrição curta e limpa (máx. 100 chars)
- "categoria_id" deve ser o UUID da categoria mais adequada da lista acima, ou null se nenhuma se encaixar
- "data" deve estar no formato YYYY-MM-DD; use a data de hoje se não for mencionada

Responda APENAS com JSON no formato:
{"tipo":"gasto","valor":200,"descricao":"Gasolina","categoria_id":"uuid-ou-null","data":"${hoje}"}`;
}

async function parseWithOpenAI(mensagem, categorias) {
    const { OpenAI } = require('openai');
    const client = new OpenAI({ apiKey: API_KEY });
    const model = MODEL || DEFAULTS.openai;

    const response = await client.chat.completions.create({
        model,
        messages: [
            { role: 'system', content: buildSystemPrompt(categorias) },
            { role: 'user', content: mensagem },
        ],
        temperature: 0,
        response_format: { type: 'json_object' },
    });

    const text = response.choices[0].message.content;
    return JSON.parse(text);
}

const GEMINI_FALLBACK_MODELS = ['gemini-2.5-flash', 'gemini-2.5-flash-lite'];

function isGeminiModelNotFound(err) {
    const msg = String(err?.message || err);
    return msg.includes('404') || msg.includes('not found') || msg.includes('is not supported');
}

async function parseWithGemini(mensagem, categorias) {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(API_KEY);
    const candidates = [...new Set([MODEL || DEFAULTS.gemini, ...GEMINI_FALLBACK_MODELS])];

    const prompt = buildSystemPrompt(categorias) + '\n\nMensagem do usuário: ' + mensagem;
    let lastError;

    for (const modelName of candidates) {
        try {
            const generativeModel = genAI.getGenerativeModel({
                model: modelName,
                generationConfig: { responseMimeType: 'application/json', temperature: 0 },
            });
            const result = await generativeModel.generateContent(prompt);
            const text = result.response.text();
            return JSON.parse(text);
        } catch (err) {
            lastError = err;
            if (!isGeminiModelNotFound(err)) throw err;
            console.warn(`[AI] Modelo ${modelName} indisponível, tentando próximo...`);
        }
    }

    throw lastError;
}

async function parseWithAnthropic(mensagem, categorias) {
    const Anthropic = require('@anthropic-ai/sdk');
    const client = new Anthropic.default({ apiKey: API_KEY });
    const model = MODEL || DEFAULTS.anthropic;

    const response = await client.messages.create({
        model,
        max_tokens: 256,
        system: buildSystemPrompt(categorias),
        messages: [{ role: 'user', content: mensagem }],
    });

    const text = response.content[0].text;
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Resposta Anthropic sem JSON válido');
    return JSON.parse(jsonMatch[0]);
}

/**
 * Interpreta uma mensagem em linguagem natural e extrai dados financeiros.
 * @param {string} mensagem - Texto enviado pelo usuário no WhatsApp
 * @param {Array<{id, nome, tipo}>} categorias - Lista de categorias do usuário
 * @returns {Promise<{tipo, valor, descricao, categoria_id, data}>}
 */
async function parseFinanceiro(mensagem, categorias) {
    if (!API_KEY) {
        throw new Error('AI_API_KEY não configurada');
    }

    let resultado;
    switch (PROVIDER) {
        case 'gemini':
            resultado = await parseWithGemini(mensagem, categorias);
            break;
        case 'anthropic':
            resultado = await parseWithAnthropic(mensagem, categorias);
            break;
        case 'openai':
        default:
            resultado = await parseWithOpenAI(mensagem, categorias);
    }

    if (!resultado.tipo || !resultado.valor || !resultado.data) {
        throw new Error('Resposta da IA incompleta: ' + JSON.stringify(resultado));
    }

    return {
        tipo: resultado.tipo,
        valor: parseFloat(resultado.valor),
        descricao: (resultado.descricao || '').slice(0, 255),
        categoria_id: resultado.categoria_id || null,
        data: resultado.data,
    };
}

module.exports = { parseFinanceiro };
