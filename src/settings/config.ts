import { RouteRecordRaw } from 'vue-router'
import Settings from '~/settings/pages/Settings.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/settings/:username',
    name: 'settings',
    props: true,
    meta: {},
    component: Settings
  }
]

export const config = {
  name: 'settings',
  enabled: true,
  routes: routes
}
