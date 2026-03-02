<script setup>
import { ref } from 'vue'

const notes = ref([
  { symbol: 'AAPL', name: 'Apple Inc.', price: '180.50', note: '关注财报后的回调机会' },
  { symbol: 'TSLA', name: 'Tesla, Inc.', price: '175.20', note: 'FSD V12 发布后的市场反应' }
])
</script>

<template>
  <div class="container">
    <h1>🇺🇸 美股投资笔记</h1>
    
    <div class="note-grid">
      <div v-for="note in notes" :key="note.symbol" class="note-card">
        <div class="card-header">
          <span class="symbol">{{ note.symbol }}</span>
          <span class="price">${{ note.price }}</span>
        </div>
        <h3>{{ note.name }}</h3>
        <p>{{ note.note }}</p>
      </div>
    </div>

    <div class="actions">
      <button @click="() => {}">添加笔记</button>
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

h1 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 2rem;
}

.note-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
}

.note-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  border: 1px solid #eee;
  transition: transform 0.2s;
}

.note-card:hover {
  transform: translateY(-5px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.symbol {
  font-weight: bold;
  font-size: 1.2rem;
  color: #3498db;
}

.price {
  font-family: monospace;
  color: #27ae60;
}

.actions {
  margin-top: 3rem;
  text-align: center;
}

button {
  background-color: #42b883;
  color: white;
  border: none;
  padding: 0.8rem 2rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
}

button:hover {
  background-color: #3aa876;
}
</style>
