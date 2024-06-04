import { RouteRecordRaw } from 'vue-router'
import Home from '~/home/pages/Home.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'home',
    props: true,
    meta: {},
    component: Home
  }
]

export const config = {
  name: 'home',
  enabled: true,
  routes: routes
}
