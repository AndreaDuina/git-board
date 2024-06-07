<template>
  <div class="relative mt-12 h-screen w-full">
    <!--div class="absolute top-0 left-0 z-20 w-full">
      <SearchBar @search="search" />
    </div-->
    <!--div class="font-code absolute top-1/2 right-12 z-20 -translate-y-1/2 text-right">
      <h1 class="text-6xl font-semibold tracking-wide">Your whole git history</h1>
      <h2 class="mt-2 text-4xl font-medium tracking-wide">All in one place</h2>
    </div -->

    <div class="absolute top-1/3 right-12 z-20 flex w-full -translate-y-1/2 justify-end">
      <div
        class="w-[60rem] rounded-md bg-background-dark shadow-2xl shadow-background-light"
        id="terminal"
        @click="setFocus"
      >
        <div class="flex h-8 items-center justify-between bg-black px-2">
          <span class="text-sm">Git Dashboard</span>
          <div class="flex items-center gap-2">
            <div class="h-3 w-3 rounded-full" style="background-color: #2aca44"></div>
            <div class="h-3 w-3 rounded-full" style="background-color: #ffbe2e"></div>
            <div class="h-3 w-3 rounded-full" style="background-color: #ff5f5a"></div>
          </div>
        </div>
        <div class="font-code h-[32rem]">
          <div>
            <TerminalAddress />
            <span>git-board --help</span>
          </div>

          <!-- prettier-ignore -->
          <div class="font-code w-full text-sm">
            <br>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;@@@@@@&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;@@@@@@@@@@&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;@@&nbsp;&nbsp;@@@@@@@@@@&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;@@@@@@&nbsp;&nbsp;&nbsp;&nbsp;@@@@@@@@&nbsp;&nbsp;&nbsp;&nbsp;<br>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;@@@@@@@@&nbsp;&nbsp;&nbsp;&nbsp;@@@@@@@@@@&nbsp;&nbsp;<br>
            &nbsp;&nbsp;&nbsp;&nbsp;@@@@@@@@@@@@&nbsp;&nbsp;&nbsp;&nbsp;@@@@@@@@@@<br>
            &nbsp;&nbsp;@@@@@@@@@@@@@@&nbsp;&nbsp;@@&nbsp;&nbsp;&nbsp;&nbsp;@@@@@@<br>
            &nbsp;&nbsp;@@@@@@@@@@@@@@&nbsp;&nbsp;@@&nbsp;&nbsp;&nbsp;&nbsp;@@@@@@<br>
            &nbsp;&nbsp;@@@@@@@@@@@@@@&nbsp;&nbsp;@@@@@@@@@@@@<br>
            &nbsp;&nbsp;&nbsp;&nbsp;@@@@@@@@@@&nbsp;&nbsp;&nbsp;&nbsp;@@@@@@@@@@&nbsp;&nbsp;<br>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;@@@@@@@@&nbsp;&nbsp;&nbsp;&nbsp;@@@@@@@@&nbsp;&nbsp;&nbsp;&nbsp;<br>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;@@@@@@@@&nbsp;&nbsp;@@@@@@&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;@@@@@@@@@@@@&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;@@@@@@@@&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
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
              &nbsp;Enter username:&nbsp;
            </TerminalInputLine>
          </div>
        </div>
      </div>
    </div>

    <img
      :src="fullCanlendar"
      class="absolute top-0 left-0 z-0 h-[40rem] blur-[3px] brightness-125"
    />
    <div class="absolute top-0 left-0 z-10 h-[40rem] w-full bg-background opacity-0" />
  </div>
</template>

<style scoped>
  .no-scroll::-webkit-scrollbar {
    display: none;
  }

  /* Hide scrollbar for IE, Edge and Firefox */
  .no-scroll {
    -ms-overflow-style: none; /* IE and Edge */
    scrollbar-width: none; /* Firefox */
  }
</style>

<script setup lang="ts">
  import SearchBar from '~/common/components/SearchBar.vue'
  import { useStateStore } from '~/stores/state'
  import { useRouter } from 'vue-router'
  import fullCanlendar from '~/assets/fullCalendar.png'
  import TerminalInputLine from '~/home/components/TerminalInputLine.vue'
  import TerminalAddress from '../components/TerminalAddress.vue'
  import logoGH from '~/assets/github-mark-white.svg'
  import logoGL from '~/assets/gitlab-logo.svg'

  const state = useStateStore()
  const router = useRouter()

  const focused = ref(true)

  const search = async (username: string, platforms: string[]) => {
    state.searchUsersParams = { username, platforms }
    router.push({ name: 'create' })
  }

  const onCommandEnter = (text: string) => {
    search(text, ['github', 'gitlab'])
  }

  const setFocus = () => {
    console.log('click')
    focused.value = true
    // Add event listener to handle click outside the div
    document.addEventListener('click', handleClickOutside)
  }

  const handleClickOutside = (event: MouseEvent) => {
    if (!document.getElementById('terminal')?.contains(event.target as Node)) {
      // Clicked outside the div, remove focus
      focused.value = false
      // Remove the event listener
      document.removeEventListener('click', handleClickOutside)
    }
  }
</script>
