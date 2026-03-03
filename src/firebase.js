import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { collection, addDoc, getDocs, doc, setDoc, getDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);

// 用户认证服务
const authService = {
  // 邮箱注册
  async registerWithEmail(email, password) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // 创建用户文档
      await setDoc(doc(db, "users", userCredential.user.uid), {
        email: email,
        createdAt: new Date().toISOString(),
        watchlist: ["NVDA"] // 默认添加英伟达
      });
      return userCredential;
    } catch (error) {
      throw error;
    }
  },

  // 邮箱登录
  async loginWithEmail(email, password) {
    try {
      return await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      throw error;
    }
  },

  // 退出登录
  async logout() {
    try {
      await signOut(auth);
    } catch (error) {
      throw error;
    }
  },

  // 获取当前用户
  getCurrentUser() {
    return auth.currentUser;
  }
};

// Firestore 数据服务
const firestoreService = {
  // 获取用户watchlist
  async getUserWatchlist(userId) {
    try {
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        return userDoc.data().watchlist || [];
      }
      return [];
    } catch (error) {
      throw error;
    }
  },

  // 添加股票到watchlist
  async addToWatchlist(userId, symbol) {
    try {
      const userRef = doc(db, "users", userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const currentWatchlist = userDoc.data().watchlist || [];
        if (!currentWatchlist.includes(symbol)) {
          await setDoc(userRef, {
            watchlist: [...currentWatchlist, symbol]
          }, { merge: true });
        }
      }
    } catch (error) {
      throw error;
    }
  },

  // 从watchlist移除股票
  async removeFromWatchlist(userId, symbol) {
    try {
      const userRef = doc(db, "users", userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const currentWatchlist = userDoc.data().watchlist || [];
        await setDoc(userRef, {
          watchlist: currentWatchlist.filter(s => s !== symbol)
        }, { merge: true });
      }
    } catch (error) {
      throw error;
    }
  }
};

export { db, auth, authService, firestoreService };