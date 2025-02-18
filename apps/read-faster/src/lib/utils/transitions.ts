export function createTransition(duration: number) {
	return () => new Promise((resolve) => setTimeout(resolve, duration));
}
