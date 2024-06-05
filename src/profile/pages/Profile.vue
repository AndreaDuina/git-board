<template>
  <div class="flex items-center">
    <div class="mr-6 h-32 w-32">
      <AccountAvatar :account="username" :imageSrc="''" size="large" />
    </div>
    <h1 class="text-4xl font-semibold tracking-wider">{{ username }}</h1>
  </div>
  <Calendar :calendar="calendar" :loading="loading" />
</template>

<script setup lang="ts">
  import { computed, watch, ref } from 'vue'
  import { emptyCalendar, getFullCalendar } from '~/profile/helpers/helpers'
  import AccountAvatar from '~/common/components/AccountAvatar.vue'
  import Calendar from '~/profile/components/Calendar.vue'

  const props = defineProps({
    username: { type: String, required: true }
  })

  const calendar = ref<GitDashboardCalendar>(emptyCalendar())
  const loading = ref(true)

  const userMap = {
    andreaduina: {
      github: 'AndreaDuina',
      gitlab: 'muwave'
    },
    francescozonaro: {
      github: 'francescozonaro'
    }
  }

  const init = async () => {
    try {
      loading.value = true
      const res = await getFullCalendar(userMap[props.username])
      calendar.value = res as GitDashboardCalendar
      loading.value = false
    } catch (err) {
      console.error(`Error getting calendar`, err)
    }
  }

  init()
</script>
