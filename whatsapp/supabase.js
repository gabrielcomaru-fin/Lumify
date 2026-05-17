const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Normaliza o número de WhatsApp para o formato armazenado no banco.
 * whatsapp-web.js entrega o número como "5511999998888@c.us".
 */
function normalizePhone(waId) {
    return waId.replace(/@c\.us$/, '').replace(/\D/g, '');
}

/**
 * Busca o usuário pelo número de WhatsApp.
 * @returns {{ id, nome } | null}
 */
async function getUserByPhone(waId) {
    const phone = normalizePhone(waId);
    const { data, error } = await supabase
        .from('usuarios')
        .select('id, nome')
        .eq('whatsapp_phone', phone)
        .single();

    if (error || !data) return null;
    return data;
}

/**
 * Busca as categorias de gasto e receita do usuário.
 * Inclui categorias padrão (usuario_id null) e as do próprio usuário.
 * @returns {Array<{ id, nome, tipo }>}
 */
async function getCategorias(userId) {
    const { data, error } = await supabase
        .from('categorias')
        .select('id, nome, tipo')
        .in('tipo', ['gasto', 'receita'])
        .or(`usuario_id.eq.${userId},usuario_id.is.null`)
        .order('nome');

    if (error) {
        console.error('[supabase] Erro ao buscar categorias:', error.message);
        return [];
    }
    return data || [];
}

/**
 * Insere um gasto para o usuário.
 * @param {string} userId
 * @param {{ valor: number, descricao: string, categoria_id: string|null, data: string }} payload
 * @returns {{ id: string } | null}
 */
async function insertGasto(userId, { valor, descricao, categoria_id, data }) {
    const { data: row, error } = await supabase
        .from('gastos')
        .insert({
            usuario_id: userId,
            valor,
            descricao,
            categoria_id: categoria_id || null,
            data,
            pago: true,
        })
        .select('id')
        .single();

    if (error) {
        console.error('[supabase] Erro ao inserir gasto:', error.message);
        return null;
    }
    return row;
}

/**
 * Insere uma receita para o usuário.
 * @param {string} userId
 * @param {{ valor: number, descricao: string, data: string }} payload
 * @returns {{ id: string } | null}
 */
async function insertReceita(userId, { valor, descricao, data }) {
    const { data: row, error } = await supabase
        .from('receitas')
        .insert({
            usuario_id: userId,
            valor,
            descricao,
            data,
        })
        .select('id')
        .single();

    if (error) {
        console.error('[supabase] Erro ao inserir receita:', error.message);
        return null;
    }
    return row;
}

/**
 * Insere um registro de log de mensagem processada.
 * @param {string} phone - Número normalizado do remetente
 * @param {string} message - Texto original da mensagem
 * @param {'success'|'error'|'not_linked'|'parse_error'} status
 * @param {object|null} result - Dados extraídos (para status success)
 * @param {string|null} error_msg - Mensagem de erro (para status error/parse_error)
 */
async function insertLog(phone, message, status, result = null, error_msg = null) {
    const { error } = await supabase
        .from('whatsapp_logs')
        .insert({ phone, message, status, result, error_msg });

    if (error) {
        console.error('[supabase] Erro ao inserir log:', error.message);
    }
}

module.exports = { getUserByPhone, getCategorias, insertGasto, insertReceita, insertLog };
