export class StringReader {
	#content: string
	#cursor = 0

	constructor(content: string) {
		this.#content = content
	}

	get content() {
		return this.#content
	}

	get position() {
		return this.#cursor
	}

	readUntil(str: string | RegExp, inclusive=true): string | undefined {
		return ''
	}

	readMatch(str: string | RegExp): string | undefined {
		return ''
	}

	moveCursor(delta: number) {
		this.setCursor(this.#cursor + delta)
	}

	setCursor(pos: number) {
		if(pos < 0 || pos > this.#content.length) {
			throw new Error("Cursor out of bounds")
		}
		this.#cursor = pos
	}
}