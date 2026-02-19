<script lang="ts">
	/**
	 * רכיב להצגת כרטיס "ציור של קריאה"
	 * מציג אות עם ניקוד למעלה ותמונת תומך זיכרון למטה
	 */
	import type { CardContent } from '$lib/content/types';

	interface Props {
		content: CardContent;
	}

	let { content }: Props = $props();

	interface ReadingData {
		letter: string;
		imagePath: string;
		helper: string;
	}

	const data = $derived(content.data as ReadingData);
</script>

<div class="reading-content">
	<div class="letter">{data.letter}</div>
	<div class="image-container">
		<img src={data.imagePath} alt={data.helper} class="helper-image" />
	</div>
</div>

<style>
	@reference "tailwindcss";

	.reading-content {
		/* Layout */
		@apply w-full h-full flex flex-col items-center justify-center;

		/* Spacing */
		@apply gap-1 p-2;
	}

	.letter {
		/* Layout */
		@apply flex items-center justify-center;
		@apply flex-shrink-0;

		/* Visual */
		@apply font-bold;
		@apply text-slate-800;

		/* Size - responsive */
		font-size: clamp(1.5rem, 8cqw, 3rem);
		line-height: 1.2;
	}

	.image-container {
		/* Layout */
		@apply flex-1 flex items-center justify-center;
		@apply w-full min-h-0;

		/* Spacing */
		@apply p-1;
	}

	.helper-image {
		/* Layout */
		@apply max-w-full max-h-full;
		@apply object-contain;

		/* Visual */
		@apply rounded;
	}
</style>
