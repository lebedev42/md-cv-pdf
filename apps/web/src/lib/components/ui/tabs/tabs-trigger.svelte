<script lang="ts">
  import { Tabs as TabsPrimitive } from 'bits-ui';
  import { cn } from '$lib/utils.js';

  let {
    ref = $bindable(null),
    class: className,
    ...restProps
  }: TabsPrimitive.TriggerProps = $props();
</script>

<TabsPrimitive.Trigger
  bind:ref
  data-slot="tabs-trigger"
  class={cn(
    'flex-1 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl px-6 py-3',
    'text-sm font-semibold transition-all duration-300',
    'text-muted-foreground/70 hover:text-foreground',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    'data-[state=active]:bg-primary data-[state=active]:text-primary-foreground',
    'data-[state=active]:shadow-lg data-[state=active]:shadow-primary/25',
    '[&_svg]:size-4 [&_svg]:shrink-0',
    className,
  )}
  {...restProps}
/>
