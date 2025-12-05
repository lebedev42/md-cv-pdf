<script lang="ts">
  import { fade, fly } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import { Button } from '$lib/components/ui/button/index.js';
  import * as Tabs from '$lib/components/ui/tabs/index.js';
  import { Spinner } from '$lib/components/ui';
  import FileUpload from '$lib/components/file-upload.svelte';
  import ThemeToggle from '$lib/components/theme-toggle.svelte';
  import {
    generateResume,
    downloadBlob,
    getPreviewUrl,
    getHistory,
    getDownloadUrl,
    formatFileSize,
    formatDate,
    TEMPLATES,
    type Language,
    type Template,
    type HistoryFile,
  } from '$lib/api';
  import {
    FileDown,
    CheckCircle,
    XCircle,
    FileText,
    Globe,
    Sparkles,
    Layout,
    Eye,
    RotateCcw,
    Clock,
    FolderOpen,
  } from 'lucide-svelte';

  let selectedFile = $state<File | null>(null);
  let selectedLanguage = $state<Language>('en');
  let selectedTemplate = $state<Template>('v1');
  let isLoading = $state(false);
  let result = $state<{ success: boolean; message: string; filename?: string; blob?: Blob } | null>(
    null,
  );

  // Tab state
  let currentTab = $state<'convert' | 'history'>('convert');

  // History state
  let historyFiles = $state<HistoryFile[]>([]);
  let historyLoading = $state(false);
  let historyError = $state<string | null>(null);

  function handleFileSelect(file: File): void {
    selectedFile = file;
    result = null;
  }

  async function handleGenerate(): Promise<void> {
    if (!selectedFile) return;

    isLoading = true;
    result = null;

    try {
      const response = await generateResume(selectedFile, selectedLanguage, selectedTemplate);
      result = response;
    } catch (error) {
      result = {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    } finally {
      isLoading = false;
    }
  }

  function handleDownload(): void {
    if (result?.blob && result?.filename) {
      downloadBlob(result.blob, result.filename);
    }
  }

  function openPreview(template: Template): void {
    window.open(getPreviewUrl(template), '_blank');
  }

  function handleReset(): void {
    selectedFile = null;
    result = null;
  }

  async function loadHistory(): Promise<void> {
    historyLoading = true;
    historyError = null;

    try {
      historyFiles = await getHistory();
    } catch (error) {
      historyError = error instanceof Error ? error.message : 'Failed to load history';
    } finally {
      historyLoading = false;
    }
  }

  function handleTabChange(value: string | undefined): void {
    if (value === 'convert' || value === 'history') {
      currentTab = value;
      if (value === 'history') {
        loadHistory();
      }
    }
  }
</script>

<svelte:head>
  <title>Markdown CV to PDF Template Converter</title>
</svelte:head>

<main class="min-h-screen flex items-center justify-center p-6 relative">
  <!-- Theme Toggle -->
  <div class="absolute top-6 right-6 z-10">
    <ThemeToggle />
  </div>

  <div class="w-full max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
    <!-- Header -->
    <div class="text-center mb-8">
      <div
        class="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-primary/20 backdrop-blur-sm mb-5 shadow-lg shadow-primary/20"
      >
        <FileText class="w-10 h-10 text-primary" />
      </div>
      <h1
        class="text-4xl font-bold tracking-tight mb-3 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text"
      >
        Markdown CV to PDF
      </h1>
      <p class="text-muted-foreground text-lg">
        Convert your Markdown CV to a beautifully styled PDF
      </p>
    </div>

    <!-- Tabs -->
    <Tabs.Root value={currentTab} onValueChange={handleTabChange} class="w-full">
      <Tabs.List class="mb-6">
        <Tabs.Trigger value="convert">
          <Sparkles class="w-4 h-4" />
          <span>Convert</span>
        </Tabs.Trigger>
        <Tabs.Trigger value="history">
          <Clock class="w-4 h-4" />
          <span>History</span>
        </Tabs.Trigger>
      </Tabs.List>
    </Tabs.Root>

    <!-- Tab Content with transitions -->
    <div class="relative">
      {#if currentTab === 'convert'}
        <div in:fly={{ x: -20, duration: 300, easing: cubicOut }} out:fade={{ duration: 150 }}>
          <div class="glass-card rounded-2xl p-8 shadow-2xl shadow-black/5 dark:shadow-black/20">
            {#if result?.success}
              <!-- Success Result -->
              <div class="animate-in fade-in zoom-in-95 duration-500">
                <div
                  class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500/20 via-green-500/10 to-teal-500/20 p-8 border border-emerald-500/30"
                >
                  <!-- Decorative elements -->
                  <div
                    class="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl"
                  ></div>
                  <div
                    class="absolute -bottom-10 -left-10 w-24 h-24 bg-teal-500/20 rounded-full blur-2xl"
                  ></div>

                  <div class="relative flex flex-col items-center text-center">
                    <div
                      class="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mb-5 animate-in zoom-in duration-300"
                    >
                      <CheckCircle class="w-10 h-10 text-emerald-500" />
                    </div>

                    <h3 class="text-2xl font-bold text-foreground mb-2">PDF Ready!</h3>
                    <p class="text-sm text-muted-foreground mb-8 max-w-xs">{result.filename}</p>

                    <button
                      type="button"
                      onclick={handleDownload}
                      class="group flex items-center gap-3 px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 transition-all duration-300 hover:scale-105"
                    >
                      <FileDown class="w-5 h-5" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>

                <!-- Back Button -->
                <button
                  type="button"
                  onclick={handleReset}
                  class="w-full mt-6 py-4 px-6 rounded-xl border-2 border-dashed border-border hover:border-primary/50 bg-background/30 hover:bg-background/50 text-muted-foreground hover:text-foreground font-medium transition-all duration-300 flex items-center justify-center gap-3 group"
                >
                  <RotateCcw
                    class="w-5 h-5 group-hover:rotate-[-180deg] transition-transform duration-500"
                  />
                  <span>Convert Another</span>
                </button>
              </div>
            {:else}
              <!-- Form -->
              <FileUpload onfile={handleFileSelect} class="mb-6" />

              <!-- Template Selector -->
              <div class="mb-6">
                <label class="flex items-center gap-2 text-sm font-medium text-foreground mb-3">
                  <Layout class="h-4 w-4 text-primary" />
                  <span>Choose Template</span>
                </label>
                <div class="grid grid-cols-2 gap-3">
                  {#each TEMPLATES as template}
                    <div
                      role="button"
                      tabindex="0"
                      class="relative p-4 rounded-xl border-2 transition-all duration-300 text-left group cursor-pointer {selectedTemplate ===
                      template.id
                        ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20'
                        : 'border-border bg-background/50 hover:border-primary/50'}"
                      onclick={() => (selectedTemplate = template.id)}
                      onkeydown={(e) => e.key === 'Enter' && (selectedTemplate = template.id)}
                    >
                      <div class="flex items-start justify-between">
                        <div class="flex-1 pr-2">
                          <div
                            class="font-semibold mb-1 {selectedTemplate === template.id
                              ? 'text-primary'
                              : 'text-foreground'}"
                          >
                            {template.name}
                          </div>
                          <div class="text-xs text-muted-foreground line-clamp-2">
                            {template.description}
                          </div>
                        </div>
                        <button
                          type="button"
                          class="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-primary/20 transition-all flex-shrink-0"
                          onclick={(e) => {
                            e.stopPropagation();
                            openPreview(template.id);
                          }}
                          title="Preview template"
                        >
                          <Eye class="h-4 w-4 text-primary" />
                        </button>
                      </div>
                      {#if selectedTemplate === template.id}
                        <div
                          class="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary animate-pulse"
                        ></div>
                      {/if}
                    </div>
                  {/each}
                </div>
              </div>

              <!-- Language Selector -->
              <div class="mb-6">
                <label class="flex items-center gap-2 text-sm font-medium text-foreground mb-3">
                  <Globe class="h-4 w-4 text-primary" />
                  <span>Template Language</span>
                </label>
                <div class="flex gap-3">
                  <button
                    type="button"
                    class="flex-1 py-3 px-4 rounded-xl border-2 transition-all duration-300 font-medium {selectedLanguage ===
                    'en'
                      ? 'border-primary bg-primary/15 text-primary shadow-lg shadow-primary/20'
                      : 'border-border bg-background/50 hover:border-primary/50 text-muted-foreground hover:text-foreground'}"
                    onclick={() => (selectedLanguage = 'en')}
                  >
                    🇬🇧 English
                  </button>
                  <button
                    type="button"
                    class="flex-1 py-3 px-4 rounded-xl border-2 transition-all duration-300 font-medium {selectedLanguage ===
                    'ru'
                      ? 'border-primary bg-primary/15 text-primary shadow-lg shadow-primary/20'
                      : 'border-border bg-background/50 hover:border-primary/50 text-muted-foreground hover:text-foreground'}"
                    onclick={() => (selectedLanguage = 'ru')}
                  >
                    🇷🇺 Russian
                  </button>
                </div>
              </div>

              <!-- Generate Button -->
              <Button
                class="w-full h-14 text-base font-semibold rounded-xl shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300"
                size="lg"
                disabled={!selectedFile || isLoading}
                onclick={handleGenerate}
              >
                {#if isLoading}
                  <Spinner size="sm" />
                  <span>Generating PDF...</span>
                {:else}
                  <Sparkles class="w-5 h-5" />
                  <span>Generate PDF</span>
                {/if}
              </Button>

              <!-- Error Result -->
              {#if result && !result.success}
                <div class="mt-6 animate-in fade-in zoom-in-95 duration-500">
                  <div
                    class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-500/20 via-rose-500/10 to-pink-500/20 p-6 border border-red-500/30"
                  >
                    <div class="flex items-start gap-4">
                      <div
                        class="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0"
                      >
                        <XCircle class="w-6 h-6 text-red-500" />
                      </div>
                      <div>
                        <h3 class="text-lg font-semibold text-foreground mb-1">
                          Generation Failed
                        </h3>
                        <p class="text-sm text-muted-foreground">{result.message}</p>
                      </div>
                    </div>
                  </div>
                </div>
              {/if}
            {/if}
          </div>
        </div>
      {/if}

      {#if currentTab === 'history'}
        <div in:fly={{ x: 20, duration: 300, easing: cubicOut }} out:fade={{ duration: 150 }}>
          <div class="glass-card rounded-2xl p-8 shadow-2xl shadow-black/5 dark:shadow-black/20">
            {#if historyLoading}
              <div class="flex flex-col items-center justify-center py-12">
                <Spinner size="lg" />
                <p class="text-muted-foreground mt-4">Loading history...</p>
              </div>
            {:else if historyError}
              <div
                class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-500/20 via-rose-500/10 to-pink-500/20 p-6 border border-red-500/30"
              >
                <div class="flex items-start gap-4">
                  <div
                    class="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0"
                  >
                    <XCircle class="w-6 h-6 text-red-500" />
                  </div>
                  <div>
                    <h3 class="text-lg font-semibold text-foreground mb-1">Failed to Load</h3>
                    <p class="text-sm text-muted-foreground">{historyError}</p>
                  </div>
                </div>
              </div>
            {:else if historyFiles.length === 0}
              <!-- Empty State -->
              <div class="flex flex-col items-center justify-center py-12 text-center">
                <div
                  class="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-5"
                >
                  <FolderOpen class="w-10 h-10 text-muted-foreground/50" />
                </div>
                <h3 class="text-xl font-semibold text-foreground mb-2">No Files Yet</h3>
                <p class="text-muted-foreground max-w-xs">
                  Generated PDF files will appear here. Start by converting your first Markdown
                  resume!
                </p>
              </div>
            {:else}
              <!-- File List -->
              <div class="space-y-3">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-lg font-semibold text-foreground">
                    Generated Files ({historyFiles.length})
                  </h3>
                  <button
                    type="button"
                    onclick={loadHistory}
                    class="p-2 rounded-lg hover:bg-muted/50 transition-colors"
                    title="Refresh"
                  >
                    <RotateCcw class="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>

                {#each historyFiles as file}
                  <a
                    href={getDownloadUrl(file.filename)}
                    download={file.filename}
                    class="flex items-center gap-4 p-4 rounded-xl border border-border bg-background/50 hover:bg-primary/5 hover:border-primary/30 transition-all duration-300 group"
                  >
                    <div
                      class="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors"
                    >
                      <FileText class="w-6 h-6 text-primary" />
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="font-medium text-foreground truncate">{file.filename}</p>
                      <p class="text-sm text-muted-foreground">
                        {formatFileSize(file.size)} • {formatDate(file.createdAt)}
                      </p>
                    </div>
                    <div
                      class="p-2 rounded-lg bg-primary/10 text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <FileDown class="w-5 h-5" />
                    </div>
                  </a>
                {/each}
              </div>
            {/if}
          </div>
        </div>
      {/if}
    </div>

    <!-- Footer -->
    <p class="text-center text-sm text-muted-foreground mt-8 opacity-80">
      Upload a .md file with your CV to generate a PDF version
    </p>
  </div>
</main>
