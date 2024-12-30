<template>
  <nav class="relative flex items-center justify-between text-white">
    <!-- Left Side -->
    <RouterLink class="flex items-center" to="/">
      <img src="/logo.svg" class="ml-8 mr-4 h-10 w-10" alt="Logo" />
      <!-- <h1 class="text-4xl font-semibold tracking-wider">Git Dashboard</h1> -->
    </RouterLink>

    <!-- Middle & Right Side (only visible on medium screens and up) -->
    <div class="hidden items-center gap-4 md:flex">
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
      <RouterLink
        :to="{ name: 'profile', params: { username: 'CalcProgrammer1' } }"
        class="nav-link"
        v-if="isDev"
      >
        CalcProgrammer1
      </RouterLink>
    </div>

    <!-- Right Side -->
    <div class="mr-8 hidden items-center md:flex">
      <button class="nav-link" @click="signInWithGitHub">Log in</button>
    </div>

    <!-- Burger Menu (visible on small screens) -->
    <button class="mr-8 flex items-center md:hidden" @click="toggleMenu" aria-label="Toggle menu">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M4 6h16M4 12h16M4 18h16"
        />
      </svg>
    </button>
  </nav>

  <!-- Mobile Menu (only visible on small screens) -->
  <div v-show="isMenuOpen" class="flex flex-col items-center gap-4 md:hidden">
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
    <button class="nav-link" @click="signInWithGitHub">Log in</button>
  </div>

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

  const isMenuOpen = ref(false)
  const isDev = import.meta.env.DEV

  const toggleMenu = () => {
    isMenuOpen.value = !isMenuOpen.value
  }
</script>

<style scoped>
  .border-gradient {
    background: linear-gradient(to right, rgba(255, 255, 255, 0.1) 50%, rgba(255, 255, 255, 0));
  }
</style>
