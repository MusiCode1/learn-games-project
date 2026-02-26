<!--
  ארגז מיון — יעד גרירה
-->
<script lang="ts">
  import type { Category } from "$lib/types";
  import { gameState } from "$lib/stores/game-state.svelte";

  interface Props {
    category: Category;
    isHighlighted?: boolean;
  }

  let { category, isHighlighted = false }: Props = $props();

  const sortedCount = $derived(gameState.getSortedCount(category.id));
</script>

<div
  data-category-id={category.id}
  class="sort-box relative flex flex-col items-center justify-center rounded-2xl border-4 border-dashed p-3 md:p-5 transition-all duration-200 min-h-[100px] md:min-h-[140px] min-w-[120px] md:min-w-[160px]"
  class:highlighted={isHighlighted}
  style="
    background-color: {category.color}20;
    border-color: {category.color};
    {isHighlighted ? `box-shadow: 0 0 20px ${category.color}80, 0 0 40px ${category.color}40;` : ''}
  "
>
  <!-- אייקון -->
  {#if category.icon}
    <span class="text-3xl md:text-4xl mb-1" data-category-id={category.id}>
      {category.icon}
    </span>
  {/if}

  <!-- שם הקטגוריה -->
  <span
    class="text-lg md:text-xl font-bold text-slate-800"
    data-category-id={category.id}
  >
    {category.name}
  </span>

  <!-- מונה כרטיסים שמוינו -->
  {#if sortedCount > 0}
    <div
      class="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold text-white shadow-md"
      style="background-color: {category.color};"
      data-category-id={category.id}
    >
      {sortedCount}
    </div>
  {/if}
</div>

<style>
  .sort-box {
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .sort-box.highlighted {
    transform: scale(1.05);
    border-style: solid;
  }
</style>
