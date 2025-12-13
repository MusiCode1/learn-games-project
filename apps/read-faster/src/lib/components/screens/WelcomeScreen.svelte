<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import { goto } from '$app/navigation';
	import type { WelcomeScreenProps } from '$lib/types';

	// למרות שהקומפוננטה לא משתמשת כרגע ב-state או handlers,
	// היא מוגדרת לקבל אותם לשמירה על עקביות עם שאר קומפוננטות המסך.
	let { state, handlers }: WelcomeScreenProps = $props();

	function handleStart() {
		// אם יש handler ספציפי להתחלה, אפשר לקרוא לו כאן.
		// לדוגמה: if (handlers.onStart) handlers.onStart();
		// כרגע, מנווטים ישירות.
		goto('/practice/settings');
	}
</script>

<div class="flex flex-col items-center justify-center space-y-8 px-4 py-12">
	<h1 class="text-4xl font-bold">ברוכים הבאים</h1>

	<div class="border-text-primary max-w-md space-y-4 rounded-lg border-2 p-8 text-center">
		<p class="text-xl">ברוכים הבאים לאפליקציית קריאה מהירה!</p>
		<p>
			האפליקציה תעזור לכם לשפר את מהירות הקריאה שלכם בעברית באמצעות תרגול קריאה מהירה של מילים
			בודדות.
		</p>
	</div>

	<div class="space-y-4 text-center">
		<h2 class="text-2xl font-bold">איך זה עובד?</h2>
		<ul class="list-inside list-decimal space-y-2 text-right">
			<li>בחרו כמה מילים תרצו לתרגל בכל סט</li>
			<li>המילים יוצגו אחת אחרי השנייה</li>
			<li>נסו לקרוא כל מילה במהירות האפשרית</li>
			<li>בסיום הסט תוכלו לעבור לסט הבא</li>
		</ul>
	</div>

	<Button onclick={handleStart}>בואו נתחיל!</Button>
</div>
