<template>
  <img
    v-if="!imgError"
    :src="imageSrc"
    class="inline-block rounded-full border border-background-bright"
    :class="imgClass"
    @error="onError"
  />
  <span
    v-else
    class="inline-flex items-center justify-center rounded-full border border-background-bright"
    :class="imgClass || 'h-full w-full'"
    :style="`color: ${fgColor}; background-color: ${bgColor}`"
  >
    <span class="text-sm font-medium leading-none">{{ account.slice(0, 1).toUpperCase() }}</span>
  </span>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { colorFromString, invertColor } from '~/common/helpers/utils'

  const props = defineProps<{
    account: string
    imageSrc: string
    size?: string
    imgClass?: string
    static?: boolean
  }>()

  const imgError = ref(false)
  const fgColor = ref('')
  const bgColor = ref('')

  const onError = (event: any) => {
    imgError.value = true
  }
</script>
