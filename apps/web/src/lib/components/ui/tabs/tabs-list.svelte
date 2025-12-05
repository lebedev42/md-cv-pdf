<script lang="ts">
  import { Tabs as TabsPrimitive } from 'bits-ui';
  import { cn } from '$lib/utils.js';

  let { ref = $bindable(null), class: className, ...restProps }: TabsPrimitive.ListProps = $props();
</script>

<TabsPrimitive.List
  bind:ref
  data-slot="tabs-list"
  class={cn(
    'inline-flex w-full items-center gap-1 p-1 rounded-2xl',
    'bg-background/60 backdrop-blur-sm border border-border/50',
    'shadow-sm',
    className,
  )}
  {...restProps}
/>
