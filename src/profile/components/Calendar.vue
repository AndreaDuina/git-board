<template>
  <div class="flex justify-center" v-if="calendar">
    <div class="inline-block" v-for="week of calendar.weeks">
      <div class="flex flex-col" v-for="day of week.contributionDays">
        <div class="m-[0.1rem] h-4 w-4 rounded-sm" :style="{ background: day.color }" />
      </div>
    </div>
  </div>
  <div v-else>No data</div>
</template>

<script setup lang="ts">
  import { PropType } from 'vue'

  const props = defineProps({
    calendar: { type: Object as PropType<GitHubCalendar>, required: true }
  })

  const getColor = (count: number): string => {
    switch (count) {
      default:
        return '#ffffff'
    }
  }
</script>
