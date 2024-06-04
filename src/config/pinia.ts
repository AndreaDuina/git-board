import { createPinia } from 'pinia'
import { ViteSetupModule } from '~/config/types/ViteSetupModule'

export const priority = 99

export const install: ViteSetupModule = ({ app }) => {
  const pinia = createPinia()
  app.use(pinia)
}
