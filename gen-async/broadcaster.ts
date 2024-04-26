import { Channel } from "./channel.ts"

type BroadcasterOpts = {
	replay?: number
}

export class Broadcaster<T> {
	#chans: Set<Channel<T>> = new Set()
	#closed = false
	#rBuffer: T[] = []

	#replay: number

	constructor(opts: BroadcasterOpts = {}) {
		this.#replay = opts.replay ?? 0
	}

	send(...values: T[]) {
		if(this.#closed) throw new Error("Broadcaster is closed.")
		if(this.#replay > 0) {
			this.#rBuffer.push(...values)
			this.#rBuffer.splice(0, this.#rBuffer.length - this.#replay)
		}
		for(const chan of this.#chans) {
			chan.send(...values)
		}
	}

	close() {
		this.#closed = true
		for(const chan of this.#chans) chan.close()
	}

	async *[Symbol.asyncIterator]() {
		const chan = new Channel<T>()
		this.#chans.add(chan)
		for(const v of this.#rBuffer) chan.send(v)
		try {
			yield * chan
		} finally {
			this.#chans.delete(chan)
		}
	}
}


const broad = new Broadcaster<string>()

let i = 0;
setInterval(() => {
	broad.send("item" + i)
	i++
}, 500)

;(async () => {
	for await (const item of broad) {
		console.log("a got " + item)
	}
})()

;(async () => {
	for await (const item of broad) {
		console.log("b got " + item)
	}
})()