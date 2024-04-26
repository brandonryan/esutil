import {index} from '../iterable/index.ts'

export function partition<T>(target: Iterable<T>, count: number): T[][] {
	const partitioned: T[][] = []
	for(const [i, item] of index(target)) {
		const part = Math.floor(i/count)
		if(part === partitioned.length) partitioned[part] = []
		partitioned[part].push(item)
	}
	return partitioned
}

console.log(partition([0, 1, 2, 3, 4, 5], 4))