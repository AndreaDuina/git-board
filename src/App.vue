<template>
  <div class="min-h-screen w-full bg-background text-base">
    <main class="mx-auto my-0 block max-w-screen-xl p-1">
      <RouterView v-slot="{ Component }">
        <template v-if="Component">
          <component :is="Component" :key="router.currentRoute.value.fullPath" />
        </template>
      </RouterView>
    </main>
  </div>

  <div class="absolute top-0 left-0 flex flex-col gap-4 bg-red p-2" v-if="isDev">
    <RouterLink :to="{ name: 'home' }">Home</RouterLink>
    <RouterLink :to="{ name: 'profile', params: { username: 'AndreaDuina' } }">
      Andrea Duina
    </RouterLink>
    <RouterLink :to="{ name: 'profile', params: { username: 'francescozonaro' } }">
      Francesco Zonaro
    </RouterLink>
  </div>
</template>

<script setup lang="ts">
  import { useRouter } from 'vue-router'

  const router = useRouter()

  const isDev = import.meta.env.DEV
</script>
