export class Cursor {
	#position = 0
	#content: string
	constructor(content: string) {
		this.#content = content
	}

	get position() {
		return this.#position
	}

	set position(pos: number) {
		if(pos < 0) throw new Error("Position must be positive")
		if(pos > this.#content.length) throw new Error("Position must not be longer than content length")
		this.#position = pos
	}

	end() {
		return this.#position === this.#content.length
	}

	peek(n: number) {
		return this.#content.slice(this.#position, this.position + n)
	}

	next() {
		return this.#content[this.position++]
	}

	* [Symbol.iterator]() {
		yield this.#content[this.position]
		this.position++
	}
}