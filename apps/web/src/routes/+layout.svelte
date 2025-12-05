<script lang="ts">
  import '../app.css';
  import { ModeWatcher } from 'mode-watcher';

  let { children } = $props();
</script>

<ModeWatcher />

<!-- Animated Gradient Background -->
<div class="animated-gradient-bg">
  <div class="gradient-blob gradient-blob-1"></div>
  <div class="gradient-blob gradient-blob-2"></div>
  <div class="gradient-blob gradient-blob-3"></div>
  <div class="gradient-blob gradient-blob-4"></div>
  <div class="noise-overlay"></div>
</div>

{@render children()}
