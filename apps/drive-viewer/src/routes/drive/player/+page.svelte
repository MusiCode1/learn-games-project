<script lang="ts">
	import { goto } from '$app/navigation';
	import BackButtonXL from '$lib/drive/BackButtonXL.svelte';
	import CenterPlayPause from '$lib/drive/CenterPlayPause.svelte';
	import ErrorState from '$lib/drive/ErrorState.svelte';
	import ProgressBarXL from '$lib/drive/ProgressBarXL.svelte';
	import TouchSeekZones from '$lib/drive/TouchSeekZones.svelte';

	let { data } = $props();

	let streamUrl = $derived(data.fileId ? `/api/drive/stream/${data.fileId}` : '');
	let paused = $state(true);
	let currentTime = $state(0);
	let duration = $state(0);
	let hasError = $state(false);
	let video: HTMLVideoElement | null = null;

	function goBack() {
		const params = new URLSearchParams();
		if (data.path) params.set('path', data.path);
		if (data.single) params.set('single', '1');
		goto(params.toString() ? `/drive?${params.toString()}` : '/drive');
	}

	function captureVideo(node: HTMLVideoElement) {
		video = node;
		return {
			destroy() {
				if (video === node) video = null;
			}
		};
	}

	function getDurationLimit() {
		if (duration > 0) return duration;
		const fallback = video?.duration;
		return Number.isFinite(fallback) && (fallback ?? 0) > 0 ? fallback : null;
	}

	function togglePlay() {
		if (!video) return;
		if (video.paused) {
			void video.play();
		} else {
			video.pause();
		}
	}

	function seekTo(target: number) {
		if (!video) return;
		const limit = getDurationLimit();
		const next = limit ? Math.min(Math.max(target, 0), limit) : Math.max(target, 0);
		video.currentTime = next;
	}

	function seekBy(delta: number) {
		if (!video) return;
		seekTo(video.currentTime + delta);
	}

	function retryPlayback() {
		hasError = false;
		if (!video) return;
		video.load();
		void video.play();
	}
</script>

<div class="player">
	<BackButtonXL label="חזרה" hint="לגריד" on:click={goBack} />
	<div class="title">{data.name}</div>

	{#if !data.fileId}
		<ErrorState title="אין מזהה סרטון" description="חזרו למסך הקודם ונסו לבחור סרטון אחר." on:retry={goBack} />
	{:else if hasError}
		<ErrorState
			title="לא הצלחנו לנגן"
			description="וודאו שהשיתוף פעיל או נסו שוב בעוד רגע."
			on:retry={retryPlayback}
		/>
	{:else}
		<div class="video-shell">
			<video
				{@attach captureVideo}
				class="video"
				bind:paused
				bind:currentTime
				bind:duration
				poster={data.thumb || undefined}
				src={streamUrl}
				playsinline
				autoplay
				onerror={() => (hasError = true)}
			>
				<track
					kind="captions"
					srclang="he"
					label="עברית"
					src="/captions/placeholder.vtt"
					default
				/>
			</video>
			<TouchSeekZones on:seek={(event) => seekBy(event.detail)} />
			<CenterPlayPause {paused} on:toggle={togglePlay} />
			<div class="controls">
				<ProgressBarXL {currentTime} {duration} on:seek={(event) => seekTo(event.detail)} />
			</div>
			<!-- Previous iframe embed kept for reference:
			<iframe
				class="embed"
				title={data.name}
				src={`https://drive.google.com/file/d/${data.fileId}/preview`}
				allow="autoplay; fullscreen"
				allowfullscreen
			></iframe>
			-->
		</div>
	{/if}
</div>

<style type="text/postcss">
	.player {
		min-height: 100vh;
		background: linear-gradient(180deg, #19110c 0%, #1e1611 60%, #241a15 100%);
		color: #fef4ea;
		display: grid;
		place-items: center;
		padding: 96px 16px 32px;
		position: relative;
	}

	.title {
		position: absolute;
		top: 24px;
		left: 50%;
		transform: translateX(-50%);
		padding: 10px 18px;
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.08);
		color: #fdf0e4;
		font-weight: 600;
		max-width: min(70vw, 540px);
		text-align: center;
		text-overflow: ellipsis;
		white-space: nowrap;
		overflow: hidden;
	}

	.video-shell {
		width: min(1100px, 95vw);
		aspect-ratio: 16 / 9;
		background: #0a0705;
		border-radius: 28px;
		position: relative;
		overflow: hidden;
		box-shadow: 0 22px 50px rgba(0, 0, 0, 0.45);
	}

	.video {
		width: 100%;
		height: 100%;
		display: block;
		background: #050403;
		object-fit: contain;
	}

	.controls {
		position: absolute;
		inset-inline: 0;
		bottom: 0;
		background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(7, 5, 4, 0.9) 100%);
	}

	@media (max-width: 700px) {
		.player {
			padding: 86px 12px 20px;
		}

		.video-shell {
			aspect-ratio: 9 / 16;
		}

		.title {
			max-width: 80vw;
			font-size: 0.95rem;
		}
	}
</style>
