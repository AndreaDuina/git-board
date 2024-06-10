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

  <div class="mt-8">
    <h3 class="text-3xl font-medium">Language portfolio</h3>
    <div class="mt-4">
      <Doughnut :data="languagePortfolio" :id="'d1'" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, watch, ref } from 'vue'
  import {
    emptyCalendar,
    getFullCalendar,
    getFullLanguagePortfolio
  } from '~/profile/helpers/helpers'
  import AccountAvatar from '~/common/components/AccountAvatar.vue'
  import Calendar from '~/profile/components/Calendar.vue'
  import { useStateStore } from '~/stores/state'
  import { emptyAccount } from '~/common/helpers/utils'
  import Doughnut from '~/profile/components/Doughnut.vue'

  const props = defineProps({
    username: { type: String, required: true }
  })

  const state = useStateStore()

  const user = ref<Account>(emptyAccount())
  const calendar = ref<GitDashboardCalendar>(emptyCalendar())
  const languagePortfolio = ref<GitDashboardLanguageProficiency>({})
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

      loading.value = false
    } catch (err) {
      console.error(`Error loading profile`, err)
    }
  }

  init()
</script>
