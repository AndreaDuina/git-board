<template>
  <h1 class="text-4xl font-semibold tracking-wider">{{ username }}</h1>
  <div class="mt-4 flex justify-center" v-if="calendar">
    <div class="inline-block" v-for="week of calendar.weeks">
      <div class="flex flex-col" v-for="day of week.contributionDays">
        <div class="m-[0.1rem] h-4 w-4 rounded-sm" :style="{ background: day.color }" />
      </div>
    </div>
  </div>
  <div v-else>No data</div>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue'
  import { getContributionCalendar } from '~/common/api/github'

  const props = defineProps({
    username: { type: String, required: true }
  })
  const calendar = ref<GitHubCalendar>()

  const init = async () => {
    try {
      const res = await getContributionCalendar(props.username)
      calendar.value = res as GitHubCalendar
    } catch (err) {
      console.error(`Error getting calendar`, err)
    }
  }

  init()

  watch(
    () => props.username,
    async () => {
      calendar.value = (await getContributionCalendar(props.username)) as GitHubCalendar
    }
  )
</script>
