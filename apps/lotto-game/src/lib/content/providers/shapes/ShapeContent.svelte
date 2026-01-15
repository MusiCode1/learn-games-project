<script lang="ts">
	/**
	 * רכיב להצגת צורה גיאומטרית בכרטיס
	 */
	import type { CardContent } from '../../types';
	import ShapeSvg from './ShapeSvg.svelte';

	interface Props {
		content: CardContent;
	}

	let { content }: Props = $props();

	// הצורה והצבע נמצאים ב-data
	const shapeData = $derived(content.data as { shapeId: string; color: string });
</script>

<div class="shape-content">
	<ShapeSvg shapeId={shapeData.shapeId} color={shapeData.color} />
</div>

<style>
	.shape-content {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
	}
</style>
