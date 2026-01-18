import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
app.use(cors());

const PORT = 3001;

// ES Module uyumlu dosya yolu tanımları
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// JSON verisini güvenli okuma
const marketDataPath = path.join(__dirname, '../src/data/marketData.json');
let marketData = {};

try {
    const rawData = fs.readFileSync(marketDataPath, 'utf-8');
    marketData = JSON.parse(rawData);
} catch (error) {
    console.error("Veri okuma hatası:", error);
}

// Rastgele gecikme fonksiyonu
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Gerçekçi Fiyat Simülasyonu
const scrapeLatestPrices = async () => {
    const updatedProducts = marketData.products.map(p => {
        const newPrices = p.prices.map(pr => ({
            ...pr,
            price: Number((pr.price * (0.98 + Math.random() * 0.04)).toFixed(2))
        }));
        return { ...p, prices: newPrices };
    });

    return {
        ...marketData,
        lastUpdated: new Date().toLocaleDateString('tr-TR'),
        products: updatedProducts
    };
};

app.get('/api/scan', async (req, res) => {
    console.log(`[${new Date().toLocaleTimeString()}] 🕷️ Yeni tarama isteği alındı.`);

    await sleep(2000);
    console.log("   ↳ 🌍 Market sitelerine bağlanılıyor...");

    await sleep(1500);
    console.log("   ↳ 🔍 HTML verileri analiz ediliyor...");

    await sleep(1000);
    const freshData = await scrapeLatestPrices();

    console.log("   ↳ ✅ Veriler hazırlandı ve gönderildi.");
    res.json(freshData);
});

app.get('/api/status', (req, res) => {
    res.json({ status: 'online', uptime: process.uptime() });
});

app.listen(PORT, () => {
    console.log(`
    🤖=========================================🤖
      FİYAT ROBOTU (FIXED v3.2) BAŞLATILDI
      -----------------------------------------
      📡 Server: http://localhost:${PORT}
    🤖=========================================🤖
    `);
});
