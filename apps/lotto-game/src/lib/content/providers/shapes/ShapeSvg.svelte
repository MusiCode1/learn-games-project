<script lang="ts">
	/**
	 * רכיב להצגת צורות גיאומטריות כ-SVG
	 * מקבל מזהה צורה וצבע ומציג את הצורה המתאימה
	 */

	interface Props {
		shapeId: string;
		color: string;
		size?: string; // גודל ב-CSS (ברירת מחדל: 100%)
	}

	let { shapeId, color, size = '70%' }: Props = $props();
</script>

<svg
	viewBox="-5 -5 110 110"
	style="width: {size}; height: {size};"
	fill={color}
	stroke={color}
	stroke-width="3"
	stroke-linejoin="round"
	xmlns="http://www.w3.org/2000/svg"
>
	{#if shapeId === 'circle'}
		<!-- עיגול -->
		<circle cx="50" cy="50" r="45" />
	{:else if shapeId === 'square'}
		<!-- ריבוע -->
		<rect x="10" y="10" width="80" height="80" rx="5" />
	{:else if shapeId === 'triangle'}
		<!-- משולש -->
		<polygon points="50,5 95,90 5,90" />
	{:else if shapeId === 'star'}
		<!-- כוכב חמש קודקודים -->
		<polygon points="50,5 61,40 98,40 68,62 79,97 50,75 21,97 32,62 2,40 39,40" />
	{:else if shapeId === 'heart'}
		<!-- לב -->
		<path d="M50,88 C20,60 5,40 15,25 C30,5 50,20 50,35 C50,20 70,5 85,25 C95,40 80,60 50,88 Z" />
	{:else if shapeId === 'diamond'}
		<!-- מעוין -->
		<polygon points="50,5 90,50 50,95 10,50" />
	{:else if shapeId === 'hexagon'}
		<!-- משושה -->
		<polygon points="50,5 90,27 90,73 50,95 10,73 10,27" />
	{:else if shapeId === 'semicircle'}
		<!-- חצי עיגול -->
		<path d="M5,60 A45,45 0 0,1 95,60 L5,60 Z" />
	{:else if shapeId === 'pentagon'}
		<!-- מחומש -->
		<polygon points="50,5 95,38 77,90 23,90 5,38" />
	{:else if shapeId === 'cross'}
		<!-- פלוס -->
		<path d="M35,10 H65 V35 H90 V65 H65 V90 H35 V65 H10 V35 H35 Z" />
	{:else}
		<!-- ברירת מחדל: עיגול -->
		<circle cx="50" cy="50" r="45" />
	{/if}
</svg>
