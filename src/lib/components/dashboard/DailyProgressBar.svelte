<script lang="ts">
  let { total, completed }: { total: number; completed: number } = $props();

  let percentage = $derived(total > 0 ? Math.round((completed / total) * 100) : 0);
</script>

<div class="mb-10 w-full bg-base-100 p-6 rounded-box border border-base-200 shadow-sm">
  <div class="flex items-end justify-between mb-3">
    <div>
      <h2 class="text-sm font-semibold uppercase tracking-wider text-base-content/50">Daily Goal</h2>
      <div class="flex items-baseline gap-2 mt-1">
        <span class="text-3xl font-black text-primary">{percentage}%</span>
        <span class="text-sm font-medium text-base-content/60">completed</span>
      </div>
    </div>
    <div class="text-right">
      <span class="badge badge-lg badge-neutral font-bold">{completed} / {total}</span>
    </div>
  </div>
  
  <div class="w-full bg-base-200 rounded-full h-4 overflow-hidden">
    <div 
      class="bg-primary h-4 rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(var(--p),0.5)]"
      style="width: {percentage}%"
    ></div>
  </div>
</div>
