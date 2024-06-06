<template>
  <div class="mx-auto mt-8 max-w-7xl px-4 sm:px-6 lg:px-8">
    <label for="search" class="sr-only">Search</label>
    <div class="relative">
      <!-- List box -->
      <div class="absolute inset-y-0 left-0 flex items-center pl-[1px]">
        <div class="relative w-40">
          <Listbox v-model="selectedPlatform">
            <ListboxButton
              class="relative w-full cursor-default rounded-md bg-background-light py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm"
            >
              <span class="block truncate">{{ selectedPlatform.name }}</span>
              <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronUpDownIcon class="h-5 w-5 text-light" aria-hidden="true" />
              </span>
            </ListboxButton>

            <transition
              leave-active-class="transition duration-100 ease-in"
              leave-from-class="opacity-100"
              leave-to-class="opacity-0"
            >
              <ListboxOptions
                class="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-background-light py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm"
              >
                <ListboxOption
                  v-slot="{ active, selected }"
                  v-for="platform in platforms"
                  :key="platform.name"
                  :value="platform"
                  as="template"
                >
                  <li
                    :class="[
                      active ? 'bg-background-bright text-primary' : 'text-white',
                      'relative cursor-default select-none py-2 pl-10 pr-4'
                    ]"
                  >
                    <span :class="[selected ? 'font-medium' : 'font-normal', 'block truncate']">{{
                      platform.name
                    }}</span>
                    <span
                      v-if="selected"
                      class="absolute inset-y-0 left-0 flex items-center pl-3 text-primary"
                    >
                      <CheckIcon class="h-5 w-5" aria-hidden="true" />
                    </span>
                  </li>
                </ListboxOption>
              </ListboxOptions>
            </transition>
          </Listbox>
        </div>
      </div>
      <!-- Icon -->
      <div class="pointer-events-none absolute inset-y-0 left-40 flex items-center pl-3">
        <MagnifyingGlassIcon class="h-5 w-5 text-light" aria-hidden="true" />
      </div>
      <!-- Input -->
      <input
        v-model="searchText"
        @keyup.enter="search"
        class="ark:focus:ring-slate-300 block w-full rounded-md border border-white/40 bg-background-light/5 py-2 pl-52 pr-3 leading-5 text-white placeholder-light focus:border-light focus:bg-background-light focus:text-white focus:placeholder-gray-500 focus:outline-none focus:ring-light sm:text-sm"
        placeholder="Search username"
        type="search"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { MagnifyingGlassIcon } from '@heroicons/vue/24/outline'
  import {
    Listbox,
    ListboxLabel,
    ListboxButton,
    ListboxOptions,
    ListboxOption
  } from '@headlessui/vue'
  import { CheckIcon, ChevronUpDownIcon } from '@heroicons/vue/20/solid'

  const emit = defineEmits<{
    (e: 'search', text: string, platforms: string[]): void
  }>()

  const platforms = [
    { name: 'All platforms', id: 'all' },
    { name: 'GitHub', id: 'github' },
    { name: 'GitLab', id: 'gitlab' }
  ]

  const router = useRouter()
  const selectedPlatform = ref(platforms[0])

  const searchText = ref('')
  const search = () => {
    if (!searchText || !searchText.value) return

    const searchPlatforms =
      selectedPlatform.value.id == 'all'
        ? platforms.slice(1).map(p => p.id)
        : [selectedPlatform.value.id]

    try {
      const normalizedText = searchText.value.trim()
      emit('search', normalizedText, searchPlatforms)
    } finally {
      searchText.value = ''
    }
  }
</script>
