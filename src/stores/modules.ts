import { computed } from 'vue'
import { acceptHMRUpdate, defineStore } from 'pinia'

export const useModulesStore = defineStore('modules', () => {
  const modules = import.meta.glob('~/**/config.ts', { eager: true })

  const enabledModules = computed(() =>
    Object.values(modules).filter((m: any) => m.config?.enabled)
  )

  return {
    enabledModules
  }
})

if (import.meta.hot) import.meta.hot.accept(acceptHMRUpdate(useModulesStore, import.meta.hot))
