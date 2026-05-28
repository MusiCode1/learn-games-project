<script lang="ts">
	import { ALL_LETTERS_ALPHABETICAL, DEFAULT_LETTER_IDS } from '$lib/utils/letters';
	import { language } from '$lib/services/language';

	interface Props {
		selectedIds: string[];
		onChange: (next: string[]) => void;
	}
	let { selectedIds, onChange }: Props = $props();

	/** החלפת מצב בחירה של אות — מינימום 2 אותיות נבחרות */
	function toggle(id: string) {
		const has = selectedIds.includes(id);
		if (has) {
			// מינימום 2 אותיות
			if (selectedIds.length <= 2) return;
			onChange(selectedIds.filter(i => i !== id));
		} else {
			onChange([...selectedIds, id]);
		}
	}

	/** סימון כל האותיות */
	function selectAll() {
		onChange([...DEFAULT_LETTER_IDS]);
	}

	/** ניקוי הבחירה — שומר על שתי הראשונות בלבד (מינימום) */
	function clearAll() {
		onChange(DEFAULT_LETTER_IDS.slice(0, 2));
	}

	/** איפוס לברירת מחדל (כל 26 האותיות) */
	function resetToDefault() {
		onChange([...DEFAULT_LETTER_IDS]);
	}
</script>

<div class="letter-grid-wrap">
	<div class="grid-actions">
		<button class="action-btn" onclick={selectAll}>{language.selectAllLabel}</button>
		<button class="action-btn" onclick={clearAll}>{language.clearAllLabel}</button>
		<button class="action-btn secondary" onclick={resetToDefault}>{language.resetToDefaultLabel}</button>
	</div>

	<div class="letter-grid">
		{#each ALL_LETTERS_ALPHABETICAL as card (card.id)}
			<button
				class="letter-btn"
				class:selected={selectedIds.includes(card.id)}
				onclick={() => toggle(card.id)}
				aria-pressed={selectedIds.includes(card.id)}
				title={card.id}
			>
				{card.letter.displayChar}
			</button>
		{/each}
	</div>

	{#if selectedIds.length < 2}
		<p class="min-hint">{language.minimumLettersHint}</p>
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

	.letter-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
		gap: 0.5rem;
	}

	.letter-btn {
		aspect-ratio: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #f1f5f9;
		border: 2px solid transparent;
		border-radius: 0.75rem;
		font-family: 'David', 'Frank Ruehl CLM', serif;
		font-size: 1.5rem;
		font-weight: 800;
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
