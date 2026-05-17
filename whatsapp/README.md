# Lumify — Serviço WhatsApp

Bot Node.js com [whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js) e health check HTTP.

## Desenvolvimento local

```bash
cd whatsapp
npm install
npm start
```

Escaneie o QR no terminal na primeira execução. A sessão fica em `.wwebjs_auth/` (não versionar).

## Docker

```bash
cd whatsapp
docker build -t lumify-whatsapp .
docker run -p 3000:3000 -v lumify-wa-auth:/app/.wwebjs_auth lumify-whatsapp
```

## Variáveis

| Variável | Descrição |
|----------|-----------|
| `PORT` | Porta HTTP (padrão `3000`) |
| `PUPPETEER_EXECUTABLE_PATH` | Caminho do Chromium (Docker usa `/usr/bin/chromium`) |

Copie `.env.example` para `.env` se precisar.
