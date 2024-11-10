<script>
  import VideoModal from './lib/VideoModal.svelte';
  let showModal = false;
  
  function openModal() {
    showModal = true;
  }

  const videoUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
</script>

<main class="min-h-screen flex items-center justify-center">
  <button
    on:click={openModal}
    class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
  >
    פתח וידאו
  </button>

  {#if showModal}
    <VideoModal
      videoUrl={videoUrl}
      on:close={() => showModal = false}
    />
  {/if}
</main>