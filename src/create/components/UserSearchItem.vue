<template>
  <div
    class="cursor-pointer select-none rounded-xl bg-background-light px-8 py-4 transition-colors lg:w-full"
    :class="darkHover ? 'hover:bg-background' : 'hover:bg-background-bright'"
    @click="emit('onClick', user)"
  >
    <div class="flex items-center">
      <img
        class="mr-2 h-16 w-16 select-none rounded-full border-2 border-light"
        :src="user.imgUrl"
      />
      <div class="hidden flex-col gap-y-1 lg:flex">
        <div class="flex items-center">
          <img class="mr-2 h-6 w-6 select-none" :src="platformLogo" />
          <h2 class="text-xl font-medium">{{ user.username }}</h2>
        </div>
        <div class="text-sm">{{ user.pageUrl }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import logoGH from '~/assets/github-mark-white.svg'
  import logoGL from '~/assets/gitlab-logo.svg'

  const props = defineProps({
    user: { type: Object as PropType<GitUser>, required: true },
    darkHover: { type: Boolean, default: false }
  })

  const emit = defineEmits<{
    (e: 'onClick', user: GitUser): void
  }>()

  const logosMap: { [platform: string]: string } = {
    github: logoGH,
    gitlab: logoGL
  }

  const platformLogo = computed(() => logosMap[props.user.platform])
</script>
