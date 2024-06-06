<template>
  <SearchBar @search="search" />

  <div>Home</div>
</template>

<script setup lang="ts">
  import SearchBar from '~/common/components/SearchBar.vue'
  import { useStateStore } from '~/stores/state'
  import { useRouter } from 'vue-router'

  const state = useStateStore()
  const router = useRouter()

  const search = async (username: string, platforms: string[]) => {
    state.searchUsersParams = { username, platforms }
    router.push({ name: 'create' })
  }
</script>
