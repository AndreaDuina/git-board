<template>
  <SearchBar @search="search" />

  <div class="mt-8 flex flex-col items-center justify-center gap-4">
    <UserSearchItem :user="user" v-for="user of users" />
  </div>
</template>

<script setup lang="ts">
  import SearchBar from '~/common/components/SearchBar.vue'
  import UserSearchItem from '~/home/components/UserSearchItem.vue'
  import { searchUser } from '~/common/api/macro'
  import levenshtein from 'fast-levenshtein'

  const users = ref<UserMacroAPI>([])

  const search = async (username: string, platforms: string[]) => {
    try {
      const res = await searchUser(platforms, username)
      // Sort by levenshtein distance
      users.value = res.sort((a: UserMacroAPI, b: UserMacroAPI) => {
        const distanceA = levenshtein.get(a.username, username)
        const distanceB = levenshtein.get(b.username, username)
        return distanceA - distanceB
      })
    } catch (err) {
      console.error(err)
    }
  }
</script>
