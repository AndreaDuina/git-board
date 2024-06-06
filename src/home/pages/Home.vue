<template>
  <SearchBar @search="search" />

  <div class="mt-8 flex flex-col items-center justify-center gap-4">
    <UserSearchItem :user="user" v-for="user of users" />
  </div>
</template>

<script setup lang="ts">
  import SearchBar from '~/common/components/SearchBar.vue'
  import UserSearchItem from '~/home/components/UserSearchItem.vue'
  import { searchUserGH } from '~/common/api/github'
  import { searchUserGL } from '~/common/api/gitlab'
  import { searchUser } from '~/common/api/macro'

  const users = ref<UserMacroAPI>([])

  const search = async (username: string, platforms: string[]) => {
    try {
      const res = await searchUser(platforms, username)
      users.value = res
    } catch (err) {
      console.error(err)
    }
  }
</script>
