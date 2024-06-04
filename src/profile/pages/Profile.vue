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
  import { getFullCalendar } from '~/profile/helpers/helpers'
  import { emptyCalendar } from '~/profile/helpers/helpers'
  import AccountAvatar from '~/common/components/AccountAvatar.vue'
  import Calendar from '~/profile/components/Calendar.vue'

  const props = defineProps({
    username: { type: String, required: true }
  })

  const calendar = ref<GitDashboardCalendar>(emptyCalendar())
  const usernames = { github: props.username, gitlab: props.username }

  const init = async () => {
    try {
      const res = await getFullCalendar(usernames)
      calendar.value = res as GitDashboardCalendar
    } catch (err) {
      console.error(`Error getting calendar`, err)
    }
  }

  init()
</script>
