<script lang="ts">
	import Container from '$lib/components/layout/Container.svelte';
	import Button from '$lib/components/ui/Button.svelte';

	interface Props {
		totalWords: number;
		repetitions: number;
		currentSet: number;
		totalSets: number;
		onNextSet: () => void;
		onRepeatSet: () => void;
		onHome: () => void;
	}

	let { totalWords, repetitions, currentSet, totalSets, onNextSet, onRepeatSet, onHome }: Props =
		$props();

	const hasNextSet = $derived.by(() => currentSet < totalSets);
</script>

<div class="flex h-full items-center justify-center">
	<Container>
		<div class="flex flex-col items-center justify-center gap-8 py-8">
			<h1
				class="from-primary to-secondary animate-fade-in-up bg-gradient-to-r bg-clip-text text-4xl font-bold text-transparent"
			>
				כל הכבוד! סיימת את הסט
			</h1>

			<div class="rounded-2xl bg-white p-8 shadow-sm">
				<div class="flex flex-col gap-4 text-center">
					<div class="text-text-secondary">
						תרגלת
						<span class="text-primary font-bold">{totalWords}</span>
						מילים
					</div>
					<div class="text-text-secondary">
						ביצעת
						<span class="text-primary font-bold">{repetitions}</span>
						חזרות
					</div>
					<div class="text-text-secondary">
						השלמת סט
						<span class="text-primary font-bold">{currentSet}</span>
						מתוך
						<span class="text-primary font-bold">{totalSets}</span>
					</div>
				</div>
			</div>

			<div class="flex flex-col gap-4">
				{#if hasNextSet}
					<Button onclick={onNextSet} variant="primary">המשך לסט הבא</Button>
				{/if}
				<Button onclick={onRepeatSet} variant="secondary">חזור על הסט</Button>
				<Button onclick={onHome} variant="secondary">חזור לדף הבית</Button>
			</div>
		</div>
	</Container>
</div>
