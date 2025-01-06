<template>
  <div
    class="h-screen w-full min-w-[400px] overflow-y-scroll bg-background text-base"
    :class="{ 'no-scrollbar': router.currentRoute.value.name == 'home' }"
  >
    <div class="mx-auto my-4 block max-w-screen-xl">
      <Navigation />
      <main class="mt-2 p-1">
        <RouterView v-slot="{ Component }">
          <template v-if="Component">
            <div>
              <component :is="Component" :key="router.currentRoute.value.fullPath" />
            </div>
          </template>
        </RouterView>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
  import Navigation from '~/common/components/Navigation.vue'
  import { useRouter } from 'vue-router'

  const router = useRouter()
</script>
