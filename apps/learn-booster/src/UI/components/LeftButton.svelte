<script lang="ts">
  interface Props {
    onclick: () => void;
  }
  
  let { onclick }: Props = $props();
</script>

<button 
  {onclick}
  class="fixed left-2 w-20
  top-1/2 transform -translate-y-1/2 bg-blue-500
  hover:bg-blue-700 text-white font-bold p-2 rounded-tr-lg rounded-br-lg"
>
  הגדרות 
  ג'ינג'ים 
  בוסטר
</button>
