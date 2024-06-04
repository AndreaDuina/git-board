import { defineStore } from 'pinia'
import { ref } from 'vue'

interface stateHeader {
  visible: boolean
  action: 'none' | 'logo' | 'back'
  accounts: boolean
  cannotChange: boolean
  menu: boolean
}

interface stateNav {
  visible: boolean
}

export const useStateStore = defineStore('state', () => {
  const header = ref<stateHeader>({
    visible: true,
    action: 'logo',
    accounts: true,
    cannotChange: false,
    menu: true
  })

  const navigation = ref<stateNav>({
    visible: false
  })

  // Allow user to navigate out of sign page
  const allowEscapeRoute = ref(false)

  return {
    header,
    navigation,
    allowEscapeRoute
  }
})
