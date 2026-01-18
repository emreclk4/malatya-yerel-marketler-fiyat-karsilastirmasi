import { useState, useEffect, useRef } from 'react'

const RobotView = ({ marketData, onUpdatePrices }) => {
    const [status, setStatus] = useState('idle') // idle, scanning, success, error
    const [logs, setLogs] = useState([])
    const [progress, setProgress] = useState(0)
    const logsEndRef = useRef(null)

    // Otomatik scroll
    useEffect(() => {
        logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [logs])

    const addLog = (message, type = 'info') => {
        const timestamp = new Date().toLocaleTimeString()
        setLogs(prev => [...prev, { time: timestamp, message, type }])
    }

    const checkServerStatus = async () => {
        try {
            const resp = await fetch('http://localhost:3001/api/status')
            return resp.ok
        } catch (e) {
            return false
        }
    }

    const startScan = async () => {
        setStatus('scanning')
        setLogs([])
        setProgress(0)
        addLog('🚀 SİSTEM BAŞLATILIYOR...', 'system')

        // 1. Backend Kontrolü
        addLog('📡 Backend sunucusu kontrol ediliyor...', 'info')
        const isServerOnline = await checkServerStatus()

        if (!isServerOnline) {
            addLog('❌ KRİTİK HATA: Backend Sunucusu (Port 3001) yanıt vermiyor!', 'error')
            addLog('⚠️ Lütfen terminalden sunucunun çalıştığını teyit edin.', 'warning')
            setStatus('error')
            return
        }

        addLog('✅ Backend bağlantısı başarılı.', 'success')
        setProgress(10)

        // 2. Tarama Başlatma
        try {
            // Simüle edilmiş Hacker/Terminal efektleri
            const steps = [
                { msg: '🔐 Proxy havuzu oluşturuluyor...', delay: 800, prog: 20 },
                { msg: '🌍 Esenlik.com.tr -> Bağlantı kuruldu (24ms)', delay: 1200, prog: 35 },
                { msg: '🌍 Migros Sanal Market -> Çerezler aşıldı', delay: 1000, prog: 50 },
                { msg: '🕷️ Ürün kataloğu taranıyor (Derin Analiz Modu)...', delay: 1500, prog: 70 },
                { msg: '💰 Fiyat verileri ayıklanıyor...', delay: 1000, prog: 85 }
            ]

            for (const step of steps) {
                await new Promise(r => setTimeout(r, step.delay))
                addLog(step.msg, 'info')
                setProgress(step.prog)
            }

            addLog('📥 API verisi çekiliyor...', 'system')
            const response = await fetch('http://localhost:3001/api/scan')

            if (!response.ok) throw new Error(`HTTP Hatası: ${response.status}`)

            const newData = await response.json()

            setProgress(100)
            addLog('💾 Veriler hafızaya yazıldı.', 'success')
            addLog('✨ İŞLEM BAŞARIYLA TAMAMLANDI.', 'system')

            setStatus('success')

            setTimeout(() => {
                if (newData) onUpdatePrices(newData)
            }, 1000)

        } catch (error) {
            addLog(`💥 İŞLEM HATASI: ${error.message}`, 'error')
            setStatus('error')
        }
    }

    return (
        <div className="p-4 pb-24 space-y-4">
            {/* Kart */}
            <div className="bg-[#0c0c0c] text-green-500 font-mono p-1 rounded-2xl shadow-2xl border border-gray-800 overflow-hidden relative">
                {/* Header */}
                <div className="bg-gray-900 p-4 flex items-center justify-between border-b border-gray-800">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl animate-pulse">🤖</span>
                        <div>
                            <h2 className="text-lg font-bold text-white tracking-wider">SKYNET_TRADER_V3</h2>
                            <p className="text-[10px] text-gray-500">Autonomous Price Scraper // v3.1.0</p>
                        </div>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${status === 'scanning' ? 'bg-yellow-500 animate-ping' : 'bg-green-500'}`}></div>
                </div>

                {/* Content */}
                <div className="p-6">
                    {status === 'idle' && (
                        <div className="text-center py-10 space-y-4">
                            <p className="text-gray-400 text-sm">Hedef Marketler: Esenlik, Migros, Anpa, Bim</p>
                            <button
                                onClick={startScan}
                                className="bg-green-600 hover:bg-green-500 text-black font-bold py-3 px-8 rounded-none border-2 border-green-400 shadow-[0_0_15px_rgba(34,197,94,0.5)] hover:shadow-[0_0_25px_rgba(34,197,94,0.8)] transition-all active:scale-95 uppercase tracking-widest"
                            >
                                [ TARAMAYI BAŞLAT ]
                            </button>
                        </div>
                    )}

                    {status !== 'idle' && (
                        <div className="space-y-4">
                            {/* Progress Bar */}
                            <div className="h-1 bg-gray-800 w-full mb-4">
                                <div
                                    className="h-full bg-green-500 shadow-[0_0_10px_#22c55e] transition-all duration-300 ease-out"
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>

                            {/* Terminal Logs */}
                            <div className="h-64 overflow-y-auto font-mono text-xs space-y-1 p-2 bg-black/50 rounded border border-gray-800/50">
                                {logs.map((log, i) => (
                                    <div key={i} className={`
                                ${log.type === 'error' ? 'text-red-500 bg-red-900/10' : ''}
                                ${log.type === 'success' ? 'text-green-400' : ''}
                                ${log.type === 'warning' ? 'text-yellow-400' : ''}
                                ${log.type === 'system' ? 'text-blue-400 font-bold border-b border-gray-800 pb-1 mb-1 mt-1' : ''}
                                ${log.type === 'info' ? 'text-gray-400' : ''}
                            `}>
                                        <span className="opacity-30 mr-2">[{log.time}]</span>
                                        <span>{log.type === 'info' ? '>' : '#'} {log.message}</span>
                                    </div>
                                ))}
                                <div ref={logsEndRef} />
                            </div>

                            {status === 'error' && (
                                <button
                                    onClick={startScan}
                                    className="w-full mt-4 bg-red-600/20 text-red-500 border border-red-500/50 py-2 hover:bg-red-600/40 transition-colors uppercase text-sm font-bold"
                                >
                                    [ YENİDEN DENE ]
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default RobotView
