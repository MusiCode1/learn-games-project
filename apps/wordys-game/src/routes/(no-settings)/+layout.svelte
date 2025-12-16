<script lang="ts">
	import AdminGate from '$lib/components/AdminGate.svelte';
	import { goto } from '$app/navigation';

	let { children } = $props();

	const goToSettings = () => {
		goto('/admin/settings');
	};
</script>

<div id="no-settings-layout">
	<div class="absolute top-4 left-4 z-50">
		<AdminGate onUnlock={() => goToSettings()}>
			<button
				class="p-3 bg-white/80 backdrop-blur-sm
					rounded-full shadow-lg hover:bg-white transition-all
					 text-slate-600 hover:text-slate-900"
				aria-label="הגדרות"
			>
				⚙️
			</button>
		</AdminGate>
	</div>

	{@render children()}
</div>
