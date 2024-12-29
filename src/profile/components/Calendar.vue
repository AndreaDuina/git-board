<template>
  <div v-if="calendar">
    <div class="flex justify-center">
      <!-- Days of the week names -->
      <div class="mr-1 flex flex-col">
        <div class="m-[0.1rem] flex h-4 w-4 items-center justify-center rounded-sm" v-for="i of 8">
          {{ weekDaysAxis[i - 1] }}
        </div>
      </div>

      <!-- Xl screens calendar-->
      <div class="hidden flex-col xl:flex" v-for="(week, idx) of calendar.weeks">
        <!-- Month names -->
        <div class="m-[0.1rem] mb-1 flex h-4 w-4 items-center justify-center rounded-sm">
          {{ monthTitles[week.firstDay] ?? '' }}
        </div>
        <!-- Data -->
        <div
          class="m-[0.1rem] h-4 w-4 rounded-sm"
          :class="[{ 'animate-pulse': loading }]"
          :style="{ background: getContributionColor(day.count), animationDelay: `${20 * idx}ms` }"
          v-for="day of week.days"
        />
      </div>

      <!-- Lg screens calendar-->
      <div
        class="hidden flex-col lg:flex xl:hidden"
        v-for="(week, idx) of calendar.weeks.slice(
          calendar.weeks.length - 41,
          calendar.weeks.length
        )"
      >
        <!-- Month names -->
        <div class="m-[0.1rem] mb-1 flex h-4 w-4 items-center justify-center rounded-sm">
          {{ monthTitles[week.firstDay] ?? '' }}
        </div>
        <!-- Data -->
        <div
          class="m-[0.1rem] h-4 w-4 rounded-sm"
          :class="[{ 'animate-pulse': loading }]"
          :style="{ background: getContributionColor(day.count), animationDelay: `${20 * idx}ms` }"
          v-for="day of week.days"
        />
      </div>

      <!-- Mid screens calendar-->
      <div
        class="flex flex-col lg:hidden"
        v-for="(week, idx) of calendar.weeks.slice(
          calendar.weeks.length - 29,
          calendar.weeks.length
        )"
      >
        <!-- Month names -->
        <div class="m-[0.1rem] mb-1 flex h-4 w-4 items-center justify-center rounded-sm">
          {{ monthTitles[week.firstDay] ?? '' }}
        </div>
        <!-- Data -->
        <div
          class="m-[0.1rem] h-4 w-4 rounded-sm"
          :class="[{ 'animate-pulse': loading }]"
          :style="{ background: getContributionColor(day.count), animationDelay: `${20 * idx}ms` }"
          v-for="day of week.days"
        />
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
