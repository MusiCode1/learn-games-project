<script lang="ts">
	/**
	 * רכיב להצגת אות בכרטיס
	 */
	import type { CardContent } from '$lib/content/types';

	interface Props {
		content: CardContent;
	}

	let { content }: Props = $props();

	// האות נמצאת ב-data
	const letter = $derived(content.data as string);
</script>

<div class="letter-content">
	{letter}
</div>

<style>
	.letter-content {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
	}
</style>
