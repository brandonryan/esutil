import { AsyncSendable } from "./util.d.ts"

export type ChannelOpts = {
	/** 
	 * Number of items to buffer when sending.
	 * @default 0
	 */
	buffer?: number
}

const closeSym = Symbol("channel-closed")

/**
 * A Channel is like an async pipeline, allowing you to send values in one end, and receive values from the other.  
 * If there are multiple receivers, values are sent to the first avilable receiver. A single value will never be sent to multiple receivers.  
 * Every value sent will block, until there is a receiver available to process the request, unless you set buffer in the options.  
 * If buffer is set, values will be buffered while there is space, allowing send to return early.  
 * 
 * @example
 * ```ts
 * const chan = new Channel<number>()
 * async function sendNumbers(chan: Channel<number>, n: number) {
 * 	for(let i=0; i<n; i++) {
 * 		await chan.send(i)
 * 		console.log("sent " + i)
 * 	}
 * }
 * async function process(name: string, chan: Channel<number>) {
 * 	for await (const item of chan) {
 * 		//do some processing that might take some time
 * 		console.log(`${name} received ${item}`)
 * 	}
 * }
 * 
 * process("A", chan)
 * process("B", chan)
 * await sendNumbers(chan, 6)
 * chan.close()
 * ```
 *
 * Output:
 * ```text
 * sent 0
 * sent 1
 * A received 0
 * B received 1
 * sent 2
 * sent 3
 * A received 2
 * B received 3
 * sent 4
 * sent 5
 * A received 4
 * B received 5
 * ```
 */
export class Channel<T> implements AsyncSendable<T> {
	#buffer: T[] = []
	#blockedQueue: Array<() => void> = []
	#notifyQueue: Array<(val: T|typeof closeSym) => void> = []
	#closed = false
	#closedCb: undefined | (() => void) = undefined

	#maxBuff
	constructor(opts: ChannelOpts={}) {
		this.#maxBuff = opts.buffer ?? 0
	}

	/** number of buffered values */
	get length() {
		return this.#buffer.length
	}

	/**
	 * Send a value into the channel, following these rules:
	 * - if a receiver is avilable, sends then returns
	 * - if buffer is not full, buffers then returns
	 * - blocks until the buffer is no longer full, then buffers and returns
	 * 
	 * Send rejects if channel is already closed, or sig is aborted.
	 * @param value the value to send
	 * @param sig AbortSignal
	 */
	async send(value: T, sig?: AbortSignal) {
		if(this.#closed) throw new Error("Can't send on a closed channel.")

		if(this.#notifyQueue.length === 0 && this.length >= this.#maxBuff) {
			await this.#waitUnblocked(sig)
		}

		const notify = this.#notifyQueue.shift()
		if(notify) {
			notify(value)
		} else {
			this.#buffer.push(value)
		}

		if(this.length > this.#maxBuff) {
			throw new Error("Buffer exceeded. This indicates an issue with the library. Please file an issue.")
		}
	}

	/** forwards values emitted by iter to send() */
	async forward(iter: AsyncIterable<T>, sig?: AbortSignal) {
		for await (const val of iter) {
			await this.send(val, sig)
		}
	}

	/**
	 * Closes a channel, preventing any more values from being sent, and returning all async iterators once buffer is empty.
	 */
	async close() {
		if(this.#closed) throw new Error("Channel is already closed.")

		this.#closed = true
		for(const notify of this.#notifyQueue) {
			notify(closeSym)
		}
		await new Promise<void>(res => { this.#closedCb = res })
	}

	/** 
	 * Generates sent values from the channel.
	 * Values are distributed if there are multiple receivers.
	 */
	async *[Symbol.asyncIterator]() {
		try {
			while (true) {
				const next = await this.#waitNext()
				if(next === closeSym) break
				yield next
			}
		} finally {
			if (this.#closedCb && this.#blockedQueue.length === 0 && this.#notifyQueue.length === 0) {
				this.#closedCb()
			}
		}		
	}

	async #waitUnblocked(sig?: AbortSignal) {
		if(!sig) {
			return await new Promise<void>(res => this.#blockedQueue.push(res))
		}

		await new Promise<void>((res, rej) => {
			const abort = () => {
				//remove our blocked callback
				const i = this.#blockedQueue.findIndex(v => v === success)
				if(i !== -1) this.#blockedQueue.splice(i, 1)
				//reject send
				rej(new Error("Aborted"))
			}
			const success = () => {
				sig.removeEventListener("abort", abort)
				res()
			}

			this.#blockedQueue.push(success)
		})
	}

	async #waitNext() {
		const blocked = this.#blockedQueue.shift()
		if(blocked) blocked()

		//pull off the buffer if we can
		let value: typeof closeSym | T
		
		if(this.#buffer.length > 0) {
			value = this.#buffer.shift()!
		} else if (this.#closed) {
			return closeSym
		} else {
			value = await new Promise<T|typeof closeSym>(res => this.#notifyQueue.push(res))
		}

		return value
	}
}