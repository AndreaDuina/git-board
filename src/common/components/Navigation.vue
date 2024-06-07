<template>
  <nav class="flex justify-between p-2">
    <RouterLink class="flex items-center" to="/">
      <img src="/logo.svg" class="mr-4 h-10 w-10" />
      <h1 class="text-4xl font-semibold tracking-wider">Git Dashboard</h1>
    </RouterLink>

    <div class="flex items-center">
      <button
        class="rounded-md border border-light px-3 py-2 hover:border-white hover:bg-background-light active:bg-background-dark"
      >
        Log in
      </button>
    </div>
  </nav>
  <div class="border-gradient h-[2px] w-full" />
</template>

<style scoped>
  .border-gradient {
    background: linear-gradient(to right, rgb(var(--color-background-light)), rgba(0, 0, 0, 0) 70%);
  }
</style>
