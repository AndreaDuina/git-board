<template>
  <!-- Profile -->
  <div class="mt-4 flex items-center">
    <div class="mr-6 h-32 w-32">
      <AccountAvatar :account="username" :imageSrc="user.imgUrl" size="large" />
    </div>
    <h1 class="text-4xl font-semibold tracking-wider">{{ user.name }}</h1>
  </div>

  <!-- Calendar -->
  <div class="mt-8 flex w-full items-start justify-center">
    <Calendar :calendar="calendar" :loading="loading" mainColor="#3694f2" />
    <div class="ml-4 flex flex-col gap-1">
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

  <!-- Stats -->
  <div class="mt-8 grid w-full grid-cols-2 gap-8">
    <div class="flex flex-col items-center">
      <Doughnut :data="languagePortfolio" :id="'doughnut-language-portfolio'" />
    </div>
    <div class="flex flex-col items-center">
      <div class="flex flex-col items-center">Placeholder</div>
    </div>
  </div>
  <div class="flex flex-col items-center">
    <div v-for="repo in ownedReposList" :key="repo.id" class="flex flex-col items-center">
      <div class="mt-3 w-[600px] rounded-xl border-[0.5px] p-6 text-center shadow-xl">
        {{ repo.name }} {{ repo.id }} {{ repo.owner.login || repo.owner.username }}
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

  import AccountAvatar from '~/common/components/AccountAvatar.vue'
  import Calendar from '~/profile/components/Calendar.vue'
  import Doughnut from '~/profile/components/Doughnut.vue'

  const props = defineProps({
    username: { type: String, required: true }
  })

  const state = useStateStore()
  const user = ref<Account>(emptyAccount())
  const calendar = ref<GitDashboardCalendar>(emptyCalendar())
  const languagePortfolio = ref<GitDashboardLanguageProficiency>({})
  const ownedReposList = ref<GitDashboardRepository[]>({})
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
      ownedReposList.value = resOwnedReposList

      loading.value = false
    } catch (err) {
      console.error(`Error loading profile`, err)
    }
  }

  init()
</script>
