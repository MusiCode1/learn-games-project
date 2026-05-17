<script lang="ts" generics="T extends string">
	interface Option {
		value: T;
		label: string;
	}

	interface Props {
		options: readonly Option[];
		value: T;
		disabled?: boolean;
		'aria-label'?: string;
		onchange?: (newValue: T) => void;
		class?: string;
	}

	let {
		options,
		value = $bindable(),
		disabled = false,
		'aria-label': ariaLabel,
		onchange,
		class: className = ''
	}: Props = $props();

	function select(newValue: T) {
		if (disabled) return;
		value = newValue;
		onchange?.(newValue);
	}

	function handleKeydown(e: KeyboardEvent, idx: number) {
		let next = idx;
		if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
			next = (idx + 1) % options.length;
		} else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
			next = (idx - 1 + options.length) % options.length;
		} else if (e.key === 'Home') {
			next = 0;
		} else if (e.key === 'End') {
			next = options.length - 1;
		} else {
			return;
		}
		e.preventDefault();
		select(options[next].value);
	}
</script>

<div
	role="radiogroup"
	aria-label={ariaLabel}
	class="inline-flex items-stretch bg-surface-sunken rounded-md p-1 {className}"
>
	{#each options as option, idx}
		<button
			role="radio"
			type="button"
			aria-checked={value === option.value}
			tabindex={value === option.value ? 0 : -1}
			{disabled}
			onclick={() => select(option.value)}
			onkeydown={(e) => handleKeydown(e, idx)}
			class="flex-1 px-3 py-1.5 rounded-sm text-sm font-medium transition-all duration-200
				cursor-pointer border-0 outline-none
				{value === option.value
				? 'bg-surface-elevated text-brand-primary shadow-card font-bold'
				: 'bg-transparent text-text-secondary hover:text-text-primary'}"
		>
			{option.label}
		</button>
	{/each}
</div>
