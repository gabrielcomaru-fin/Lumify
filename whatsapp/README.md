# Lumify — Agente WhatsApp Financeiro

Bot Node.js com [whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js) que interpreta mensagens em linguagem natural e cria despesas/receitas automaticamente no Supabase.

## Como funciona

```
Usuário → "Gastei 200 em gasolina"
Bot → IA interpreta → insere em gastos no Supabase → confirma
```

1. O usuário cadastra seu número no app: **Configurações → Agente WhatsApp**
2. Envia uma mensagem para o número do WhatsApp vinculado ao bot
3. O bot cria o lançamento e responde com a confirmação

## Exemplos de mensagens

| Mensagem | Resultado |
|----------|-----------|
| `Gastei 200 em gasolina` | Despesa de R$ 200 |
| `Paguei 89,90 de internet` | Despesa de R$ 89,90 |
| `Recebi 3000 de salário` | Receita de R$ 3.000 |
| `!ajuda` | Lista de comandos |

## Desenvolvimento local

```bash
cd whatsapp
cp .env.example .env   # preencha as variáveis
npm install
npm start
```

Escaneie o QR no terminal na primeira execução. A sessão fica em `.wwebjs_auth/` (não versionar).

## Docker

```bash
cd whatsapp
docker build -t lumify-whatsapp .
docker run -p 3000:3000 --env-file .env -v lumify-wa-auth:/app/.wwebjs_auth lumify-whatsapp
```

## Variáveis de Ambiente

| Variável | Descrição |
|----------|-----------|
| `PORT` | Porta HTTP (padrão `3000`) |
| `PUPPETEER_EXECUTABLE_PATH` | Caminho do Chromium (Docker: `/usr/bin/chromium`) |
| `SUPABASE_URL` | URL do projeto Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (nunca expor no frontend) |
| `AI_PROVIDER` | Provedor de IA: `openai` \| `gemini` \| `anthropic` |
| `AI_API_KEY` | Chave da API do provedor escolhido |
| `AI_MODEL` | Modelo específico (opcional; padrão por provedor) |

### Padrões de modelo por provedor

| Provedor | Padrão |
|----------|--------|
| `openai` | `gpt-4o-mini` |
| `gemini` | `gemini-2.5-flash` |
| `anthropic` | `claude-3-haiku-20240307` |
