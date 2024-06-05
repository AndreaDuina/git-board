<template>
  <div class="flex justify-center" v-if="calendar">
    <div class="inline-block">
      <div class="flex flex-col" v-for="i of 8">
        <div class="m-[0.1rem] flex h-4 w-4 items-center justify-center rounded-sm">
          {{ weekDays[i - 1] }}
        </div>
      </div>
    </div>
    <div class="inline-block" v-for="week of calendar.weeks">
      <div class="m-[0.1rem] flex h-4 w-4 items-center justify-center rounded-sm">
        {{ monthTitles[week.firstDay] }}
      </div>
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
  import { PropType, computed } from 'vue'

  const props = defineProps({
    calendar: { type: Object as PropType<GitDashboardCalendar>, required: true }
  })

  const weekDays = {
    0: '',
    1: 'M',
    2: '',
    3: 'W',
    4: '',
    5: 'F',
    6: '',
    7: 'S'
  }

  const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec'
  ]

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

  const monthTitles = computed(() => {
    const result: { [firstDay: string]: string } = {}

    let lastMonth = ''
    for (const week of props.calendar.weeks) {
      const firstDay = week.firstDay
      const month = firstDay.substring(5, 7)
      if (lastMonth != month) {
        result[firstDay] = monthNames[parseInt(month) - 1]
        lastMonth = month
        continue
      }
      result[firstDay] = ''
    }

    return result
  })
</script>
