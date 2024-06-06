import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useStateStore = defineStore('state', () => {
  const searchUsersParams = ref<{ username: string; platforms: string[] }>({
    username: '',
    platforms: []
  })

  return {
    searchUsersParams
  }
})
