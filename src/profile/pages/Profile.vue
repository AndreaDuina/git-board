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
  import { ref, watch, computed } from 'vue'
  import { getContributionCalendar } from '~/common/api/github'

  const props = defineProps({
    username: { type: String, required: true }
  })
  const calendar = computed(async () => {
    try {
      return await getContributionCalendar(props.username)
    } catch (err) {
      console.error(`Error getting calendar`, err)
    }
  })
</script>
