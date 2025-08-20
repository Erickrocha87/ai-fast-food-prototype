import 'dotenv/config';
import express from "express";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.join(__dirname, "../public")));

app.get("/session", async (req, res) => {
    try {
        console.log("[SERVER] Requisição recebida em /session");
        // Cria uma sessão Realtime com permissões de áudio e tools
        console.log("[SERVER] Solicitando sessão Realtime para OpenAI...");
        const r = await fetch("https://api.openai.com/v1/realtime/sessions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                // Modelos de voz compatíveis com Realtime; ajuste conforme a sua conta
                model: "gpt-4o-realtime-preview",
                voice: "alloy",
                // Opções úteis para latência e fala
                modalities: ["text", "audio"],
                
                // Deixe o modelo falar (stream de áudio out) e ouvir (áudio in)
                // Com WebRTC o modelo envia trilha de áudio remota.
            })
        });
        if (!r.ok) {
            const text = await r.text();
            console.error("[SERVER] Erro ao criar sessão Realtime:", text);
            return res.status(500).send(text);
        }
        // Rota para servir index.html na raiz
        app.get('/', (req, res) => {
            res.sendFile(path.join(__dirname, "../public/index.html"));
        });

        const data = await r.json();
        console.log("[SERVER] Sessão criada com sucesso. Dados:", data);
        res.json(data);
    } catch (e) {
        console.error("[SERVER] Erro inesperado:", e);
        res.status(500).send(e.message);
    }
});

app.listen(process.env.PORT || 3000, () => {
    console.log(`[SERVER] Servidor rodando em http://localhost:${process.env.PORT || 3000}`);
});
