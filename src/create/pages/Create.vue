<template>
  <div class="mt-4 flex items-center justify-center">
    <h1 class="titleGradient">Create</h1>
  </div>
  <SearchBar @search="search" class="my-4 w-[70%]" />

  <div class="mx-8 mt-8 grid min-w-[420px] grid-cols-2 justify-around gap-8">
    <!-- Search results -->
    <div
      class="flex min-w-[200px] flex-col items-start overflow-y-auto rounded-xl bg-background-dark p-6"
    >
      <div class="mb-6 flex w-full flex-col items-center justify-center">
        <div class="subtitleGradient mb-4">Search results</div>
        <span class="text-center text-sm">Click items to add them to your dashboard</span>
      </div>
      <div class="flex w-full justify-center">
        <div class="flex w-full flex-col items-center justify-center gap-4" v-if="!loading">
          <UserSearchItem :user="user" v-for="user of searchResults" @onClick="addToDashboard" />
        </div>
        <div class="flex w-full flex-col items-center justify-center gap-4" v-else>
          <UserSearchItemSkeleton v-for="i of 5" />
        </div>
      </div>
    </div>
    <!-- Dashboard -->
    <div
      class="flex min-w-[200px] flex-col items-start overflow-y-auto rounded-xl bg-background-bright p-6"
    >
      <div class="mb-6 flex w-full flex-col items-center justify-center">
        <div class="subtitleGradient mb-4">Dashboard</div>
        <span class="text-center text-sm">Click items to remove them from your dashboard</span>
      </div>
      <div class="flex w-full justify-center">
        <!-- <div class="w-full" v-if="Object.keys(selectedUsers).length > 0"> -->
        <div class="w-full">
          <div class="flex flex-col items-center justify-center gap-4">
            <UserSearchItem
              :user="user"
              :dark-hover="true"
              v-for="user of selectedUsers"
              @onClick="removeFromDashboard"
            />
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="mt-4 mr-8 flex min-w-[458px] justify-end">
    <button
      class="rounded-xl bg-primary px-4 py-2 text-lg hover:brightness-110 active:brightness-90"
      @click="createDashboard"
    >
      Create dashboard
    </button>
  </div>
</template>

<script setup lang="ts">
  import SearchBar from '~/common/components/SearchBar.vue'
  import UserSearchItem from '~/create/components/UserSearchItem.vue'
  import UserSearchItemSkeleton from '~/create/components/UserSearchItemSkeleton.vue'
  import levenshtein from 'fast-levenshtein'
  import { searchUser } from '../helpers/search'
  import { useStateStore } from '~/stores/state'
  import { useRouter } from 'vue-router'

  const state = useStateStore()
  const router = useRouter()

  const searchResults = ref<GitUser[]>([])
  const selectedUsers = reactive<{ [hash: string]: GitUser }>({})
  const loading = ref(false)
  let lastSearchText = ''

  const init = () => {
    // Load search parameters from state if possible
    if (state.searchUsersParams.username) {
      search(state.searchUsersParams.username, state.searchUsersParams.platforms)
      // Reset state
      state.searchUsersParams.username = ''
      state.searchUsersParams.platforms = []
    }
  }

  const search = async (username: string, platforms: string[]) => {
    try {
      loading.value = true
      const res = await searchUser(platforms, username)
      // Sort by levenshtein distance
      searchResults.value = res.sort((a: GitUser, b: GitUser) => sortLogic(a, b, username))
      lastSearchText = username
      loading.value = false
    } catch (err) {
      console.error(err)
    }
  }

  const sortLogic = (a: GitUser, b: GitUser, reference: string) => {
    const distanceA = levenshtein.get(a.username, reference)
    const distanceB = levenshtein.get(b.username, reference)
    return distanceA - distanceB
  }

  const getHash = (user: GitUser) => `${user.username}@${user.platform}`
  const reverseHash = (hash: string) => {
    const [username, platform] = hash.split('@')
    return { username, platform }
  }

  const addToDashboard = (clickedUser: GitUser) => {
    const hash = getHash(clickedUser)
    if (!selectedUsers[hash]) {
      selectedUsers[hash] = clickedUser
    }
  }

  const removeFromDashboard = (clickedUser: GitUser) => {
    const hash = getHash(clickedUser)
    delete selectedUsers[hash]
  }

  const createDashboard = () => {
    state.localUser = buildAccount()
    router.push({ name: 'profile', params: { username: '@local' } })
  }

  const buildAccount = () => {
    let name = ''
    let imgUrl = ''
    const platforms: { [platform: string]: string[] } = {}

    for (const hash in selectedUsers) {
      const user = selectedUsers[hash]
      if (user.name) {
        name = user.name
      }
      if (user.imgUrl) {
        imgUrl = user.imgUrl
      }
      if (!platforms[user.platform]) {
        platforms[user.platform] = []
      }
      platforms[user.platform].push(user.username)
    }

    // If no name was found use username
    const hashes = Object.keys(selectedUsers)
    name = hashes.length > 0 ? selectedUsers[hashes[0]].username : ''

    const account: Account = {
      username: '@local',
      name,
      email: '',
      imgUrl,
      platforms,
      socials: {}
    }
    return account
  }

  init()
</script>
