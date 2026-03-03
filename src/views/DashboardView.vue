<template>
  <div class="h-screen flex flex-col bg-white">
    <!-- 顶部导航栏 -->
    <header class="bg-white border-b border-gray-200 px-6 py-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <h1 class="text-xl font-semibold text-gray-800">📈 Investing Notes</h1>
        </div>
        
        <!-- 用户头像和下拉菜单 -->
        <div class="relative">
          <button
            @click="userDropdownOpen = !userDropdownOpen"
            class="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span class="text-white text-sm font-medium">
                {{ userInitials }}
              </span>
            </div>
            <span class="text-gray-700 text-sm">{{ userEmail }}</span>
            <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <!-- 下拉菜单 -->
          <div
            v-if="userDropdownOpen"
            class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
          >
            <button
              @click="handleMenuItemClick('profile')"
              class="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              👤 修改头像
            </button>
            <button
              @click="handleMenuItemClick('password')"
              class="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              🔒 设置密码
            </button>
            <div class="border-t border-gray-200 my-1"></div>
            <button
              @click="handleMenuItemClick('logout')"
              class="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              🚪 退出登录
            </button>
          </div>
        </div>
      </div>
    </header>

    <div class="flex flex-1 overflow-hidden">
      <!-- 一级侧边栏 -->
      <aside class="w-64 bg-gray-900 text-white flex-shrink-0">
        <nav class="p-4 space-y-2">
          <button
            @click="setActiveMenu('stocks')"
            :class="[
              'w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors',
              activeMenu === 'stocks'
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            ]"
          >
            <span>📈</span>
            <span class="text-sm font-medium">股票跟踪</span>
          </button>

          <button
            @click="setActiveMenu('strategies')"
            :class="[
              'w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors',
              activeMenu === 'strategies'
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            ]"
          >
            <span>🧪</span>
            <span class="text-sm font-medium">策略回测</span>
          </button>
        </nav>
      </aside>

      <!-- 二级侧边栏 (仅股票跟踪时显示) -->
      <aside v-if="activeMenu === 'stocks'" class="w-80 bg-gray-50 border-r border-gray-200 flex-shrink-0">
        <div class="p-4 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold text-gray-800">自选股</h2>
            <button
              @click="showComingSoon"
              class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
              title="添加股票"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
          </div>
        </div>

        <div class="p-4 space-y-2">
          <div
            v-for="symbol in watchlist"
            :key="symbol"
            @click="selectStock(symbol)"
            :class="[
              'flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors',
              selectedStock === symbol
                ? 'bg-blue-100 border border-blue-300'
                : 'bg-white border border-gray-200 hover:border-gray-300'
            ]"
          >
            <div class="flex items-center space-x-3">
              <div class="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span class="text-white text-xs font-bold">{{ symbol.slice(0, 2) }}</span>
              </div>
              <div>
                <div class="text-sm font-medium text-gray-800">
                  {{ getStockName(symbol) }}
                </div>
                <div class="text-xs text-gray-500">{{ symbol }}</div>
              </div>
            </div>
            
            <div v-if="stockQuotes[symbol]" class="text-right">
              <div 
                :class="[
                  'text-sm font-medium',
                  stockQuotes[symbol].change >= 0 ? 'text-green-600' : 'text-red-600'
                ]"
              >
                ${{ stockQuotes[symbol].price.toFixed(2) }}
              </div>
              <div 
                :class="[
                  'text-xs',
                  stockQuotes[symbol].change >= 0 ? 'text-green-500' : 'text-red-500'
                ]"
              >
                {{ stockQuotes[symbol].change >= 0 ? '+' : '' }}{{ stockQuotes[symbol].change.toFixed(2) }} 
                ({{ stockQuotes[symbol].change >= 0 ? '+' : '' }}{{ stockQuotes[symbol].changePercent.toFixed(2) }}%)
              </div>
            </div>
          </div>

          <!-- 默认股票（如果没有watchlist） -->
          <div
            v-if="watchlist.length === 0"
            @click="selectStock('NVDA')"
            :class="[
              'flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors',
              selectedStock === 'NVDA'
                ? 'bg-blue-100 border border-blue-300'
                : 'bg-white border border-gray-200 hover:border-gray-300'
            ]"
          >
            <div class="flex items-center space-x-3">
              <div class="w-8 h-8 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg flex items-center justify-center">
                <span class="text-white text-xs font-bold">NV</span>
              </div>
              <div>
                <div class="text-sm font-medium text-gray-800">英伟达</div>
                <div class="text-xs text-gray-500">NVDA</div>
              </div>
            </div>
            
            <div v-if="stockQuotes.NVDA" class="text-right">
              <div 
                :class="[
                  'text-sm font-medium',
                  stockQuotes.NVDA.change >= 0 ? 'text-green-600' : 'text-red-600'
                ]"
              >
                ${{ stockQuotes.NVDA.price.toFixed(2) }}
              </div>
              <div 
                :class="[
                  'text-xs',
                  stockQuotes.NVDA.change >= 0 ? 'text-green-500' : 'text-red-500'
                ]"
              >
                {{ stockQuotes.NVDA.change >= 0 ? '+' : '' }}{{ stockQuotes.NVDA.change.toFixed(2) }} 
                ({{ stockQuotes.NVDA.change >= 0 ? '+' : '' }}{{ stockQuotes.NVDA.changePercent.toFixed(2) }}%)
              </div>
            </div>
          </div>
        </div>
      </aside>

      <!-- 主内容区 -->
      <main class="flex-1 overflow-auto bg-white">
        <div class="p-6">
          <!-- 策略回测页面 -->
          <div v-if="activeMenu === 'strategies'" class="text-center py-12">
            <div class="max-w-md mx-auto">
              <div class="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <span class="text-2xl">🧪</span>
              </div>
              <h2 class="text-2xl font-bold text-gray-800 mb-2">策略回测</h2>
              <p class="text-gray-600 mb-6">此功能正在开发中，敬请期待</p>
              <button
                @click="setActiveMenu('stocks')"
                class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                返回股票跟踪
              </button>
            </div>
          </div>

          <!-- 股票详情页面 -->
          <div v-else>
            <!-- 股票头部信息 -->
            <div class="mb-6" v-if="selectedStock && stockQuotes[selectedStock]">
              <div class="flex items-center space-x-4 mb-2">
                <h2 class="text-2xl font-bold text-gray-800">
                  {{ getStockName(selectedStock) }} 
                  <span class="text-lg text-gray-600">({{ selectedStock }})</span>
                </h2>
                <span
                  :class="[
                    'px-3 py-1 rounded-full text-sm font-medium',
                    stockQuotes[selectedStock].change >= 0 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  ]"
                >
                  {{ stockQuotes[selectedStock].change >= 0 ? '↑' : '↓' }}
                  ${{ stockQuotes[selectedStock].price.toFixed(2) }}
                </span>
              </div>
              
              <div class="flex items-center space-x-6 text-sm">
                <div>
                  <span class="text-gray-600">涨跌：</span>
                  <span 
                    :class="[
                      'font-medium',
                      stockQuotes[selectedStock].change >= 0 ? 'text-green-600' : 'text-red-600'
                    ]"
                  >
                    {{ stockQuotes[selectedStock].change >= 0 ? '+' : '' }}{{ stockQuotes[selectedStock].change.toFixed(2) }}
                  </span>
                </div>
                <div>
                  <span class="text-gray-600">涨跌幅：</span>
                  <span 
                    :class="[
                      'font-medium',
                      stockQuotes[selectedStock].changePercent >= 0 ? 'text-green-600' : 'text-red-600'
                    ]"
                  >
                    {{ stockQuotes[selectedStock].changePercent >= 0 ? '+' : '' }}{{ stockQuotes[selectedStock].changePercent.toFixed(2) }}%
                  </span>
                </div>
                <div>
                  <span class="text-gray-600">成交量：</span>
                  <span class="font-medium text-gray-800">
                    {{ formatVolume(stockQuotes[selectedStock].volume) }}
                  </span>
                </div>
              </div>
            </div>

            <!-- 图表区域 -->
            <div class="bg-white border border-gray-200 rounded-lg p-4">
              <div class="h-96 mb-4">
                <!-- K线图占位 -->
                <div class="w-full h-full flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200">
                  <div class="text-center">
                    <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span class="text-blue-600 text-xl">📊</span>
                    </div>
                    <p class="text-gray-600 text-sm">K线图加载中...</p>
                    <p class="text-gray-400 text-xs mt-1">使用 TradingView Lightweight Charts</p>
                  </div>
                </div>
              </div>
              
              <div class="h-32">
                <!-- 成交量图占位 -->
                <div class="w-full h-full flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200">
                  <div class="text-center">
                    <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-1">
                      <span class="text-green-600 text-sm">📈</span>
                    </div>
                    <p class="text-gray-600 text-xs">成交量图表</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- 技术指标选择 -->
            <div class="mt-6 flex items-center space-x-4">
              <span class="text-sm font-medium text-gray-700">技术指标：</span>
              <label class="flex items-center space-x-2">
                <input type="checkbox" checked class="rounded text-blue-600" />
                <span class="text-sm text-gray-600">MA5</span>
              </label>
              <label class="flex items-center space-x-2">
                <input type="checkbox" checked class="rounded text-blue-600" />
                <span class="text-sm text-gray-600">MA20</span>
              </label>
              <label class="flex items-center space-x-2">
                <input type="checkbox" class="rounded text-blue-600" />
                <span class="text-sm text-gray-600">MACD</span>
              </label>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
import { fetchRealTimeQuote } from '../services/yahooFinance.js'

const router = useRouter()
const authStore = useAuthStore()

const activeMenu = ref('stocks')
const selectedStock = ref('NVDA')
const userDropdownOpen = ref(false)
const stockQuotes = ref({})

// 计算用户信息
const userInitials = computed(() => {
  if (!authStore.user?.email) return 'U'
  return authStore.user.email[0].toUpperCase()
})

const userEmail = computed(() => {
  return authStore.user?.email || ''
})

const watchlist = computed(() => {
  return authStore.watchlist.length > 0 ? authStore.watchlist : ['NVDA']
})

// 获取股票显示名称
const getStockName = (symbol) => {
  const names = {
    'NVDA': '英伟达',
    'AAPL': '苹果',
    'GOOGL': '谷歌',
    'MSFT': '微软',
    'TSLA': '特斯拉',
    'AMZN': '亚马逊'
  }
  return names[symbol] || symbol
}

// 格式化成交量
const formatVolume = (volume) => {
  if (!volume) return '0'
  if (volume >= 1e9) return (volume / 1e9).toFixed(1) + 'B'
  if (volume >= 1e6) return (volume / 1e6).toFixed(1) + 'M'
  if (volume >= 1e3) return (volume / 1e3).toFixed(1) + 'K'
  return volume.toString()
}

// 菜单操作
const setActiveMenu = (menu) => {
  activeMenu.value = menu
  if (menu === 'stocks' && !selectedStock.value) {
    selectedStock.value = watchlist.value[0] || 'NVDA'
  }
}

const selectStock = (symbol) => {
  selectedStock.value = symbol
  fetchStockQuote(symbol)
}

// 用户下拉菜单操作
const handleMenuItemClick = async (action) => {
  userDropdownOpen.value = false
  
  switch (action) {
    case 'logout':
      try {
        await authStore.logout()
        router.push('/auth')
      } catch (error) {
        console.error('Logout failed:', error)
      }
      break
    case 'profile':
    case 'password':
      showComingSoon()
      break
  }
}

const showComingSoon = () => {
  alert('此功能正在开发中，敬请期待！')
}

// 获取股票实时报价
const fetchStockQuote = async (symbol) => {
  try {
    if (!stockQuotes.value[symbol]) {
      const quote = await fetchRealTimeQuote(symbol)
      stockQuotes.value = {
        ...stockQuotes.value,
        [symbol]: quote
      }
    }
  } catch (error) {
    console.error('Failed to fetch stock quote:', error)
    // 使用模拟数据
    stockQuotes.value = {
      ...stockQuotes.value,
      [symbol]: {
        price: symbol === 'NVDA' ? 825.63 : 100 + Math.random() * 100,
        change: symbol === 'NVDA' ? 12.45 : (Math.random() - 0.5) * 10,
        changePercent: symbol === 'NVDA' ? 1.53 : (Math.random() - 0.5) * 5,
        volume: symbol === 'NVDA' ? 45200000 : 10000000 + Math.random() * 5000000
      }
    }
  }
}

// 定期更新股票报价
const startQuoteUpdates = () => {
  // 每30秒更新一次报价
  setInterval(async () => {
    if (selectedStock.value) {
      await fetchStockQuote(selectedStock.value)
    }
  }, 30000)
}

// 初始化
onMounted(() => {
  // 初始化默认股票报价
  if (selectedStock.value) {
    fetchStockQuote(selectedStock.value)
  }
  
  // 启动报价更新
  startQuoteUpdates()
})

// 监听选中的股票变化
watch(selectedStock, (newSymbol) => {
  if (newSymbol) {
    fetchStockQuote(newSymbol)
  }
})

// 监听watchlist变化
watch(watchlist, (newWatchlist) => {
  if (newWatchlist.length > 0 && !selectedStock.value) {
    selectedStock.value = newWatchlist[0]
  }
})
</script>

<style scoped>
/* 自定义滚动条 */
.overflow-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.overflow-auto::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.overflow-auto::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 平滑过渡动画 */
.transition-colors {
  transition: all 0.2s ease-in-out;
}
</style>