<template>
  <nav class="relative flex items-center justify-between px-4 text-white">
    <!-- Left Side -->
    <RouterLink class="flex items-center" to="/">
      <img src="/logo.svg" class="h-10 w-10" alt="Logo" />
      <h1 class="ml-4 hidden text-4xl font-semibold tracking-wider lg:block">Git Dashboard</h1>
    </RouterLink>

    <!-- Middle -->

    <div class="flex items-center gap-4">
      <RouterLink :to="{ name: 'home' }" class="nav-link">Home</RouterLink>
      <RouterLink :to="{ name: 'create' }" class="nav-link">Create</RouterLink>
      <RouterLink
        :to="{ name: 'profile', params: { username: 'andreaduina' } }"
        class="nav-link"
        v-if="isDev"
      >
        Andrea Duina
      </RouterLink>
      <RouterLink
        :to="{ name: 'profile', params: { username: 'francescozonaro' } }"
        class="nav-link"
        v-if="isDev"
      >
        Francesco Zonaro
      </RouterLink>
    </div>

    <!-- Right Side -->
    <div class="flex items-center">
      <button class="nav-link" @click="signInWithGitHub">Log in</button>
    </div>
  </nav>

  <div class="border-gradient mt-4 h-[1px] w-full" />
</template>

<style scoped>
  /* Scoped CSS selector to target RouterLink component */
  nav .nav-link {
    @apply mx-2 hover:text-gray-400;
  }
</style>

<script setup lang="ts">
  import { signInWithGitHub } from '../firebase/auth'

  const isDev = import.meta.env.DEV
</script>

<style scoped>
  .border-gradient {
    background: linear-gradient(to right, rgba(255, 255, 255, 0.1) 50%, rgba(255, 255, 255, 0));
  }
</style>
