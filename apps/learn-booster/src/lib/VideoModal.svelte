<script >
  import { onMount, createEventDispatcher } from 'svelte';
  import { fade, scale } from 'svelte/transition';
  import VideoControls from './VideoControls.svelte';
  import LoadingSpinner from './LoadingSpinner.svelte';
  
  export let videoUrl;
  
  const dispatch = createEventDispatcher();
  let videoElement;
  let loading = true;
  let progress = 0;
  let volume = 1;
  let duration = 0;
  let currentTime = 0;
  
  onMount(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') closeModal();
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  });
  
  function closeModal() {
    dispatch('close');
  }
  
  function handleVideoLoaded() {
    loading = false;
    videoElement.play();
  }
  
  function handleVideoError() {
    // טיפול בשגיאות
  }
  
  function updateProgress() {
    progress = (videoElement.currentTime / videoElement.duration) * 100;
    currentTime = videoElement.currentTime;
    duration = videoElement.duration;
  }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
  class="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center"
  on:click|self={closeModal}
  transition:fade
>
  <div
    class="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4"
    transition:scale
  >
    <!-- כותרת -->
    <div class="p-4 border-b flex items-center justify-between">
      <div class="flex items-center gap-2">
        <svg class="w-6 h-6 text-blue-600 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h2 class="text-xl font-bold">וידאו</h2>
      </div>
      
      <button
        class="text-gray-500 hover:text-gray-700 transition-colors"
        on:click={closeModal}
      >
        <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
    
    <!-- תוכן -->
    <div class="relative aspect-video bg-black">
      {#if loading}
        <LoadingSpinner message="טוען את הסרטון..." />
      {/if}
      
      <!-- svelte-ignore a11y-media-has-caption -->
      <video
        bind:this={videoElement}
        class="w-full h-full"
        on:loadeddata={handleVideoLoaded}
        on:error={handleVideoError}
        on:timeupdate={updateProgress}
      >
        <source src={videoUrl} type="video/mp4" />
        הדפדפן שלך לא תומך בתגית וידאו.
      </video>
      
<!--       <VideoControls
        {videoElement}
        {progress}
        {volume}
        {duration}
        {currentTime}
      /> -->
    </div>
    
    <!-- פוטר -->
    <div class="p-4 border-t flex justify-end">
      <button
        class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        on:click={closeModal}
      >
        המשך למשחק
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  </div>
</div>