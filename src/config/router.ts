import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { ViteSetupModule } from '~/config/types/ViteSetupModule'
import { useModulesStore } from '~/stores/modules'

export const priority = 98

export const install: ViteSetupModule = ({ app }) => {
  const modulesStore = useModulesStore()

  const routes: Array<RouteRecordRaw> = modulesStore.enabledModules.flatMap((module: any) =>
    module.config.routes.map((route: RouteRecordRaw) => {
      const enriched = { ...route }
      if (!enriched.meta) {
        enriched.meta = {}
      }

      enriched.meta.module = module.config.name
      return enriched
    })
  )

  const router = createRouter({
    history: createWebHistory(),
    routes
  })

  app.use(router)
}
