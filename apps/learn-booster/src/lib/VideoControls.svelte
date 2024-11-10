<script>
  export let videoElement;
  export let progress;
  export let volume;
  export let duration;
  export let currentTime;
  
  function togglePlay() {
    if (videoElement.paused) {
      videoElement.play();
    } else {
      videoElement.pause();
    }
  }
  
  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      videoElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }
  
  function handleVolumeChange(e) {
    volume = e.target.value;
    videoElement.volume = volume;
  }
</script>

<div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 p-4">
  <div class="flex flex-col gap-2">
    <div class="h-1 bg-gray-600 rounded-full">
      <div
        class="h-full bg-blue-600 rounded-full transition-all"
        style="width: {progress}%"
      ></div>
    </div>
    
    <div class="flex items-center justify-between text-white">
      <div class="flex items-center gap-4">
        <button on:click={togglePlay}>
          {#if videoElement?.paused}
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            </svg>
          {:else}
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          {/if}
        </button>
        
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={volume}
          on:input={handleVolumeChange}
          class="w-24"
        />
        
        <button on:click={toggleFullscreen}>
          <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        </button>
      </div>
      
      <span>{Math.floor(duration - currentTime)} שניות נותרו</span>
    </div>
  </div>
</div>