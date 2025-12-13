<script lang="ts">
    import type { Snippet } from "svelte";

    interface Props {
        visible?: boolean;
        children?: Snippet;
    }

    let { children, visible = $bindable(false) }: Props = $props();
</script>

<div
    class="modal fixed inset-0 bg-black/70
            backdrop-blur-sm z-50 flex
            items-center justify-center"
    class:visible
>
    {@render children?.()}
</div>

<style>
    @reference "tailwindcss";

    .modal {
        opacity: 0;
        transition: opacity 0.5s;
    }

    .modal.visible {
        opacity: 1;
    }
</style>
