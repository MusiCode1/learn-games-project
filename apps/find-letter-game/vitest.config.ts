import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
	plugins: [svelte({ hot: !process.env.VITEST })],
	test: {
		environment: 'jsdom',
		globals: true,
		include: ['src/**/*.test.ts'],
		setupFiles: ['./vitest-setup.ts']
	},
	resolve: {
		alias: {
			$lib: new URL('./src/lib', import.meta.url).pathname,
			'$app/navigation': new URL('./node_modules/@sveltejs/kit/src/runtime/app/navigation.js', import.meta.url).pathname,
			'$app/stores': new URL('./node_modules/@sveltejs/kit/src/runtime/app/stores.js', import.meta.url).pathname,
			'$app/environment': new URL('./node_modules/@sveltejs/kit/src/runtime/app/environment.js', import.meta.url).pathname,
		}
	}
});
