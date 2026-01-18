import { useState, useMemo } from 'react'
import marketData from './data/marketData.json'

function App() {
  const [activeTab, setActiveTab] = useState('home') // home, search, cart
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Tümü')
  const [cart, setCart] = useState([])

  const categories = ['Tümü', ...new Set(marketData.products.map(p => p.category))]

  // --- Helpers ---
  const getMarket = (id) => marketData.markets.find(m => m.id === id)

  const getLowestPrice = (prices) => {
    return prices.reduce((min, p) => p.price < min.price ? p : min, prices[0])
  }

  // --- Filter Logic ---
  const filteredProducts = useMemo(() => {
    return marketData.products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === 'Tümü' || product.category === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [searchQuery, selectedCategory])

  // --- Cart Logic ---
  const addToCart = (product) => {
    // Default to lowest price market
    const bestOption = getLowestPrice(product.prices)
    const existingItem = cart.find(item => item.product.id === product.id && item.marketId === bestOption.marketId)

    if (existingItem) {
      setCart(cart.map(item =>
        item.product.id === product.id && item.marketId === bestOption.marketId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
    } else {
      setCart([...cart, { product, marketId: bestOption.marketId, price: bestOption.price, quantity: 1 }])
    }

    // Tiny feedback
    alert(`${product.name} sepete eklendi!`)
  }

  const removeFromCart = (index) => {
    const newCart = [...cart]
    newCart.splice(index, 1)
    setCart(newCart)
  }

  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0)

  // --- Components ---

  const ProductCard = ({ product }) => {
    const bestPrice = getLowestPrice(product.prices)
    const bestMarket = getMarket(bestPrice.marketId)

    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
        <div className="h-32 bg-gray-50 flex items-center justify-center text-6xl">
          {product.icon}
        </div>
        <div className="p-4 flex-1 flex flex-col">
          <div className="flex justify-between items-start mb-2">
            <div>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{product.category}</span>
              <h3 className="font-bold text-gray-800 leading-tight">{product.name}</h3>
            </div>
            <div className="text-right">
              <span className="block text-lg font-bold text-green-600">{bestPrice.price.toFixed(2)} ₺</span>
              <span className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">En Uygun</span>
            </div>
          </div>

          <div className="mt-auto pt-3 border-t border-gray-100">
            <div className="flex justify-between items-center text-xs mb-3">
              <span className="text-gray-500">En iyi fiyat:</span>
              <div className="flex items-center gap-1 font-medium text-gray-700">
                <span className={`w-2 h-2 rounded-full ${bestMarket.color}`}></span>
                {bestMarket.name}
              </div>
            </div>

            <button
              onClick={() => addToCart(product)}
              className="w-full py-2 bg-malatya text-white text-sm font-bold rounded-lg hover:bg-amber-600 active:scale-95 transition-all shadow-amber-200 shadow-md">
              Sepete Ekle
            </button>
            <div className="mt-2 text-center text-xs text-gray-400">
              <span className="cursor-pointer hover:text-malatya hover:underline" onClick={() => alert(JSON.stringify(product.prices.map(p => `${getMarket(p.marketId).name}: ${p.price} TL`).join('\n')))}>Tüm Fiyatları Gör</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const CartView = () => (
    <div className="p-4 space-y-4 pb-24">
      <h2 className="text-2xl font-bold text-gray-800">Sepetim</h2>
      {cart.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
          <p className="text-5xl mb-4">🛒</p>
          <p className="text-gray-500">Sepetiniz boş.</p>
          <button onClick={() => setActiveTab('home')} className="mt-4 text-malatya font-bold hover:underline">Alışverişe Başla</button>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-100">
            {cart.map((item, idx) => (
              <div key={idx} className="p-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{item.product.icon}</span>
                  <div>
                    <h4 className="font-bold text-gray-800">{item.product.name}</h4>
                    <p className="text-xs text-gray-500">
                      Market: <span className="font-medium text-gray-700">{getMarket(item.marketId).name}</span>
                    </p>
                    <p className="text-xs text-gray-400">{item.quantity} adet</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-800">{(item.price * item.quantity).toFixed(2)} ₺</p>
                  <button onClick={() => removeFromCart(idx)} className="text-xs text-red-400 hover:text-red-600 mt-1">Sil</button>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white p-4 rounded-xl shadow-md border border-gray-100 sticky bottom-20">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-500">Toplam Tahmini Tutar</span>
              <span className="text-2xl font-bold text-primary">{cartTotal.toFixed(2)} ₺</span>
            </div>
            <button
              onClick={() => alert('Bu özellik demoda çalışmamaktadır.')}
              className="w-full py-3 bg-primary text-white font-bold rounded-xl shadow-lg hover:bg-slate-800 active:scale-95 transition-all">
              Sepeti Onayla
            </button>
          </div>
        </>
      )}
    </div>
  )

  const HomeView = () => (
    <>
      {/* Search Header */}
      <div className="sticky top-0 bg-white z-10 pb-2 shadow-sm">
        <div className="p-4 bg-primary text-white mb-2 rounded-b-3xl">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-xl font-bold">Malatya Market Cepte</h1>
              <p className="text-xs text-gray-400">En ucuz market cebinde!</p>
            </div>
            <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center text-sm border border-slate-600">
              👤
            </div>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Ürün ara... (Süt, Yağ, Peynir)"
              className="w-full px-4 py-3 pl-10 rounded-xl text-gray-900 bg-white shadow-lg focus:outline-none focus:ring-2 focus:ring-malatya transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <span className="absolute left-3 top-3.5 text-gray-400">🔍</span>
          </div>
        </div>

        {/* Categories */}
        <div className="overflow-x-auto whitespace-nowrap px-4 py-2 scrollbar-hide">
          <div className="flex space-x-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${selectedCategory === cat
                  ? 'bg-primary text-white shadow-md transform scale-105'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="p-4 pb-24 grid grid-cols-2 gap-4">
        {filteredProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </>
  )

  return (
    <div className="min-h-screen bg-gray-50 font-sans max-w-md mx-auto shadow-2xl overflow-hidden relative">
      {activeTab === 'home' && <HomeView />}
      {activeTab === 'search' && (
        <div className="p-4 pt-10">
          <input
            type="text"
            placeholder="Detaylı Arama..."
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-malatya"
            autoFocus
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setActiveTab('home')
            }}
          />
          <p className="text-center text-gray-400 mt-4">Kategoriler veya ürün adı ile arayın.</p>
        </div>
      )}
      {activeTab === 'cart' && <CartView />}

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 w-full max-w-md bg-white border-t border-gray-200 flex justify-around py-3 pb-5 z-20 text-xs font-medium text-gray-400">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'home' ? 'text-malatya' : 'hover:text-gray-600'}`}>
          <span className="text-xl">🏠</span>
          Ana Sayfa
        </button>
        <button
          onClick={() => { setActiveTab('home'); document.querySelector('input')?.focus() }} // Hacky focus
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'search' ? 'text-malatya' : 'hover:text-gray-600'}`}>
          <span className="text-xl bg-primary text-white p-3 rounded-full -mt-8 border-4 border-gray-50 shadow-lg">🔍</span>
          <span className="mt-1">Ara</span>
        </button>
        <button
          onClick={() => setActiveTab('cart')}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'cart' ? 'text-malatya' : 'hover:text-gray-600'} relative`}>
          <span className="text-xl">🛒</span>
          Sepetim
          {cart.length > 0 && (
            <span className="absolute -top-1 right-2 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
              {cart.reduce((a, b) => a + b.quantity, 0)}
            </span>
          )}
        </button>
      </nav>
    </div>
  )
}

export default App
