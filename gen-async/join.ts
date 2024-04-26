import { Yield } from "./util.d.ts"

type Joined<T extends AsyncIterable<unknown>[]> = {
	[I in keyof T]: Yield<T[I]>
}

export async function * join<T extends AsyncIterable<unknown>[]>(...iterables: [...T]): AsyncGenerator<Joined<T>> {
	const generators = iterables.map(it => it[Symbol.asyncIterator]())
	const values: unknown[] = Array.from({length: generators.length})
	const waiting = generators.map(async (gen, i) => {
		const res = await gen.next()
		return {i, res}
	})

	let ready: true | boolean[] = Array.from({length: generators.length}, () => false)
	for(let done = 0; done < generators.length; ) {
		const {i, res} = await Promise.race(waiting)
		
		if(res.done) {
			done++
			waiting[i] = new Promise((_res, _rej) => {})
			continue
		}

		values[i] = res.value
		waiting[i] = generators[i].next().then(res => ({i, res}))

		if(ready === true) {
			yield values as Joined<T>
			continue
		}

		ready[i] = true
		if(ready.every((v) => v)) {
			ready = true
			yield values as Joined<T>
		}
	}
}


for await(const x of join(gen("a", 500), gen("b", 400))) {
	console.log(x)
}

async function * gen(name: string, t: number) {
	for(let i=0; i < 20; i++) {
		await new Promise(res => setTimeout(res, t))
		yield name + i
	}
}