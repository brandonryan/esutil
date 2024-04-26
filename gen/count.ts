export async function * count(limit=Infinity) {
	for(let i = 1; i < limit; i++) {
		yield i;
	}
}