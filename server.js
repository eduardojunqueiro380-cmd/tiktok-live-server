const { WebcastPushConnection } = require('tiktok-live-connector');
const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;

const tiktokUsername = "dudu_corredor01";

const connection = new WebcastPushConnection(tiktokUsername);

let lastEvent = null;

// conectar live com retry
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 5000;

function connectWithRetry(attempt = 1) {
    console.log(`Tentando conectar à live de @${tiktokUsername} (tentativa ${attempt}/${MAX_RETRIES})...`);
    connection.connect().then(state => {
        console.log(`✅ Conectado com sucesso à live de @${state.uniqueId}`);
    }).catch(err => {
        const code = err.code || err.statusCode || 'N/A';
        console.error(`❌ Erro ao conectar (código: ${code}): ${err.message || err}`);
        if (attempt < MAX_RETRIES) {
            console.log(`🔄 Aguardando ${RETRY_DELAY_MS / 1000}s antes de tentar novamente...`);
            setTimeout(() => connectWithRetry(attempt + 1), RETRY_DELAY_MS);
        } else {
            console.error(`🚫 Falha após ${MAX_RETRIES} tentativas. Verifique se o usuário @${tiktokUsername} está ao vivo e se o username está correto.`);
        }
    });
}

connectWithRetry();

// 🎁 PRESENTES
connection.on('gift', data => {
    lastEvent = {
        type: "gift",
        user: data.uniqueId,
        amount: data.repeatCount
    };
});

// ❤️ CURTIDAS
connection.on('like', data => {
    lastEvent = {
        type: "like",
        count: data.likeCount
    };
});

// API
app.get('/event', (req, res) => {
    res.json(lastEvent);
    lastEvent = null;
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}...`);
});
