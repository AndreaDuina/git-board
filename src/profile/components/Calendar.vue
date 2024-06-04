<template>
  <div class="flex justify-center" v-if="calendar">
    <div class="inline-block" v-for="week of calendar.weeks">
      <div class="flex flex-col" v-for="day of week.days">
        <div
          class="m-[0.1rem] h-4 w-4 rounded-sm"
          :style="{ background: getContributionColor(day.count) }"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { PropType } from 'vue'

  const props = defineProps({
    calendar: { type: Object as PropType<GitDashboardCalendar>, required: true }
  })

  const getContributionColor = (count: number): string => {
    switch (true) {
      case count < 1:
        return '#ffffff'
      case count < 3:
        return '#9be9a8'
      case count < 5:
        return '#40c463'
      case count < 10:
        return '#30a14e'
      default:
        return '#216e39'
    }
  }
</script>
