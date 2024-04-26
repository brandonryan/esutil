export function* index<T>(target: Iterable<T>) {
	let i = 0;
	for(const v of target) {
		yield [i, v] as const
		i++
	}
}