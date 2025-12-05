<script lang="ts">
  import { cn } from '$lib/utils';
  import { Upload, FileText, X, FileCheck } from 'lucide-svelte';

  interface Props {
    onfile: (file: File) => void;
    accept?: string;
    class?: string;
  }

  let { onfile, accept = '.md', class: className = '' }: Props = $props();

  let isDragging = $state(false);
  let selectedFile = $state<File | null>(null);
  let inputRef: HTMLInputElement;

  function handleDragOver(e: DragEvent): void {
    e.preventDefault();
    isDragging = true;
  }

  function handleDragLeave(): void {
    isDragging = false;
  }

  function handleDrop(e: DragEvent): void {
    e.preventDefault();
    isDragging = false;

    const file = e.dataTransfer?.files[0];
    if (file && file.name.endsWith('.md')) {
      selectedFile = file;
      onfile(file);
    }
  }

  function handleFileSelect(e: Event): void {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
      selectedFile = file;
      onfile(file);
    }
  }

  function clearFile(): void {
    selectedFile = null;
    if (inputRef) {
      inputRef.value = '';
    }
  }

  function openFilePicker(): void {
    inputRef?.click();
  }
</script>

<div
  role="button"
  tabindex="0"
  class={cn(
    'relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 transition-all duration-300 cursor-pointer group',
    isDragging
      ? 'border-primary bg-primary/10 scale-[1.02] shadow-lg shadow-primary/20'
      : selectedFile
        ? 'border-primary/50 bg-primary/5'
        : 'border-border bg-background/50 hover:border-primary/50 hover:bg-primary/5',
    className,
  )}
  ondragover={handleDragOver}
  ondragleave={handleDragLeave}
  ondrop={handleDrop}
  onclick={openFilePicker}
  onkeydown={(e) => e.key === 'Enter' && openFilePicker()}
>
  <input bind:this={inputRef} type="file" {accept} class="hidden" onchange={handleFileSelect} />

  {#if selectedFile}
    <div class="flex items-center gap-4 text-foreground animate-in fade-in zoom-in-95 duration-300">
      <div class="flex items-center justify-center w-14 h-14 rounded-xl bg-primary/20">
        <FileCheck class="h-7 w-7 text-primary" />
      </div>
      <div class="text-left">
        <p class="font-semibold text-lg">{selectedFile.name}</p>
        <p class="text-sm text-muted-foreground">
          {(selectedFile.size / 1024).toFixed(1)} KB • Ready to convert
        </p>
      </div>
      <button
        type="button"
        class="ml-2 rounded-full p-2 hover:bg-destructive/10 transition-all duration-200 group/btn"
        onclick={(e) => {
          e.stopPropagation();
          clearFile();
        }}
      >
        <X
          class="h-5 w-5 text-muted-foreground group-hover/btn:text-destructive transition-colors"
        />
      </button>
    </div>
  {:else}
    <div
      class="flex items-center justify-center w-16 h-16 rounded-2xl bg-muted/50 mb-5 group-hover:bg-primary/10 group-hover:scale-110 transition-all duration-300"
    >
      <Upload
        class="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors duration-300"
      />
    </div>
    <p class="text-lg font-semibold text-foreground mb-1">Drop your .md file here</p>
    <p class="text-sm text-muted-foreground">or click to browse</p>
  {/if}
</div>
