export function average(values: number[]): number {
	let total = 0
	for(const val of values) total += val
	return total / values.length
}