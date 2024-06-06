<template>
  <div class="min-h-screen w-full bg-background text-base">
    <div class="mx-auto my-0 block max-w-screen-xl">
      <Navigation />
      <main class="mt-4 p-1">
        <RouterView v-slot="{ Component }">
          <template v-if="Component">
            <component :is="Component" :key="router.currentRoute.value.fullPath" />
          </template>
        </RouterView>
      </main>
    </div>
  </div>

  <div class="absolute top-0 left-0 flex flex-col gap-4 bg-red p-2" v-if="isDev">
    <RouterLink :to="{ name: 'home' }">Home</RouterLink>
    <RouterLink :to="{ name: 'profile', params: { username: 'andreaduina' } }">
      Andrea Duina
    </RouterLink>
    <RouterLink :to="{ name: 'profile', params: { username: 'francescozonaro' } }">
      Francesco Zonaro
    </RouterLink>
  </div>
</template>

<script setup lang="ts">
  import Navigation from '~/common/components/Navigation.vue'
  import { useRouter } from 'vue-router'

  const router = useRouter()

  const isDev = import.meta.env.DEV
</script>
