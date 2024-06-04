import { App } from 'vue'
import { Router } from 'vue-router'

export type ViteSetupModule = (ctx: { app: App<Element>; router: Router }) => void
