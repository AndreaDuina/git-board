<template>
  <SearchBar @search="search" />

  <div class="mt-8 flex h-[37rem] justify-around gap-8">
    <div class="flex w-1/2 flex-col items-start overflow-y-auto p-6">
      <!--span class="mb-2 text-xl">Search results</span-->
      <div class="flex w-full justify-center">
        <div class="flex w-full flex-col items-center justify-center gap-4" v-if="!loading">
          <UserSearchItem :user="user" v-for="user of searchResults" @onClick="addToDashboard" />
        </div>
        <div class="flex w-full flex-col items-center justify-center gap-4" v-else>
          <UserSearchItemSkeleton v-for="i of 5" />
        </div>
      </div>
    </div>
    <div
      class="flex w-1/2 flex-col items-start overflow-y-auto rounded-xl bg-background-bright p-6"
    >
      <!--span class="mb-2 text-xl">Dashboard</span-->
      <div class="flex w-full justify-center">
        <div class="w-full" v-if="Object.keys(selectedUsers).length > 0">
          <div class="flex flex-col items-center justify-center gap-4">
            <UserSearchItem
              :user="user"
              :dark-hover="true"
              v-for="user of selectedUsers"
              @onClick="removeFromDashboard"
            />
          </div>
        </div>
        <div class="flex h-[33rem] w-full flex-col items-center justify-center" v-else>
          <div class="text-3xl font-medium">Dashboard</div>
          <span class="text-lg">Click items to add them to your dashboard</span>
        </div>
      </div>
    </div>
  </div>

  <div class="mt-4 flex justify-end">
    <button
      class="rounded-xl bg-primary px-4 py-2 text-lg hover:brightness-110 active:brightness-90"
    >
      Create dashboard
    </button>
  </div>
</template>

<script setup lang="ts">
  import SearchBar from '~/common/components/SearchBar.vue'
  import UserSearchItem from '~/create/components/UserSearchItem.vue'
  import UserSearchItemSkeleton from '~/create/components/UserSearchItemSkeleton.vue'
  import { searchUser } from '~/common/api/macro'
  import levenshtein from 'fast-levenshtein'
  import { useStateStore } from '~/stores/state'

  const state = useStateStore()

  const searchResults = ref<UserMacroAPI[]>([])
  const selectedUsers = reactive<{ [hash: string]: UserMacroAPI }>({})
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
      searchResults.value = res.sort((a: UserMacroAPI, b: UserMacroAPI) =>
        sortLogic(a, b, username)
      )
      lastSearchText = username
      loading.value = false
    } catch (err) {
      console.error(err)
    }
  }

  const sortLogic = (a: UserMacroAPI, b: UserMacroAPI, reference: string) => {
    const distanceA = levenshtein.get(a.username, reference)
    const distanceB = levenshtein.get(b.username, reference)
    return distanceA - distanceB
  }

  const getHash = (user: UserMacroAPI) => `${user.username}@${user.platform}`

  const addToDashboard = (clickedUser: UserMacroAPI) => {
    const hash = getHash(clickedUser)
    if (!selectedUsers[hash]) {
      selectedUsers[hash] = clickedUser
    }
  }

  const removeFromDashboard = (clickedUser: UserMacroAPI) => {
    const hash = getHash(clickedUser)
    delete selectedUsers[hash]
  }

  init()
</script>
