<script lang="ts">
    interface Props {
        word: string;
    }

    let { word }: Props = $props();
</script>

<div class="flex justify-center p-6">
    <h1 class="text-6xl md:text-8xl font-black text-slate-800 tracking-wider drop-shadow-lg select-none">
        {word}
    </h1>
</div>
