import { RouteRecordRaw } from 'vue-router'
import Profile from '~/profile/pages/Profile.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/profile/:username',
    name: 'profile',
    props: true,
    meta: {},
    component: Profile
  }
]

export const config = {
  name: 'profile',
  enabled: true,
  routes: routes
}
