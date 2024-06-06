import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useStateStore = defineStore('state', () => {
  const searchUsersParams = ref<{ username: string; platforms: string[] }>({
    username: '',
    platforms: []
  })

  const localUser = ref<Account>({
    username: '@local',
    name: '',
    email: '',
    imgUrl: '',
    platforms: {},
    socials: {}
  })

  return {
    searchUsersParams,
    localUser
  }
})
