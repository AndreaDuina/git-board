<template>
  <div class="mx-24 mt-12 flex flex-col items-center justify-center">
    <h1 class="mb-12 titleGradient">Your whole git history, all in one place</h1>

    <!-- <div class="mb-12 text-center">
      <p class="text-gray-400">
        Effortlessly manage your repositories across multiple platforms.
        <span class="text-gray-50">Login with your GitHub credentials</span>, link your GitLab
        account, fetch repository data, and view your commit calendar all in one place. Easily
        create and aggregate multiple users on a single dashboard for streamlined project
        management! 
      </p>
    </div> -->

    <div class="grid grid-cols-1 gap-x-4">
      <button @click="toggleTerminal" class="rounded-lg bg-white p-3 text-black hover:bg-gray-50">
        Get Started
      </button>
      <!-- <RouterLink
        :to="{ name: 'create' }"
        class="rounded-lg border-[0.5px] border-gray-800 bg-background-dark p-3 text-white hover:bg-opacity-75"
        >Create a new dashboard</RouterLink
      > -->
    </div>

    <div v-if="isTerminalVisible" class="mt-12 flex justify-center align-middle">
      <div
        class="terminal-shadow draggable w-[25rem] rounded-md bg-black md:w-[60rem]"
        id="terminal"
        @mousedown="startDrag"
        @click="setFocus"
        :style="terminalStyle"
      >
        <div class="flex h-8 items-center justify-between rounded-t-md bg-background-dark px-2">
          <span class="text-sm">Git Dashboard</span>
          <div class="flex items-center gap-2">
            <div class="h-3 w-3 rounded-full" style="background-color: #2aca44"></div>
            <div class="h-3 w-3 rounded-full" style="background-color: #ffbe2e"></div>
            <div
              class="h-3 w-3 cursor-pointer rounded-full"
              style="background-color: #ff5f5a"
              @click="toggleTerminal"
            ></div>
          </div>
        </div>
        <div class="h-[32rem] p-4 font-code">
          <div>
            <TerminalAddress />
            <span>git-board --help</span>
          </div>
          <div>
            <TerminalAddress />
            <span>Your whole git history, all in one place</span>
          </div>

          <div>
            <br />
            <TerminalAddress />
            <span>git-board search --platform [</span>
            <img :src="logoGH" class="inline-block h-4 w-4 rounded-full" />
            <span>'GitHub', </span>
            <img :src="logoGL" class="inline-block h-4 w-4 rounded-full" />
            <span>'GitLab']</span>
          </div>
          <div>
            <TerminalInputLine @on-enter="onCommandEnter" :focused="focused">
              Enter username:&nbsp;
            </TerminalInputLine>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .terminal-shadow {
    -webkit-box-shadow: 0px 0px 05px 1px rgb(var(--color-background-light) / 1);
    -moz-box-shadow: 0px 0px 05px 1px rgb(var(--color-background-light) / 1);
    box-shadow: 0px 0px 05px 1px rgb(var(--color-background-light) / 1);
  }

  .draggable {
    position: absolute;
    cursor: move;
    user-select: none;
  }
</style>

<script setup lang="ts">
  import { useStateStore } from '~/stores/state'
  import { ref } from 'vue'
  import TerminalInputLine from '~/home/components/TerminalInputLine.vue'
  import TerminalAddress from '../components/TerminalAddress.vue'
  import logoGH from '~/assets/github-mark-white.svg'
  import logoGL from '~/assets/gitlab-logo.svg'

  const state = useStateStore()
  const router = useRouter()

  const focused = ref(true)
  const position = ref({ top: '10%', left: '10%' })
  const terminalStyle = ref({
    top: position.value.top,
    left: position.value.left
  })
  const isTerminalVisible = ref(false)

  const toggleTerminal = () => {
    isTerminalVisible.value = !isTerminalVisible.value
  }

  const search = async (username: string, platforms: string[]) => {
    state.searchUsersParams = { username, platforms }
    router.push({ name: 'create' })
  }

  const onCommandEnter = (text: string) => {
    search(text, ['github', 'gitlab'])
  }

  const setFocus = () => {
    focused.value = true
    document.addEventListener('click', handleClickOutside)
  }

  const handleClickOutside = (event: MouseEvent) => {
    if (!document.getElementById('terminal')?.contains(event.target as Node)) {
      focused.value = false
      document.removeEventListener('click', handleClickOutside)
    }
  }

  const startDrag = (event: MouseEvent) => {
    event.preventDefault()
    const terminal = document.getElementById('terminal')
    if (!terminal) return

    const shiftX = event.clientX - terminal.getBoundingClientRect().left
    const shiftY = event.clientY - terminal.getBoundingClientRect().top

    const moveAt = (pageX: number, pageY: number) => {
      const windowWidth = window.innerWidth
      const windowHeight = window.innerHeight
      const terminalRect = terminal.getBoundingClientRect()

      const maxLeft = Math.max(0, windowWidth - terminalRect.width)
      const maxTop = Math.max(0, windowHeight - terminalRect.height)

      const newLeft = Math.min(maxLeft, Math.max(0, pageX - shiftX))
      const newTop = Math.min(maxTop, Math.max(0, pageY - shiftY))

      terminal.style.left = newLeft + 'px'
      terminal.style.top = newTop + 'px'

      terminalStyle.value = {
        top: terminal.style.top,
        left: terminal.style.left
      }
    }

    const onMouseMove = (moveEvent: MouseEvent) => {
      moveAt(moveEvent.pageX, moveEvent.pageY)
    }

    document.addEventListener('mousemove', onMouseMove)

    document.onmouseup = () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.onmouseup = null
    }
  }
</script>
