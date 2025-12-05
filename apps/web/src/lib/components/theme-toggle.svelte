<script lang="ts">
  import { toggleMode } from 'mode-watcher';
  import { Sun, Moon } from 'lucide-svelte';
</script>

<button
  onclick={toggleMode}
  class="relative w-11 h-11 rounded-xl glass-card flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg hover:shadow-xl"
  aria-label="Toggle theme"
>
  <Sun
    class="h-5 w-5 text-amber-500 rotate-0 scale-100 transition-all duration-500 dark:-rotate-90 dark:scale-0 absolute"
  />
  <Moon
    class="h-5 w-5 text-indigo-400 rotate-90 scale-0 transition-all duration-500 dark:rotate-0 dark:scale-100 absolute"
  />
</button>
