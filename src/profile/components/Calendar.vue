<template>
  <div class="flex justify-center" v-if="calendar">
    <!-- Days of the week names -->
    <div class="inline-block">
      <div class="mr-1 flex flex-col">
        <div class="m-[0.1rem] flex h-4 w-4 items-center justify-center rounded-sm" v-for="i of 8">
          {{ weekDaysAxis[i - 1] }}
        </div>
      </div>
    </div>
    <div class="inline-block" v-for="(week, idx) of calendar.weeks">
      <!-- Month names -->
      <div class="m-[0.1rem] mb-1 flex h-4 w-4 items-center justify-center rounded-sm">
        {{ monthTitles[week.firstDay] }}
      </div>
      <!-- Data -->
      <div
        class="flex flex-col"
        :class="[{ 'animate-pulse': loading }]"
        v-for="day of week.days"
        :style="{ animationDelay: `${20 * idx}ms` }"
      >
        <div
          class="m-[0.1rem] h-4 w-4 rounded-sm"
          :style="{ background: getContributionColor(day.count) }"
        />
      </div>
    </div>
  </div>
  <!-- Legend -->
  <div class=""></div>
  <div class="mt-2 flex w-full items-center justify-center">
    <span class="mr-2">Low</span>
    <div
      class="m-[0.1rem] h-4 w-4 rounded-sm"
      :style="{ background: color }"
      v-for="color of colors"
    />
    <span class="ml-2">High</span>
  </div>
</template>

<script setup lang="ts">
  import { PropType, computed } from 'vue'
  import { emptyCalendar } from '~/profile/helpers/helpers'
  import { generateShades } from '~/common/helpers/utils'

  const props = defineProps({
    calendar: { type: Object as PropType<GitDashboardCalendar>, required: true },
    loading: { type: Boolean, default: false },
    mainColor: { type: String, default: '#30a14e' }
  })

  const colors = computed(() => ['#2b2f36', ...generateShades(props.mainColor, 5).slice(1)])

  const weekDaysAxis = ['', 'M', '', 'W', '', 'F', '', 'S']

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
        return '#2b2f36' //'#2b2f36'
      case count < 3:
        return colors.value[1] // '#9be9a8'
      case count < 5:
        return colors.value[2] // '#40c463'
      case count < 10:
        return colors.value[3] // '#30a14e'
      default:
        return colors.value[4] // '#216e39'
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