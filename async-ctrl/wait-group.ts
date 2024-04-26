export class WaitGroup {
	#waiting: Array<() => void> = []
	#counter = 0

	add(count: number) {
		if(!Number.isInteger(count)) throw new Error("count must be an integer")
		if(count < 1) throw new Error("count must be greater than 0")
		this.#counter += count
	}

	done() {
		if(this.#counter === 0) throw new Error("Cannot call done when counter is 0")
		this.#counter--
		if(this.#counter === 0) {
			for(const cb of this.#waiting) {
				cb()
			}
		}
	}

	async wait() {
		await new Promise<void>((res) => this.#waiting.push(res))
	}
}