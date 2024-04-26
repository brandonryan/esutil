export class Mutex {
	#locked = false
	#queue: Array<() => void> = []

	get locked() {
		return this.#locked
	}
	
	/** Waits until the lock is available, then aquires it. */
	async lock() {
		if(this.#locked) {
			await new Promise<void>((res) => this.#queue.push(res))
		}
		this.#locked = true
	}

	/** 
	 * Releases the lock, allowing the next waiting lock to resolve.  
	 * @throws if not locked
	 */
	unlock() {
		if(!this.#locked) throw new Error("Mutex is not locked.")
		const resolve = this.#queue.shift()
		if(resolve) {
			resolve()
		} else {
			this.#locked = false
		}
	}

	/**
	 * Locks the mutex, then executes fn. Unlocks on completion.
	 */
	async lockDuring<R>(fn: () => Promise<R>): Promise<R> {
		await this.lock()
		try {
			return await fn()
		} finally {
			this.unlock()
		}
	}
}