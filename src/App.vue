<template>
  <main class="w-screen h-screen bg-background">
    <RouterView v-slot="{ Component }">
      <template v-if="Component">
        <component :is="Component" />
      </template>
    </RouterView>
  </main>
</template>

<script setup lang="ts">
  import { useRouter } from 'vue-router'

  const router = useRouter()
</script>
