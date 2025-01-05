<template>
  <div class="mt-4 flex items-center justify-center">
    <h1 class="titleGradient">Settings</h1>
  </div>
  <div class="flex items-center justify-center rounded-lg p-6 shadow-md">
    <form @submit.prevent="saveUserData" class="w-[70%] space-y-6">
      <div>
        <label class="block font-medium">Username</label>
        <input v-model="user.username" type="text" class="inputFieldComponent mt-1 w-full p-2" />
      </div>

      <div>
        <label class="block font-medium">Name</label>
        <input v-model="user.name" type="text" class="inputFieldComponent mt-1 w-full p-2" />
      </div>

      <div>
        <label class="block font-medium">Email</label>
        <input v-model="user.email" type="email" class="inputFieldComponent mt-1 w-full p-2" />
      </div>

      <div>
        <label class="block font-medium">Image URL</label>
        <input v-model="user.imgUrl" type="text" class="inputFieldComponent mt-1 w-full p-2" />
      </div>

      <!-- Platforms -->
      <div>
        <label class="mb-2 block font-medium">Platforms</label>
        <div v-for="(accounts, platform) in user.platforms" :key="platform" class="space-y-2">
          <div class="flex flex-wrap items-center">
            <img v-if="platform === 'github'" :src="logoGH" class="mr-2 h-6 w-6 rounded-full" />
            <img v-if="platform === 'gitlab'" :src="logoGL" class="mr-2 h-6 w-6 rounded-full" />
            <!-- Existing Usernames -->
            <div
              v-for="(username, index) in accounts"
              :key="index"
              class="flex items-center justify-center rounded-md p-2"
            >
              <div class="relative inline-block">
                <div class="inputFieldComponent mt-1 flex flex-row items-center justify-center p-2">
                  <input
                    v-model="user.platforms[platform][index]"
                    type="text"
                    class="mr-2 rounded-md bg-secondary focus:outline-none"
                  />
                  <MinusCircleIcon
                    @click="removePlatformUsername(String(platform), index)"
                    class="h-5 w-5 transition-transform duration-200 hover:scale-110"
                  ></MinusCircleIcon>
                </div>
              </div>
            </div>
            <!-- Add username -->
            <PlusCircleIcon
              class="mt-1 h-5 w-5 transition-transform duration-200 hover:scale-110"
              @click="addPlatformUsername(String(platform))"
            >
            </PlusCircleIcon>
          </div>
        </div>
      </div>

      <!-- Socials -->
      <div>
        <label class="block font-medium">Socials</label>
      </div>

      <div class="mt-4 text-center">
        <button type="submit" class="rounded px-4 py-2 text-white cardComponent hover:bg-gray-800">
          Save Changes
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
  import { getUserData, setUserData } from '~/common/api/users'
  import { ref } from 'vue'
  import { emptyAccount } from '~/common/helpers/utils'
  import { MinusCircleIcon, PlusCircleIcon } from '@heroicons/vue/24/outline'
  import logoGH from '~/assets/github-mark-white.svg'
  import logoGL from '~/assets/gitlab-logo.svg'

  const props = defineProps({
    username: { type: String, required: true }
  })
  const user = ref<Account>(emptyAccount())
  const loading = ref(true)

  const saveUserData = async () => {
    try {
      loading.value = true
      await setUserData(props.username, user.value)
      alert('User data updated successfully!')
    } catch (err) {
      console.error('Error saving user data', err)
      alert('Failed to save user data.')
    } finally {
      loading.value = false
    }
  }

  const addPlatformUsername = (platform: string) => {
    user.value.platforms[platform] = user.value.platforms[platform] || []
    user.value.platforms[platform].push('')
  }

  const removePlatformUsername = (platform: string, index: number) => {
    user.value.platforms[platform].splice(index, 1)
  }

  const init = async () => {
    try {
      loading.value = true
      user.value = await getUserData(props.username)
    } catch (err) {
      console.error(`Error loading profile`, err)
    } finally {
      loading.value = false
    }
  }

  init()
</script>
