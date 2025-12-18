<script lang="ts">
	let {
		value = 0,
		max = 1,
		orientation = 'vertical',
		label = ''
	} = $props<{
		value: number;
		max: number;
		orientation?: 'vertical' | 'horizontal';
		label?: string;
	}>();

	// Calculate percentage for the bar height/width
	let percentage = $derived(Math.min(100, Math.max(0, (value / max) * 100)));
</script>

<div
	class="flex items-center justify-center gap-2 p-2 bg-white/80 backdrop-blur-xs rounded-2xl shadow-lg border border-slate-200 transition-all duration-300
    {orientation === 'vertical'
		? 'flex-col min-w-[60px] h-[300px]'
		: 'flex-row min-h-[60px] w-[300px]'}"
>
	<!-- Progress Track -->
	<div
		class="relative bg-slate-200 rounded-full overflow-hidden shadow-inner
        {orientation === 'vertical'
			? 'w-4 h-full flex flex-col justify-end'
			: 'h-4 w-full flex flex-row'}"
	>
		<!-- Progress Fill -->
		<div
			class="bg-linear-to-t from-blue-500 to-cyan-400 shadow-[0_0_10px_rgba(59,130,246,0.5)] transition-all duration-500 ease-out"
			style:height={orientation === 'vertical' ? `${percentage}%` : '100%'}
			style:width={orientation === 'vertical' ? '100%' : `${percentage}%`}
		></div>
	</div>

	<!-- Text Info -->
	<div
		class="flex flex-col items-center justify-center text-slate-700 font-bold text-sm select-none"
	>
		<span>{value}/{max}</span>
		{#if label}
			<span
				class="text-[10px] text-slate-400 mt-1 max-w-[50px] text-center leading-tight hidden lg:block"
			>
				{label}
			</span>
		{/if}
	</div>
</div>
