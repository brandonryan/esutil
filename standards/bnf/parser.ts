import { ASTError } from "./ast.ts";
import { Definition } from "./definition.ts";

export class ParserContext {
	#input: string
	#position = 0
	errors: ASTError[] = []

	constructor(input: string) {
		this.#input = input
	}

	get input() {
		return this.#input
	}

	get cursor() {
		return this.#position
	}

	set cursor(n: number) {
		if(n < this.#position) throw new Error("Cannot rewind cursor.")
		if(n > this.#input.length) throw new Error("Cannot advance cursor past string length.")
		this.#position = n
		this.errors = []
	}

	peek(n: number): string {
		if(n < 1) throw new Error("Must peek at least 1 character.")
		return this.#input.substring(this.cursor, this.cursor + n)
	}

	take(n: number): string {
		if(n < 1) throw new Error("Must peek at least 1 character.")
		if(this.cursor + n > this.#input.length) throw new Error("Cannot take past input length.")
		return this.#input.substring(this.cursor, this.cursor += n)
	}

	addError(err: ASTError) {
		this.errors.push(err)
	}
}

export class ASTParser {
	def: Definition
	constructor(def: Definition) {
		this.def = def
	}

	parseAST(input: string) {
		const result = this.def.parseAST(input, 0)

		if(result instanceof ASTError) {
			throw new ParseError(result)
		}
		
		// console.log(result.length)
		// console.log(input.length)

		if(result.length === input.length) return result
		if(result.terminalError) {
			throw new ParseError(result.terminalError)
		}

		console.log(result)
		throw new Error("Uh what")
	}
}

export class ParseError extends Error {
	name = ParseError.name

	constructor(cause: ASTError) {
		super("Parsing failed", {cause})
		super.name = ParseError.name
	}
}
