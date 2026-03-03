import { defineStore } from 'pinia'
import { authService, firestoreService } from '../firebase.js'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    isLoading: false,
    error: null,
    watchlist: []
  }),

  getters: {
    isAuthenticated: (state) => !!state.user,
    currentUser: (state) => state.user,
    userWatchlist: (state) => state.watchlist
  },

  actions: {
    async initialize() {
      try {
        this.isLoading = true
        
        // 监听认证状态变化
        authService.onAuthStateChanged((user) => {
          this.user = user
          if (user) {
            this.loadUserWatchlist(user.uid)
          } else {
            this.watchlist = []
          }
        })
        
      } catch (error) {
        this.error = error.message
      } finally {
        this.isLoading = false
      }
    },

    async login(email, password) {
      try {
        this.isLoading = true
        this.error = null
        
        await authService.loginWithEmail(email, password)
        
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async register(email, password) {
      try {
        this.isLoading = true
        this.error = null
        
        await authService.registerWithEmail(email, password)
        
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async logout() {
      try {
        await authService.logout()
        this.user = null
        this.watchlist = []
      } catch (error) {
        this.error = error.message
        throw error
      }
    },

    async loadUserWatchlist(userId) {
      try {
        this.watchlist = await firestoreService.getUserWatchlist(userId)
      } catch (error) {
        console.error('Failed to load watchlist:', error)
        this.watchlist = []
      }
    },

    async addToWatchlist(symbol) {
      try {
        if (!this.user) throw new Error('User not authenticated')
        
        await firestoreService.addToWatchlist(this.user.uid, symbol)
        await this.loadUserWatchlist(this.user.uid)
        
      } catch (error) {
        this.error = error.message
        throw error
      }
    },

    async removeFromWatchlist(symbol) {
      try {
        if (!this.user) throw new Error('User not authenticated')
        
        await firestoreService.removeFromWatchlist(this.user.uid, symbol)
        await this.loadUserWatchlist(this.user.uid)
        
      } catch (error) {
        this.error = error.message
        throw error
      }
    }
  }
})