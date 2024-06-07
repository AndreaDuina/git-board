<template>
  <div
    class="w-full rounded-xl bg-background-light px-8 py-4 transition-colors"
    :class="darkHover ? 'hover:bg-background' : 'hover:bg-background-bright'"
    @click="emit('onClick', user)"
  >
    <div class="flex items-center">
      <img class="mr-2 h-16 w-16 rounded-full border-2 border-light" :src="user.imgUrl" />
      <div class="flex flex-col">
        <div class="flex items-center">
          <img class="mr-2 h-6 w-6" :src="platformLogo" />
          <h2 class="text-2xl font-medium">{{ user.username }}</h2>
        </div>
        <div>{{ user.pageUrl }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import logoGH from '~/assets/github-mark-white.svg'
  import logoGL from '~/assets/gitlab-logo.svg'

  const props = defineProps({
    user: { type: Object as PropType<UserMacroAPI>, required: true },
    darkHover: { type: Boolean, default: false }
  })

  const emit = defineEmits<{
    (e: 'onClick', user: UserMacroAPI): void
  }>()

  const logosMap = {
    github: logoGH,
    gitlab: logoGL
  }

  const platformLogo = computed(() => logosMap[props.user.platform])
</script>
