<template>
  <!-- Profile -->
  <div class="min-w-[700px]">
    <div class="mt-4 flex items-center justify-center">
      <!-- <div class="mr-6 h-32 w-32">
      <AccountAvatar :account="username" :imageSrc="user.imgUrl" size="large" />
    </div> -->
      <h1 class="titleGradient">{{ user.name }}</h1>
    </div>

    <div class="mx-12 grid grid-cols-4 gap-8">
      <!-- Calendar -->
      <div class="col-span-4 mt-8 flex w-full items-start justify-center p-6 cardComponent">
        <Calendar :calendar="calendar" :loading="loading" mainColor="#3694f2" />
        <div class="ml-4 hidden flex-col gap-1 xl:flex">
          <button
            class="rounded-[3px] px-4 py-[0.15rem] active:brightness-90"
            :class="
              activeYearIdx == idx ? 'bg-primary hover:brightness-110' : 'hover:bg-background-light'
            "
            @click="chooseYear(idx)"
            v-for="(year, idx) of years"
          >
            {{ year }}
          </button>
        </div>
      </div>

      <!-- Repos -->
      <div class="col-span-2 flex flex-col items-center md:col-span-2">
        <div
          v-for="repo in ownedReposList"
          :key="repo.id"
          class="mb-4 h-full w-[100%] p-6 cardComponent last:mb-0"
        >
          <div class="mb-4 flex items-center justify-between">
            <span class="text-md font-bold">{{ repo.name }}</span>
            <span
              id="activity-indicator"
              class="flex items-center"
              :title="getLastActivityMessage(repo.lastActivity)"
            >
              <EyeIcon class="h-4 w-4" :class="getLastActivityColor(repo.lastActivity)" />
            </span>
          </div>
          <div class="mt-auto flex items-center justify-between">
            <span class="text-sm text-gray-600">{{ repo.language }}</span>
            <span class="text-sm text-gray-600">Placeholder</span>
          </div>
        </div>
      </div>

      <!-- Language Portfolio -->
      <div class="col-span-2 flex h-[360px] flex-col items-center justify-center cardComponent">
        <Doughnut :data="languagePortfolio" :id="'doughnut-language-portfolio'" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { emptyCalendar, getFullCalendar } from '~/profile/helpers/calendar'
  import { getFullLanguagePortfolio } from '~/profile/helpers/langPortfolio'
  import { getFullOwnedReposList } from '~/profile/helpers/repositories'
  import { useStateStore } from '~/stores/state'
  import { ref } from 'vue'
  import { emptyAccount } from '~/common/helpers/utils'

  import { EyeIcon } from '@heroicons/vue/24/outline'

  import AccountAvatar from '~/common/components/AccountAvatar.vue'
  import Calendar from '~/profile/components/Calendar.vue'
  import Doughnut from '~/profile/components/Doughnut.vue'

  const props = defineProps({
    username: { type: String, required: true }
  })

  const state = useStateStore()
  const user = ref<Account>(emptyAccount())
  const calendar = ref<GitDashboardCalendar>(emptyCalendar())
  const languagePortfolio = ref<GitLanguagePortfolio>({})
  const ownedReposList = ref<GitRepository[]>({})
  const loading = ref(true)
  const activeYearIdx = ref(0)
  const years = [0, 1, 2, 3, 4].map(i => new Date().getFullYear() - i)

  // Tesing only
  const userMap: { [username: string]: Account } = {
    andreaduina: {
      username: 'andreaduina',
      name: 'Andrea Duina',
      email: '',
      imgUrl: '',
      platforms: {
        github: ['AndreaDuina'],
        gitlab: ['muwave']
      },
      socials: {}
    },
    francescozonaro: {
      username: 'francescozonaro',
      name: 'Francesco Zonaro',
      email: '',
      imgUrl: '',
      platforms: {
        github: ['francescozonaro'],
        gitlab: ['dimeilaz']
      },
      socials: {}
    }
  }

  const chooseYear = async (idx: number) => {
    loading.value = true
    activeYearIdx.value = idx
    const res = await getFullCalendar(
      user.value.platforms,
      `${years[idx]}-01-01T00:00:00Z`,
      `${years[idx]}-12-31T00:00:00Z`
    )
    loading.value = false
    calendar.value = res
  }

  const init = async () => {
    if (props.username == '@local') {
      user.value = state.localUser
    } else {
      // TODO: Get from server
      user.value = userMap[props.username]
    }

    try {
      loading.value = true

      const res = await getFullCalendar(user.value.platforms)
      calendar.value = res

      const resLanguagePortfolio = await getFullLanguagePortfolio(user.value.platforms)
      languagePortfolio.value = resLanguagePortfolio

      const resOwnedReposList = await getFullOwnedReposList(user.value.platforms)
      resOwnedReposList.sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity))
      ownedReposList.value = resOwnedReposList //.slice(0, 3)

      loading.value = false
    } catch (err) {
      console.error(`Error loading profile`, err)
    }
  }

  const getLastActivityMessage = (lastActivity: string) => {
    const diff = (new Date().getTime() - new Date(lastActivity).getTime()) / (1000 * 60 * 60 * 24)
    return 'last activity ' + Math.round(diff) + ' days ago'
  }

  const getLastActivityColor = (lastActivity: string) => {
    const diff = (new Date().getTime() - new Date(lastActivity).getTime()) / (1000 * 60 * 60 * 24)

    if (diff < 100) {
      return 'text-green'
    } else if (diff < 300) {
      return 'text-yellow-400'
    } else {
      return 'text-gray-400'
    }
  }

  init()
</script>
