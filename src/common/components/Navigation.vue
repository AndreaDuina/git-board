<template>
  <nav class="relative flex items-center justify-between px-4 text-white">
    <!-- Left Side -->
    <RouterLink class="flex items-center" to="/">
      <img src="/logo.svg" class="h-10 w-10" alt="Logo" />
      <h1 class="ml-4 hidden text-4xl font-semibold tracking-wider lg:block">Git Dashboard</h1>
    </RouterLink>

    <!-- Middle -->

    <div class="flex items-center gap-4">
      <RouterLink
        :to="{ name: 'profile', params: { username: 'andreaduina' } }"
        class="nav-link"
        v-if="isDev"
      >
        A. Duina
      </RouterLink>
      <RouterLink
        :to="{ name: 'profile', params: { username: 'francescozonaro' } }"
        class="nav-link"
        v-if="isDev"
      >
        F. Zonaro
      </RouterLink>
    </div>
    <div class="flex flex-row">
      <RouterLink
        class="flex h-[35px] items-center justify-center rounded-lg border-[0.5px] border-gray-600 px-2 text-white hover:bg-background-bright"
        :to="{ name: 'create' }"
      >
        <img src="/logo.svg" class="mr-2 h-5 w-5" alt="Logo" />
        Create
      </RouterLink>
      <button
        class="mx-4 flex h-[35px] items-center justify-center rounded-lg border-[0.5px] bg-white px-2 text-black hover:bg-gray-50"
        @click="signInWithGitHub"
      >
        Login
      </button>
    </div>
  </nav>

  <div class="border-gradient mt-4 h-[1px] w-full" />
</template>

<style scoped>
  /* Scoped CSS selector to target RouterLink component */
  nav .nav-link {
    @apply mx-2 text-gray-400 hover:text-white;
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
