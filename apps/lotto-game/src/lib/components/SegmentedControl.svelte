<script lang="ts">
	/**
	 * קומפוננטה גנרית לבורר סגמנטי (Segmented Control)
	 */
	interface Option {
		id: string;
		label: string;
		icon?: string;
	}

	interface Props {
		options: Option[];
		value: string;
		onchange: (id: string) => void;
	}

	let { options, value, onchange }: Props = $props();
</script>

<div class="segmented-control">
	{#each options as option, i}
		<button
			class="segment"
			class:active={value === option.id}
			class:first={i === 0}
			class:last={i === options.length - 1}
			onclick={() => onchange(option.id)}
			type="button"
		>
			{#if option.icon}
				<span class="icon">{option.icon}</span>
			{/if}
			<span class="label">{option.label}</span>
		</button>
	{/each}
</div>

<style type="text/postcss">
	@reference "tailwindcss";

	.segmented-control {
		/* Layout */
		@apply flex items-stretch;
		@apply w-full;

		/* Visual */
		@apply bg-slate-100 rounded-lg;
		@apply p-1;
	}

	.segment {
		/* Layout */
		@apply flex items-center justify-center gap-2;
		@apply flex-1;

		/* Spacing */
		@apply py-2 px-3;

		/* Visual */
		@apply rounded-md;
		@apply font-medium text-sm;
		@apply text-slate-600 bg-transparent;
		@apply border-0;

		/* Interactive */
		@apply transition-all duration-200;
		@apply cursor-pointer;
	}

	.segment:hover:not(.active) {
		/* Visual */
		@apply bg-slate-50/50;
		@apply text-slate-700;
	}

	.segment.active {
		/* Visual */
		@apply bg-white text-indigo-600;
		@apply shadow-sm font-semibold;

		/* Interactive */
		@apply scale-[1.02];
	}

	.icon {
		/* Layout */
		@apply flex items-center justify-center;

		/* Visual */
		@apply text-base;
	}

	.label {
		/* Visual */
		@apply whitespace-nowrap;
	}
</style>
