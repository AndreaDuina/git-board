import { RouteRecordRaw } from 'vue-router'
import Search from '~/create/pages/Create.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/create',
    name: 'create',
    props: false,
    meta: {},
    component: Search
  }
]

export const config = {
  name: 'create',
  enabled: true,
  routes: routes
}
