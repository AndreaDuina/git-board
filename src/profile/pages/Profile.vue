<template>
  <div class="flex items-center">
    <div class="mr-6 h-32 w-32">
      <AccountAvatar :account="username" :imageSrc="''" size="large" />
    </div>
    <h1 class="text-4xl font-semibold tracking-wider">{{ username }}</h1>
  </div>
  <div class="flex w-full items-start justify-center">
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
</template>

<script setup lang="ts">
  import { computed, watch, ref } from 'vue'
  import { emptyCalendar, getFullCalendar } from '~/profile/helpers/helpers'
  import AccountAvatar from '~/common/components/AccountAvatar.vue'
  import Calendar from '~/profile/components/Calendar.vue'

  const props = defineProps({
    username: { type: String, required: true }
  })

  const calendar = ref<GitDashboardCalendar>(emptyCalendar())
  const loading = ref(true)
  const activeYearIdx = ref(0)
  const years = [0, 1, 2, 3, 4].map(i => new Date().getFullYear() - i)

  const userMap: { [username: string]: { [platform: string]: string } } = {
    andreaduina: {
      github: 'AndreaDuina',
      gitlab: 'muwave'
    },
    francescozonaro: {
      github: 'francescozonaro'
    }
  }

  const chooseYear = async (idx: number) => {
    loading.value = true
    activeYearIdx.value = idx
    const res = await getFullCalendar(
      userMap[props.username],
      `${years[idx]}-01-01T00:00:00Z`,
      `${years[idx] + 1}-01-01T00:00:00Z`
    )
    loading.value = false
    calendar.value = res
  }

  const init = async () => {
    try {
      loading.value = true
      const res = await getFullCalendar(userMap[props.username])
      calendar.value = res
      loading.value = false
    } catch (err) {
      console.error(`Error getting calendar`, err)
    }
  }

  init()
</script>
