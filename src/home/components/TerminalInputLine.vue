<template>
  <div class="font-code">
    <div class="relative flex w-full items-center">
      <slot />
      <div class="relative flex flex-grow items-center">
        <!--@focus="focused = true" @blur="focused = false"-->
        <input
          ref="input"
          type="text"
          class="terminal-input w-full border-none bg-transparent text-white placeholder-transparent outline-none focus:outline-none"
          v-model="inputValue"
          @input="updateCaretPosition"
          @click="updateCaretPosition"
          @keyup.enter="emit('onEnter', inputValue)"
        />
        <span
          ref="caret"
          class="caret absolute top-1/2 h-[1em] w-[0.5em] -translate-y-1/2 bg-white"
          :style="{ left: caretPosition }"
          v-show="focused"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
  .terminal-input {
    position: relative;
    z-index: 10;
    color: transparent;
    text-shadow: 0 0 0 white;
  }

  .caret {
    width: 0.5em;
    height: 1em;
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    z-index: 5;
    animation: blink 1s step-end infinite;
  }

  @keyframes blink {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0;
    }
  }
</style>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue'

  const props = defineProps({
    focused: { type: Boolean, required: true }
  })

  const emit = defineEmits<{
    (e: 'onEnter', text: string): void
  }>()

  const inputValue = ref('')
  const input = ref<HTMLInputElement | null>(null)

  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')!

  const updateCaretPosition = () => {
    const inputEl = input.value
    if (!inputEl) return

    const inputValueText = inputValue.value.substring(0, inputEl.selectionStart as number)
    let width = 0

    // Measure the width of the input value text
    width = context.measureText(inputValueText).width

    return `${width}px`
  }

  const caretPosition = computed(() => {
    return updateCaretPosition()
  })

  onMounted(() => {
    // Set font style for measurement
    context.font = window.getComputedStyle(input.value as HTMLInputElement).font
    input.value?.focus()
  })

  watch(
    () => props.focused,
    newValue => {
      if (newValue) {
        input.value?.focus()
      }
    }
  )
</script>
