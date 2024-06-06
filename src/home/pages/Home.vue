<template>
  <SearchBar @search="search" />

  <div>Home</div>
</template>

<script setup lang="ts">
  import SearchBar from '~/common/components/SearchBar.vue'

  const search = async (username: string, platforms: string[]) => {}
</script>
