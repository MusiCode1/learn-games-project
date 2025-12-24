<!--
	רכיב קרון רכבת
	משתמש בקבצי SVG חיצוניים עם אנימציות
-->
<script lang="ts">
  interface Props {
    /** האם זו קבוצה A או B */
    group: "a" | "b";
    /** האם הקרון חדש (לצורך אנימציה) */
    isNew?: boolean;
  }
  let { group, isNew = false }: Props = $props();

  // נתיב לתמונה לפי קבוצה
  const imageSrc = $derived(
    group === "a" ? "/images/car-green-v2.svg" : "/images/car-blue-v2.svg"
  );
</script>

<div
  class="train-car"
  class:animate-bounce-in={isNew}
  class:hover-wiggle={!isNew}
>
  <img
    src={imageSrc}
    alt="קרון {group === 'a' ? 'ירוק' : 'כחול'}"
    class="h-20 w-28 drop-shadow-md transition-transform hover:scale-105 md:h-32 md:w-40"
  />
</div>

<style>
  .train-car {
    display: inline-block;
    transform-origin: center bottom;
  }

  /* אנימציית כניסה של קרון חדש */
  @keyframes bounce-in {
    0% {
      transform: scale(0) translateY(-30px) rotate(-10deg);
      opacity: 0;
    }
    60% {
      transform: scale(1.15) translateY(5px) rotate(3deg);
    }
    80% {
      transform: scale(0.95) translateY(-3px) rotate(-2deg);
    }
    100% {
      transform: scale(1) translateY(0) rotate(0deg);
      opacity: 1;
    }
  }

  .animate-bounce-in {
    animation: bounce-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  /* אנימציית רחיפה */
  .hover-wiggle:hover {
    animation: wiggle 0.3s ease-in-out;
  }

  @keyframes wiggle {
    0%,
    100% {
      transform: rotate(0deg);
    }
    25% {
      transform: rotate(-3deg);
    }
    75% {
      transform: rotate(3deg);
    }
  }
</style>
