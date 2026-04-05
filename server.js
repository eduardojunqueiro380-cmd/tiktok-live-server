const { WebcastPushConnection } = require('tiktok-live-connector');
const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;

// 🔥 COLOCA SEU USER AQUI
const tiktokUsername = "SEU_USUARIO";

const connection = new WebcastPushConnection(tiktokUsername);

let lastEvent = null;

// conectar live
connection.connect().then(state => {
    console.log(`Conectado à live: ${state.uniqueId}`);
}).catch(err => {
    console.error('Erro:', err);
});

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
    console.log("Servidor rodando...");
});