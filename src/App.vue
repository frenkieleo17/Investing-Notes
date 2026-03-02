<script setup>
import { ref, onMounted } from 'vue'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from './firebase' // 导入 Firestore 实例

const firebaseMessage = ref('Loading message from Firebase...')
const newMessage = ref('')

// 从 Firestore 获取消息
const fetchMessage = async () => {
  try {
    const docRef = doc(db, "messages", "hello");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      firebaseMessage.value = docSnap.data().text;
    } else {
      // 如果文档不存在，创建一个默认消息
      await setDoc(docRef, { text: "Hello Firebase World!" });
      firebaseMessage.value = "Hello Firebase World!";
    }
  } catch (error) {
    console.error("获取消息失败: ", error);
    firebaseMessage.value = "Error loading message from Firebase.";
  }
}

// 更新 Firestore 中的消息
const updateMessage = async () => {
  if (newMessage.value.trim() === '') {
    alert('消息不能为空！');
    return;
  }
  try {
    const docRef = doc(db, "messages", "hello");
    await setDoc(docRef, { text: newMessage.value });
    firebaseMessage.value = newMessage.value; // 更新显示
    newMessage.value = ''; // 清空输入框
  } catch (error) {
    console.error("更新消息失败: ", error);
    alert("更新消息失败，请检查控制台");
  }
}

onMounted(() => {
  fetchMessage(); // 组件挂载时获取消息
})
</script>

<template>
  <div class="container">
    <h1>Hello Firebase World!</h1>
    <p class="firebase-message">{{ firebaseMessage }}</p>

    <div class="update-section">
      <input v-model="newMessage" placeholder="输入新消息" />
      <button @click="updateMessage">更新 Firebase 消息</button>
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  text-align: center;
}

h1 {
  color: #2c3e50;
  margin-bottom: 1rem;
}

.firebase-message {
  font-size: 1.5rem;
  color: #42b883;
  margin-bottom: 2rem;
  font-weight: bold;
}

.update-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 2rem;
}

.update-section input {
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
}

.update-section button {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 0.8rem 2rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
}

.update-section button:hover {
  background-color: #2980b9;
}
</style>
