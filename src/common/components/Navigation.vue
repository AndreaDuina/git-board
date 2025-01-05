<template>
  <nav class="relative flex items-center justify-between text-white">
    <!-- Left Side -->
    <RouterLink class="flex items-center" to="/">
      <img src="/logo.svg" class="ml-8 mr-4 h-10 w-10" alt="Logo" />
      <!-- <h1 class="text-4xl font-semibold tracking-wider">Git Dashboard</h1> -->
    </RouterLink>

    <!-- Middle & Right Side (only visible on medium screens and up) -->
    <div class="hidden justify-start gap-4 md:block">
      <RouterLink :to="{ name: 'home' }" class="nav-link">Home</RouterLink>
      <RouterLink :to="{ name: 'create' }" class="nav-link">Create</RouterLink>
      <RouterLink
        v-if="user"
        :to="{ name: 'profile', params: { username: user.uid } }"
        class="nav-link"
      >
        Profile
      </RouterLink>
      <RouterLink
        v-if="user"
        :to="{ name: 'settings', params: { username: user.uid } }"
        class="nav-link"
      >
        Settings
      </RouterLink>
    </div>

    <!-- Right Side -->
    <div class="mr-4 flex items-center">
      <!-- Burger Menu (visible on small screens) -->
      <button class="mr-4 flex items-center md:hidden" @click="toggleMenu" aria-label="Toggle menu">
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

      <!-- Login and Profile -->
      <button
        v-if="!user"
        class="mr-2 rounded-md border-[0.5px] border-gray-800 px-3 py-1 hover:bg-gray-700"
        @click="signInWithGitHub"
      >
        Login
      </button>
      <button
        v-if="user"
        class="mr-2 rounded-md border-[0.5px] border-gray-800 px-3 py-1 hover:bg-gray-700"
        @click="signOutFromGithub"
      >
        Logout
      </button>
    </div>
  </nav>

  <!-- Mobile Menu (only visible on small screens) -->
  <div v-show="isMenuOpen" class="flex flex-col items-center gap-4 text-sm md:hidden">
    <RouterLink :to="{ name: 'home' }" class="nav-link">Home</RouterLink>
    <RouterLink :to="{ name: 'create' }" class="nav-link">Create</RouterLink>
    <RouterLink
      v-if="user"
      :to="{ name: 'profile', params: { username: user.uid } }"
      class="nav-link"
    >
      Profile
    </RouterLink>
    <RouterLink
      v-if="user"
      :to="{ name: 'settings', params: { username: user.uid } }"
      class="nav-link"
    >
      Settings
    </RouterLink>
  </div>

  <div class="border-gradient mt-4 h-[1px] w-full" />
</template>

<script setup lang="ts">
  import { onAuthStateChanged } from 'firebase/auth'
  import { ref, onMounted } from 'vue'
  import { auth } from '../firebase/firebase'
  import { signInWithGitHub, signOutFromGithub } from '../firebase/auth'

  const isMenuOpen = ref(false)
  const user = ref<any>(null)
  const isDev = import.meta.env.DEV

  const toggleMenu = () => {
    isMenuOpen.value = !isMenuOpen.value
  }

  onMounted(() => {
    onAuthStateChanged(auth, currentUser => {
      if (currentUser) {
        user.value = currentUser
      } else {
        user.value = null
      }
      console.log(user)
    })
  })
</script>

<style scoped>
  nav .nav-link {
    @apply mx-2 hover:text-gray-400;
  }

  .border-gradient {
    background: linear-gradient(to right, rgba(255, 255, 255, 0.1) 50%, rgba(255, 255, 255, 0));
  }
</style>
