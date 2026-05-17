<script lang="ts">
	import { ALL_VOWELS } from '$lib/data/vowels';
	import type { VowelCode } from '$lib/data/vowels';
	import { language } from '$lib/services/language';

	interface Props {
		selectedCodes: VowelCode[];
		onChange: (next: VowelCode[]) => void;
	}
	let { selectedCodes, onChange }: Props = $props();

	/** שם תצוגה של ניקוד לפי קוד — מ-language.ts */
	function vowelDisplayName(code: VowelCode): string {
		switch (code) {
			case 'patah': return language.vowelNamePatah;
			case 'none':  return language.vowelNameNone;
		}
	}

	/** החלפת מצב בחירה — מינימום 1 ניקוד */
	function toggle(code: VowelCode) {
		const has = selectedCodes.includes(code);
		if (has) {
			if (selectedCodes.length <= 1) return; // מינימום 1
			onChange(selectedCodes.filter(c => c !== code));
		} else {
			onChange([...selectedCodes, code]);
		}
	}

	/** בחר הכל */
	function selectAll() {
		onChange(ALL_VOWELS.map(v => v.code));
	}

	/** נקה — שומר על הראשון בלבד (מינימום) */
	function clearAll() {
		onChange([ALL_VOWELS[0].code]);
	}

	/** איפוס לברירת מחדל (פתח בלבד) */
	function resetToDefault() {
		onChange(['patah']);
	}
</script>

<div class="letter-grid-wrap">
	<div class="grid-actions">
		<button class="action-btn" onclick={selectAll}>{language.selectAllLabel}</button>
		<button class="action-btn" onclick={clearAll}>{language.clearAllLabel}</button>
		<button class="action-btn secondary" onclick={resetToDefault}>{language.resetToDefaultLabel}</button>
	</div>

	<div class="vowel-grid">
		{#each ALL_VOWELS as vowel (vowel.code)}
			<button
				class="letter-btn"
				class:selected={selectedCodes.includes(vowel.code)}
				onclick={() => toggle(vowel.code)}
				aria-pressed={selectedCodes.includes(vowel.code)}
				title={vowel.code}
			>
				{vowelDisplayName(vowel.code)}
			</button>
		{/each}
	</div>

	{#if selectedCodes.length < 1}
		<p class="min-hint">{language.minimumVowelsHint}</p>
	{/if}
</div>

<style>
	.letter-grid-wrap {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.grid-actions {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.action-btn {
		background: #f97316;
		color: white;
		font-weight: 700;
		padding: 0.4rem 0.9rem;
		border-radius: 999px;
		font-size: 0.85rem;
		transition: filter 120ms ease;
	}

	.action-btn:hover {
		filter: brightness(1.08);
	}

	.action-btn.secondary {
		background: #64748b;
	}

	.vowel-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.letter-btn {
		padding: 0.5rem 1.25rem;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		background: #f1f5f9;
		border: 2px solid transparent;
		border-radius: 0.75rem;
		font-family: inherit;
		font-size: 1rem;
		font-weight: 700;
		color: #334155;
		cursor: pointer;
		transition:
			background 120ms ease,
			border-color 120ms ease,
			color 120ms ease;
	}

	.letter-btn:hover {
		background: #fef3c7;
		border-color: #fbbf24;
	}

	.letter-btn.selected {
		background: #fff7ed;
		border-color: #f97316;
		color: #c2410c;
	}

	.min-hint {
		color: #dc2626;
		font-size: 0.85rem;
		font-weight: 600;
		margin: 0;
	}
</style>
