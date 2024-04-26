export function distribute<T>(target: Iterable<T>, sections: number): T[][] {
	const distributed: T[][] = Array.from({length: sections}, () => [])
	let i = 0
	for(const item of target) {
		distributed[i % sections].push(item)
		i++
	}
	return distributed
}