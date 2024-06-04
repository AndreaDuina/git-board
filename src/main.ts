import { createApp } from 'vue'
import App from './App.vue'
import '~/assets/styles/tailwind.css'

const app = createApp(App)

// init/config libraries
Object.values(import.meta.glob('./config/*.ts', { eager: true }))
  .sort((m: any, n: any) => (n.priority || 0) - (m.priority || 0))
  .map((i: any) => i.install?.({ app }))

app.mount('#app')
