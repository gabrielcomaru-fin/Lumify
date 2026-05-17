import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
    Wifi,
    WifiOff,
    QrCode,
    RefreshCw,
    MessageSquare,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Clock,
    ShieldCheck,
    Loader2,
} from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { config } from '@/config/env';

const BOT_URL = config.botUrl;
const BOT_TOKEN = config.botAdminToken;

// ─── Utilitários ─────────────────────────────────────────────────────────────

async function fetchBot(path) {
    if (!BOT_URL) throw new Error('VITE_BOT_URL não configurada no Vercel');
    if (!BOT_TOKEN) throw new Error('VITE_BOT_ADMIN_TOKEN não configurada no Vercel');
    const res = await fetch(`${BOT_URL}${path}`, {
        headers: { 'x-admin-token': BOT_TOKEN },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} — verifique BOT_ADMIN_TOKEN`);
    return res.json();
}

function formatDate(ts) {
    return new Date(ts).toLocaleString('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
}

function statusBadge(status) {
    const map = {
        success:     { label: 'Sucesso',       variant: 'default',     icon: CheckCircle,    cls: 'bg-green-500/10 text-green-600 border-green-500/20' },
        error:       { label: 'Erro',           variant: 'destructive', icon: XCircle,        cls: 'bg-red-500/10 text-red-600 border-red-500/20' },
        not_linked:  { label: 'Não vinculado',  variant: 'secondary',   icon: AlertTriangle,  cls: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' },
        parse_error: { label: 'Erro de parsing',variant: 'destructive', icon: XCircle,        cls: 'bg-orange-500/10 text-orange-600 border-orange-500/20' },
    };
    const s = map[status] || { label: status, cls: '' };
    const Icon = s.icon || Clock;
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${s.cls}`}>
            <Icon className="w-3 h-3" />
            {s.label}
        </span>
    );
}

// ─── Painel de Status ────────────────────────────────────────────────────────

function StatusPanel() {
    const [connected, setConnected] = useState(null);
    const [loading, setLoading] = useState(true);
    const [lastCheck, setLastCheck] = useState(null);
    const [fetchError, setFetchError] = useState(null);

    const check = useCallback(async () => {
        setLoading(true);
        setFetchError(null);
        try {
            const data = await fetchBot('/status');
            setConnected(data.connected);
        } catch (err) {
            setConnected(null);
            setFetchError(err.message);
            console.error('[Admin/status]', err.message);
        } finally {
            setLoading(false);
            setLastCheck(new Date());
        }
    }, []);

    useEffect(() => {
        check();
        const id = setInterval(check, 30000);
        return () => clearInterval(id);
    }, [check]);

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                    <Wifi className="w-4 h-4" />
                    Status do Bot
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                        ) : connected === true ? (
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                                <span className="font-semibold text-green-600">Conectado</span>
                            </div>
                        ) : connected === false ? (
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-red-500" />
                                <span className="font-semibold text-red-600">Desconectado</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-gray-400" />
                                <span className="font-semibold text-muted-foreground">Sem resposta</span>
                            </div>
                        )}
                    </div>
                    <Button variant="outline" size="sm" onClick={check} disabled={loading}>
                        <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
                        Verificar
                    </Button>
                </div>
                {fetchError && (
                    <p className="text-xs text-red-500 font-mono bg-red-500/10 px-2 py-1 rounded">
                        Erro: {fetchError}
                    </p>
                )}
                {lastCheck && !fetchError && (
                    <p className="text-xs text-muted-foreground">
                        Última verificação: {formatDate(lastCheck)} · atualiza a cada 30s
                    </p>
                )}
            </CardContent>
        </Card>
    );
}

// ─── Painel de QR Code ───────────────────────────────────────────────────────

function QrPanel() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState(null);

    const load = useCallback(async () => {
        setLoading(true);
        setFetchError(null);
        try {
            const d = await fetchBot('/qr');
            setData(d);
        } catch (err) {
            setData(null);
            setFetchError(err.message);
            console.error('[Admin/qr]', err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
        const id = setInterval(load, 15000);
        return () => clearInterval(id);
    }, [load]);

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                    <QrCode className="w-4 h-4" />
                    QR Code
                </CardTitle>
                <CardDescription>
                    Escaneie para conectar o WhatsApp. Atualiza automaticamente a cada 15s.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
                {loading ? (
                    <div className="flex flex-col items-center gap-2 py-8">
                        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Buscando QR...</p>
                    </div>
                ) : data?.connected ? (
                    <div className="flex flex-col items-center gap-2 py-8">
                        <CheckCircle className="w-12 h-12 text-green-500" />
                        <p className="font-semibold text-green-600">WhatsApp já está conectado!</p>
                    </div>
                ) : fetchError ? (
                    <div className="flex flex-col items-center gap-2 py-6 w-full">
                        <XCircle className="w-8 h-8 text-red-500" />
                        <p className="text-sm font-medium text-red-600">Erro ao conectar ao bot</p>
                        <p className="text-xs text-red-500 font-mono bg-red-500/10 px-3 py-1.5 rounded text-center max-w-xs">
                            {fetchError}
                        </p>
                    </div>
                ) : data?.qr ? (
                    <div className="flex flex-col items-center gap-3">
                        <img
                            src={data.qr}
                            alt="QR Code WhatsApp"
                            className="w-56 h-56 rounded-lg border"
                        />
                        <p className="text-xs text-muted-foreground">Abra o WhatsApp → Aparelhos conectados → Conectar aparelho</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-2 py-8">
                        <WifiOff className="w-8 h-8 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">QR não disponível no momento</p>
                    </div>
                )}
                <Button variant="outline" size="sm" onClick={load} disabled={loading}>
                    <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
                    Atualizar
                </Button>
            </CardContent>
        </Card>
    );
}

// ─── Tabela de Logs ──────────────────────────────────────────────────────────

const PAGE_SIZE = 20;

function LogsTable() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [onlyErrors, setOnlyErrors] = useState(false);
    const [page, setPage] = useState(0);
    const [total, setTotal] = useState(0);

    const load = useCallback(async () => {
        setLoading(true);
        let query = supabase
            .from('whatsapp_logs')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

        if (onlyErrors) {
            query = query.in('status', ['error', 'parse_error']);
        }

        const { data, count, error } = await query;
        if (!error) {
            setLogs(data || []);
            setTotal(count || 0);
        }
        setLoading(false);
    }, [onlyErrors, page]);

    useEffect(() => {
        setPage(0);
    }, [onlyErrors]);

    useEffect(() => {
        load();
    }, [load]);

    const totalPages = Math.ceil(total / PAGE_SIZE);

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <MessageSquare className="w-4 h-4" />
                            Logs de Mensagens
                        </CardTitle>
                        <CardDescription>{total} registro{total !== 1 ? 's' : ''} encontrado{total !== 1 ? 's' : ''}</CardDescription>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <Switch
                                id="only-errors"
                                checked={onlyErrors}
                                onCheckedChange={setOnlyErrors}
                            />
                            <Label htmlFor="only-errors" className="text-sm cursor-pointer">
                                Só erros
                            </Label>
                        </div>
                        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                ) : logs.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40" />
                        <p>Nenhum log encontrado.</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {logs.map((log) => (
                            <motion.div
                                key={log.id}
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex flex-col sm:flex-row sm:items-start gap-2 p-3 rounded-lg border bg-card hover:bg-accent/30 transition-colors"
                            >
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                        {statusBadge(log.status)}
                                        <span className="text-xs text-muted-foreground font-mono">
                                            +{log.phone}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {formatDate(log.created_at)}
                                        </span>
                                    </div>
                                    <p className="text-sm truncate" title={log.message}>
                                        {log.message}
                                    </p>
                                    {log.status === 'success' && log.result && (
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            {log.result.tipo === 'gasto' ? '💸' : '💰'}{' '}
                                            {log.result.descricao} — R${' '}
                                            {Number(log.result.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </p>
                                    )}
                                    {log.error_msg && (
                                        <p className="text-xs text-red-500 mt-0.5 truncate" title={log.error_msg}>
                                            {log.error_msg}
                                        </p>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4">
                        <p className="text-xs text-muted-foreground">
                            Página {page + 1} de {totalPages}
                        </p>
                        <div className="flex gap-2">
                            <Button
                                variant="outline" size="sm"
                                onClick={() => setPage((p) => Math.max(0, p - 1))}
                                disabled={page === 0}
                            >
                                Anterior
                            </Button>
                            <Button
                                variant="outline" size="sm"
                                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                                disabled={page >= totalPages - 1}
                            >
                                Próxima
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

// ─── Página principal ────────────────────────────────────────────────────────

export function AdminWhatsAppPage() {
    return (
        <>
            <Helmet>
                <title>Admin WhatsApp - Lumify</title>
            </Helmet>

            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                        <ShieldCheck className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Admin WhatsApp</h1>
                        <p className="text-muted-foreground">Gerenciamento do agente financeiro</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <StatusPanel />
                    <QrPanel />
                </div>

                <LogsTable />
            </div>
        </>
    );
}
