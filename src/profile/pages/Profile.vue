<template>
  <!-- Profile -->
  <div class="min-w-[700px]">
    <div class="mt-4 flex items-center justify-center">
      <!-- <div class="mr-6 h-32 w-32">
      <AccountAvatar :account="username" :imageSrc="user.imgUrl" size="large" />
    </div> -->
      <h1 class="titleGradient">{{ user.name }}</h1>
    </div>

    <div class="mx-4 grid grid-cols-4 gap-8">
      <!-- Calendar -->
      <div class="col-span-4 mt-8 flex w-full flex-row items-center justify-center py-4">
        <div class="flex w-full items-start justify-center p-6 cardComponent">
          <Calendar :calendar="calendar" :loading="loading" mainColor="#3694f2" />
        </div>
        <div class="ml-4 flex flex-col gap-1 p-4 cardComponent">
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
              :title="setColorFromLastActivity(repo.lastActivity)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 100 100">
                <circle
                  class="pulse-dot"
                  :class="setColorFromLastActivity(repo.lastActivity)"
                  cx="75"
                  cy="50"
                  r="20"
                />
              </svg>
            </span>
          </div>
          <div class="mt-auto flex items-center justify-between">
            <span class="text-sm text-gray-600">{{ repo.mainLanguage }}</span>
            <span class="text-sm text-gray-600"
              >{{ repo.isOwner ? 'Owner' : 'Contributor' }} {{ repo.isFork ? '(Fork)' : '' }}</span
            >
          </div>
        </div>
      </div>

      <!-- Language Portfolio -->
      <div class="col-span-2 flex h-[365px] flex-col items-center justify-center cardComponent">
        <Doughnut :data="languagePortfolio" :id="'doughnut-language-portfolio'" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { emptyCalendar, getFullCalendar } from '~/profile/helpers/calendar'
  import { getFullLanguagePortfolio } from '~/profile/helpers/langPortfolio'
  import { getFullOwnedReposList } from '~/profile/helpers/repositories'
  import { getUserData } from '~/profile/helpers/users'
  import { useStateStore } from '~/stores/state'
  import { ref } from 'vue'
  import { emptyAccount, emptyRepo } from '~/common/helpers/utils'

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
  const ownedReposList = ref<GitRepository[]>([emptyRepo(), emptyRepo(), emptyRepo()])
  const loading = ref(true)

  const activeYearIdx = ref(0)
  const years = [0, 1, 2, 3, 4].map(i => new Date().getFullYear() - i)

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

  const setColorFromLastActivity = (lastActivity: string) => {
    const diff = (new Date().getTime() - new Date(lastActivity).getTime()) / (1000 * 60 * 60 * 24)

    if (diff < 7) {
      return 'active'
    } else if (diff < 30) {
      return 'idle'
    } else {
      return 'inactive'
    }
  }

  const init = async () => {
    if (props.username == '@local') {
      user.value = state.localUser
    } else {
      user.value = await getUserData(props.username)
    }

    try {
      loading.value = true

      const res = await getFullCalendar(user.value.platforms)
      calendar.value = res
      const resLanguagePortfolio = await getFullLanguagePortfolio(user.value.platforms)
      languagePortfolio.value = resLanguagePortfolio
      const resOwnedReposList = await getFullOwnedReposList(user.value.platforms)
      resOwnedReposList.sort(
        (a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
      )
      ownedReposList.value = resOwnedReposList.slice(0, 8)
      loading.value = false
    } catch (err) {
      console.error(`Error loading profile`, err)
    }
  }

  init()
</script>

<!-- Repo activity styling -->
<style>
  .pulse-dot {
    animation: pulse 1.5s infinite ease-in-out;
  }

  /* Pulse animation */
  @keyframes pulse {
    0% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(1.2);
      opacity: 0.6;
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }

  /* Change color based on project activity status */
  .active {
    fill: rgb(24, 177, 24);
  }

  .inactive {
    fill: rgb(170, 170, 170);
  }

  .idle {
    fill: rgb(255, 237, 73);
  }
</style>
