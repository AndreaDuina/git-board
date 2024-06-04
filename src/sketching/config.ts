import { RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/sketching/test',
    name: 'sketch-test',
    component: () => import('~/sketching/pages/Test.vue')
  }
]

export const config = {
  name: 'sketching',
  enabled: true,
  routes: routes
}
