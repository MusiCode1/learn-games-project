<script lang="ts">
	interface Props {
		image: string;
		alt: string;
		direction: 'next' | 'prev' | null;
		lastDirection: 'next' | 'prev';
		isImageVisible: boolean;
		onClick: () => void;
	}

	let {
		image,
		alt,
		direction,
		lastDirection,
		isImageVisible = $bindable(false),
		onClick
	}: Props = $props();

	// טעינה מוקדמת של התמונה בכל פעם שהיא משתנה
	$effect(() => {
		if (image) {
			const preloader = new Image();
			preloader.src = image;
		}
	});
</script>

<button
	type="button"
	onclick={onClick}
	class="relative h-[200px] w-[300px] overflow-hidden rounded-2xl
    border-2 shadow-lg transition-all duration-300
    hover:-translate-y-1 hover:shadow-xl"
>
	{#if isImageVisible}
		<div class="image-container relative h-full w-full" style="--image-url: url({image});">
			<img
				src={image}
				{alt}
				class="relative h-full w-full rounded-[20px] object-contain p-2
				transition-[opacity,visibility] delay-100 duration-300"
				style="visibility: {isImageVisible ? 'visible' : 'hidden'}; 
				opacity: {isImageVisible ? '1' : '0'};"
			/>
		</div>
	{:else}
		<div
			class="from-secondary to-accent h-full w-full bg-linear-to-r/oklch transition-all duration-300"
		>
			<div class="flex h-full flex-col items-center justify-center gap-2 text-white">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-8 w-8"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
				>
					<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
					<circle cx="12" cy="12" r="3" />
				</svg>
				<span class="text-sm">לחץ או הקש רווח לגילוי התמונה</span>
			</div>
		</div>
	{/if}
</button>

<style>
	.image-container::before {
		content: '';
		position: absolute;
		inset: 0;
		background-size: cover;
		background-position: center;
		filter: blur(8px) brightness(0.7);
		transition: all 0.3s;
		background-image: var(--image-url);
	}
</style>
