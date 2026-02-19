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

<style type="text/postcss">
	@reference "tailwindcss";

	.reading-content {
		/* Layout */
		@apply w-full h-full flex flex-col items-center justify-center overflow-hidden;

		/* Spacing */
		@apply gap-1 p-1;
	}

	.letter {
		/* Layout */
		@apply flex items-center justify-center;
		@apply flex-1 min-h-0;

		/* Visual */
		@apply font-bold;
		@apply text-slate-800;

		/* Size - responsive to card size via container-type: size on .card */
		font-size: clamp(2rem, 35cqmin, 5rem);
		line-height: 1;
	}

	.image-container {
		/* Layout - small helper image at the bottom */
		@apply flex-none flex items-center justify-center;
		@apply w-full;
		height: 35%;

		/* Spacing */
		@apply p-0.5;
	}

	.helper-image {
		/* Layout */
		@apply max-w-full max-h-full;
		@apply object-contain;

		/* Visual */
		@apply rounded;
	}
</style>
