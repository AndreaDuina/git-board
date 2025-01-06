<template>
  <div v-if="calendar">
    <div class="flex justify-center">
      <!-- Days of the week names -->
      <div class="mr-1 flex flex-col">
        <div
          class="m-[0.1rem] flex h-4 w-4 justify-center rounded-sm text-sm first:mt-2"
          v-for="i of 8"
        >
          {{ weekDaysAxis[i - 1] }}
        </div>
      </div>

      <div class="flex flex-col">
        <div class="flex w-full flex-wrap justify-start xl:justify-between">
          <div v-for="(week, idx) of calendar.weeks" :key="idx" class="flex flex-col">
            <div class="m-[0.1rem] mt-2 mb-1 flex h-4 w-4 items-center rounded-sm text-sm">
              {{ monthTitles[week.firstDay] ?? '' }}
            </div>
            <div
              class="m-[0.1rem] h-4 w-4 rounded-sm"
              :class="[{ 'animate-pulse': loading }]"
              :style="{
                background: getContributionColor(day.count),
                animationDelay: `${20 * idx}ms`
              }"
              v-for="day of week.days"
              :title="day.date"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Legend -->
    <div class="mt-2 flex w-full items-center justify-center">
      <span class="mr-2">Low</span>
      <div
        class="m-[0.1rem] h-4 w-4 rounded-sm"
        :style="{ background: color }"
        v-for="color of colors"
      />
      <span class="ml-2">High</span>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { PropType, computed, onMounted, onUnmounted, ref, watch } from 'vue'
  import { generateShades } from '~/common/helpers/utils'

  const props = defineProps({
    calendar: { type: Object as PropType<GitDashboardCalendar>, required: true },
    loading: { type: Boolean, default: false },
    mainColor: { type: String, default: '#30a14e' }
  })

  const monthTitles = ref<{ [firstDay: string]: string }>({})
  const colors = computed(() => ['#2b2f36', ...generateShades(props.mainColor, 5).slice(1)])

  const weekDaysAxis = ['', '', 'M', '', 'W', '', 'F', '']
  // prettier-ignore
  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

  const getContributionColor = (count: number): string => {
    switch (true) {
      case count < 0:
        return ''
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

  const updateMonthTitles = () => {
    const result: { [firstDay: string]: string } = {}

    let lastMonth = ''
    for (const week of props.calendar.weeks) {
      const validDay = week.days.find(day => day.count > -1)
      const firstValidDay = validDay ? validDay.date : new Date(0).toISOString()
      const firstDay = week.firstDay
      const month = firstValidDay.substring(5, 7)
      if (lastMonth != month) {
        result[firstDay] = monthNames[parseInt(month) - 1]
        lastMonth = month
        continue
      }
      result[firstDay] = ''
    }

    const values = Object.values(result)

    let left = 0
    let right = values.length - 1
    while (left < values.length && values[left] === '') {
      left++
    }
    while (right >= 0 && values[right] === '') {
      right--
    }
    if (values[left] === values[right]) {
      result[Object.keys(result)[left]] = ''
      // delete result[Object.keys(result)[left]]
    }

    monthTitles.value = result
  }

  onMounted(updateMonthTitles)
  onMounted(() => {
    const unwatch = watch(() => props.calendar, updateMonthTitles, {
      deep: true
    })
    onUnmounted(unwatch)
  })
</script>
