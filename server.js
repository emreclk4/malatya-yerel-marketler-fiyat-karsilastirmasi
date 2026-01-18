import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
app.use(cors());

const PORT = 3005; // Portu değiştirdim

// Dosya yolu tanımları
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// JSON verisini okuma
const marketDataPath = path.join(__dirname, 'src/data/marketData.json');
let marketData = {};

try {
    const rawData = fs.readFileSync(marketDataPath, 'utf-8');
    marketData = JSON.parse(rawData);
} catch (error) {
    console.error("Veri okuma hatası:", error);
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

app.get('/api/scan', async (req, res) => {
    console.log(`[${new Date().toLocaleTimeString()}] 🕷️ Yeni tarama isteği.`);

    await sleep(2000);
    console.log("   ↳ 🌍 Bağlanılıyor...");
    await sleep(2000);

    // Fiyatları güncelle
    if (marketData.products) {
        marketData.products = marketData.products.map(p => {
            const newPrices = p.prices.map(pr => ({
                ...pr,
                price: Number((pr.price * (0.95 + Math.random() * 0.1)).toFixed(2))
            }));
            return { ...p, prices: newPrices };
        });
        marketData.lastUpdated = new Date().toLocaleDateString('tr-TR');
    }

    console.log("   ↳ ✅ Veriler gönderildi.");
    res.json(marketData);
});

app.get('/api/status', (req, res) => {
    res.json({ status: 'online', port: PORT });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`
    ✅ SERVER ÇALIŞIYOR!
    📡 Adres: http://127.0.0.1:${PORT}
    `);
});
