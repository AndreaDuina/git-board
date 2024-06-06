<template>
  <h1 class="text-4xl font-semibold tracking-wider">Git Dashboard</h1>
  <SearchBar @search="search" />
</template>

<script setup lang="ts">
  import SearchBar from '~/common/components/SearchBar.vue'
  import { searchUserGH } from '~/common/api/github'
  import { searchUserGL } from '~/common/api/gitlab'
  import { searchUser } from '~/common/api/macro'

  const search = async (username: string, platforms: string[]) => {
    const users = await searchUser(platforms, username)
    console.log(users)
  }
</script>
