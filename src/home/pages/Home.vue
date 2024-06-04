<template>
  <div>Homedev</div>
  <div>{{ res }}</div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { getIssues } from '~/common/api/github'

  const res = ref()

  const init = async () => {
    const result = await getIssues('AndreaDuina')
    res.value = processEvents(result.data)
  }

  const processEvents = (events: any[]) => {
    console.log('events', events)
    const activity: any = {}

    events.forEach((event: any) => {
      const date = new Date(event.created_at).toISOString().split('T')[0]
      if (!activity[date]) {
        activity[date] = 0
      }
      activity[date]++
    })

    console.log('activity', activity)
    return activity
  }

  init()
</script>
