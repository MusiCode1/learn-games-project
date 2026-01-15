<script lang="ts">
	/**
	 * רכיב גנרי להצגת תוכן דינמי
	 * טוען את הרכיב המתאים לפי ה-provider
	 */
	import type { CardContent } from '$lib/content/types';
	import { contentRegistry } from '$lib/content/registry';

	interface Props {
		content: CardContent;
	}

	let { content }: Props = $props();

	// שליפת ה-provider המתאים
	const provider = $derived(contentRegistry.get(content.providerId));

	// הרכיב לתצוגה
	const component = $derived(provider.renderComponent);
</script>

<svelte:component this={component} {content} />
