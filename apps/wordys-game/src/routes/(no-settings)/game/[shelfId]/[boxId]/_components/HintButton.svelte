<script lang="ts">
	import { fade } from 'svelte/transition';

	interface Props {
		onClick: () => void;
		disabled?: boolean;
		cooldownRemaining?: number; // In seconds
		totalCooldown?: number; // In seconds, for progress calculation
	}

	let { onClick, disabled = false, cooldownRemaining = 0, totalCooldown = 0 }: Props = $props();

	// Calculate progress for the cooldown visual (0 to 1)
	let progress = $derived(
		totalCooldown > 0 ? (totalCooldown - cooldownRemaining) / totalCooldown : 1
	);
</script>

<div id="hintButton" class="relative inline-flex flex-col items-center justify-center">
	<button
		onclick={onClick}
		{disabled}
		class="
            relative
            flex items-center justify-center
            w-12 h-12 md:w-14 md:h-14
            group
            focus:outline-none
        "
		title="רמז"
		aria-label="קבל רמז"
	>
		<!-- Visual Container (Design) -->
		<div
			class="
                absolute inset-0
                rounded-full
                bg-white
                border-2 border-yellow-400
                border-b-[5px] border-b-yellow-400
                shadow-sm group-hover:shadow-md
                transition-all duration-150 group-active:duration-100
                flex items-center justify-center
                {disabled
				? 'opacity-50 border-slate-300 border-b-slate-300 transform-none grayscale'
				: 'group-hover:-translate-y-0.5 group-active:translate-y-1 group-active:border-b-2 group-active:shadow-none text-yellow-500'}
            "
		>
			<!-- Background Progress Ring (SVG) -->
			{#if disabled && cooldownRemaining > 0}
				<svg
					class="absolute inset-0 w-full h-full -rotate-90 pointer-events-none p-px"
					viewBox="0 0 100 100"
				>
					<circle
						cx="50"
						cy="50"
						r="46"
						fill="none"
						stroke="#e2e8f0"
						stroke-width="8"
						class="opacity-50"
					/>
					<circle
						cx="50"
						cy="50"
						r="46"
						fill="none"
						stroke="#fbbf24"
						stroke-width="8"
						stroke-dasharray="290"
						stroke-dashoffset={290 * (1 - progress)}
						stroke-linecap="round"
						class="transition-all duration-100 ease-linear"
					/>
				</svg>
				<!-- Countdown Text -->
				<span
					class="absolute inset-0 flex items-center justify-center font-bold text-lg text-slate-500"
					in:fade
				>
					{Math.ceil(cooldownRemaining)}
				</span>
			{:else}
				<span class="text-2xl filter drop-shadow-sm select-none">💡</span>
			{/if}
		</div>
	</button>
</div>
