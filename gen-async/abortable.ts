export async function * abortable<T>(sig: AbortSignal, it: AsyncIterable<T>): AsyncIterable<T> {
	const iterator = it[Symbol.asyncIterator]()
	const whenAborted = new Promise<void>(res => sig.addEventListener("abort", () => res()))

	while (!sig.aborted) {
		const result = await Promise.race([whenAborted, iterator.next()])
		if(!result) { //this can only happen if its aborted
			if(iterator.return) await iterator?.return()
			break
		} else if (!result.done) {
			yield result.value
		}
	}
}


const ctrl = new AbortController()
setTimeout(() => {
	console.log("aborting")
	ctrl.abort()
}, 5_000)

for await (const i of abortable(ctrl.signal, gen())) {
	console.log(i)
}

async function * gen() {
	let i = 0
	while (true) {
		yield i++
		await new Promise(res => setTimeout(res, 250))
	}
}