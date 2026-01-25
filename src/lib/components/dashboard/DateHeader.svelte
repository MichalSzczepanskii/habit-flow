<script lang="ts">
  import { formatDateForDisplay, getDateLabel } from '$lib/utils/date';

  let { date }: { date: Date } = $props();
</script>

<div class="mb-8 mt-2">
  <h1 class="text-4xl font-extrabold text-base-content tracking-tight">{getDateLabel(date)}</h1>
  <p class="text-lg text-base-content/60 font-medium mt-1">{formatDateForDisplay(date)}</p>
</div>
