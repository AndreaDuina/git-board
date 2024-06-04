<template>
  <div class="flex items-center">
    <div class="mr-6 h-32 w-32">
      <AccountAvatar :account="username" :imageSrc="''" size="large" />
    </div>
    <h1 class="text-4xl font-semibold tracking-wider">{{ username }}</h1>
  </div>
  <Calendar :calendar="calendar" />
</template>

<script setup lang="ts">
  import { computed, watch, ref } from 'vue'
  import { getContributionCalendarGH } from '~/common/api/github'
  import AccountAvatar from '~/common/components/AccountAvatar.vue'
  import Calendar from '~/profile/components/Calendar.vue'

  const props = defineProps({
    username: { type: String, required: true }
  })

  /*
  Your task is to help generalize the idea of a calendar across different plafroms.
  I created an interface describing how a standard calendar object should look like in our app, you
  can find it in common/types/gitDashboard.d.ts

  .1 EMPTY CALENDAR
  Complete the emptyCalendar function in profile/helpers/helpers.ts. It should return an empty calendar
  object that follows the GitDashboardCalendar interface found in common/types/gitDashboard.d.ts.
  IMPORTANT: the empty object should have already have all the days with the correct date, and the
    contribution count initialized to 0.

  .2 PARSER FUNCTIONS
  Functions that parse the API responses to the standard calendar signature described in common/types/gitDashboard.d.ts.
    .1.1 Complete parseCalendarGithub
    .1.2 Complete parseCalendarGitlab
  TIP: you may want to use the emptyCalendar function

  .3 CALENDAR SUM
  Right now we only show GitHub calendars, but ideally we want to get the calendar sum across
  multiple platforms. Open profile/helpers/helpers.ts. In the function getFullCalendar I set
  up a general algorithm that achieves just that. You DO NOT have to modify getFullCalendar, but
  complete the sumCalendars function, which is required by getFullCalendar.

  .4 CALENDAR VUE COMPONENT
    .4.1 Replace in this page getContributionCalendarGH with getFullCalendar.
    .4.2 BONUS: Completing .4.1 will break the profile/components/Calendar.vue component. Fix it.
  */

  const calendar = ref<GitHubCalendar>()
  const init = async () => {
    try {
      const res = await getContributionCalendarGH(props.username)
      calendar.value = res as GitHubCalendar
    } catch (err) {
      console.error(`Error getting calendar`, err)
    }
  }

  watch(
    () => props.username,
    async () => {
      calendar.value = (await getContributionCalendarGH(props.username)) as GitHubCalendar
    }
  )

  init()
</script>
