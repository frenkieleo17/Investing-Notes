<script setup>
import { ref, onMounted } from 'vue'
import { collection, getDocs, addDoc, query, orderBy } from 'firebase/firestore'
import { db } from './firebase' // 导入 Firestore 实例

const notes = ref([])
const newNoteSymbol = ref('')
const newNoteName = ref('')
const newNotePrice = ref('')
const newNoteContent = ref('')

// 从 Firestore 获取笔记
const fetchNotes = async () => {
  notes.value = [] // 清空现有笔记
  try {
    // 创建一个查询，按创建时间降序排列
    const q = query(collection(db, "stockNotes"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q)
    querySnapshot.forEach((doc) => {
      notes.value.push({ id: doc.id, ...doc.data() })
    })
  } catch (error) {
    console.error("获取笔记失败: ", error)
    alert("获取笔记失败，请检查控制台")
  }
}

// 添加新笔记到 Firestore
const addNote = async () => {
  if (!newNoteSymbol.value || !newNoteName.value || !newNotePrice.value || !newNoteContent.value) {
    alert('请填写所有笔记信息！')
    return
  }
  try {
    await addDoc(collection(db, "stockNotes"), {
      symbol: newNoteSymbol.value.toUpperCase(), // 股票代码转大写
      name: newNoteName.value,
      price: parseFloat(newNotePrice.value).toFixed(2), // 价格保留两位小数
      note: newNoteContent.value,
      createdAt: new Date() // 记录创建时间
    })
    // 添加成功后清空表单并重新获取笔记
    newNoteSymbol.value = ''
    newNoteName.value = ''
    newNotePrice.value = ''
    newNoteContent.value = ''
    await fetchNotes()
  } catch (e) {
    console.error("添加笔记失败: ", e)
    alert("添加笔记失败，请检查控制台")
  }
}

onMounted(() => {
  fetchNotes() // 组件挂载时获取笔记
})
</script>

<template>
  <div class="container">
    <h1>🇺🇸 美股投资笔记</h1>
    
    <!-- 添加笔记表单 -->
    <div class="add-note-form">
      <h2>添加新笔记</h2>
      <input v-model="newNoteSymbol" placeholder="股票代码 (e.g., AAPL)" />
      <input v-model="newNoteName" placeholder="公司名称 (e.g., Apple Inc.)" />
      <input v-model="newNotePrice" type="number" step="0.01" placeholder="当前价格 (e.g., 180.50)" />
      <textarea v-model="newNoteContent" placeholder="笔记内容"></textarea>
      <button @click="addNote">保存笔记</button>
    </div>

    <div class="note-grid">
      <div v-for="note in notes" :key="note.id" class="note-card">
        <div class="card-header">
          <span class="symbol">{{ note.symbol }}</span>
          <span class="price">${{ note.price }}</span>
        </div>
        <h3>{{ note.name }}</h3>
        <p>{{ note.note }}</p>
        <p class="timestamp">{{ new Date(note.createdAt.seconds * 1000).toLocaleString() }}</p>
      </div>
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

.add-note-form {
  background: #f9f9f9;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.add-note-form h2 {
  margin-top: 0;
  color: #333;
}

.add-note-form input,
.add-note-form textarea {
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
}

.add-note-form textarea {
  min-height: 80px;
  resize: vertical;
}

.add-note-form button {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 0.8rem 2rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  align-self: flex-start; /* 让按钮靠左 */
}

.add-note-form button:hover {
  background-color: #2980b9;
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
  display: flex;
  flex-direction: column;
  justify-content: space-between;
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

.timestamp {
  font-size: 0.8em;
  color: #888;
  text-align: right;
  margin-top: 1rem;
}
</style>
