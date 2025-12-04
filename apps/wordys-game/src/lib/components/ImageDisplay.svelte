<script lang="ts">
    interface Props {
        src: string;
        alt: string;
    }

    let { src, alt }: Props = $props();
</script>

<div class="flex justify-center p-4">
    <div class="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white/50 w-full max-w-md aspect-square bg-white">
        <img 
            {src} 
            {alt} 
            class="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
        />
        <!-- Shine effect -->
        <div class="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent pointer-events-none"></div>
    </div>
</div>
