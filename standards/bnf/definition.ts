import { ASTError, ASTNode, ChoiceNode, OptionNode, RepetitionNode, SequenceNode, ValueNode } from "./ast.ts"
import { ParserContext } from "./parser.ts"

export interface Definition {
	name?: string
	parseAST(ctx: ParserContext): ASTNode | ASTError
}

export class Optional implements Definition {
	name?: string
	def: Definition

	constructor(name: string, def: Definition)
	constructor(def: Definition)
	constructor(a: string|Definition, b?: Definition) {
		if(b !== undefined) {
			this.name = a as string
			this.def = b
		} else {
			this.def = a as Definition
		}
	}

	parseAST(ctx: ParserContext): OptionNode {
		const node = this.def.parseAST(ctx)
		if(node instanceof ASTError) {
			return new OptionNode(this)
		}
		return new OptionNode(this, node)
	}
}

type RepetitionOpts = {
	min?: number
	max?: number
}
export class Repetition implements Definition {
	name?: string
	def: Definition
	min: number
	max: number

	constructor(name: string, def: Definition, opt?: RepetitionOpts)
	constructor(def: Definition, opt?: RepetitionOpts)
	constructor(a: string | Definition, b?: Definition | RepetitionOpts, c?: RepetitionOpts) {
		let opts: RepetitionOpts | undefined
		if(typeof a === 'string') {
			this.name = a
			this.def = b as Definition
			opts = c
		} else {
			this.def = a as Definition
			opts = b as RepetitionOpts
		}
		this.min = opts?.min ?? 0
		this.max = opts?.max ?? Infinity
	}

	parseAST(ctx: ParserContext): RepetitionNode | ASTError {
		const rep = new RepetitionNode(this)
		for(let i=0; i < this.max; i++) {
			const node = this.def.parseAST(ctx)
			if(node instanceof ASTError) {
				rep.terminalError = node
				break
			}
			rep.nodes.push(node)
		}
		if(rep.count < this.min) {
			return new ASTError(this, `Minimum repetition of ${this.min} not met.`, ctx.cursor)
		}
		return rep
	}
}

export class Choice implements Definition {
	name?: string
	defs: Definition[]

	constructor(name: string, ...defs: Definition[])
	constructor(...defs: Definition[])
	constructor(a: string|Definition, ...b: Definition[]) {
		if(typeof a === 'string') {
			this.name = a
			this.defs = b
		} else {
			b.unshift(a)
			this.defs = b
		}
	}

	parseAST(ctx: ParserContext): ChoiceNode | ASTError {
		for(const [i, def] of this.defs.entries()) {
			const node = def.parseAST(ctx)
			if(node instanceof ASTError) continue
			return new ChoiceNode(this, i, node)
		}
		return new ASTError(this, `No choices satisfied`, ctx.cursor)
	}
}

export class Sequence implements Definition {
	name?: string
	defs: Definition[]

	constructor(name: string, ...defs: Definition[])
	constructor(...defs: Definition[])
	constructor(a: string|Definition, ...b: Definition[]) {
		if(typeof a === 'string') {
			this.name = a
			this.defs = b
		} else {
			b.unshift(a)
			this.defs = b
		}
	}

	parseAST(ctx: ParserContext): SequenceNode | ASTError {
		const seq = new SequenceNode(this)
		for(const def of this.defs) {
			const node = def.parseAST(ctx)
			if(node instanceof ASTError) return node
			seq.nodes.push(node)
		}
		return seq
	}
}

type LiteralOpts = {
	ignoreCase?: boolean
}
export class Literal implements Definition {
	name?: string
	value: string
	ignoreCase: boolean

	constructor(name: string, value: string, opt?: LiteralOpts)
	constructor(value: string, opt?: LiteralOpts)
	constructor(a: string, b?: string|LiteralOpts, c?: LiteralOpts) {
		let opts: LiteralOpts | undefined
		if(c !== undefined) {
			this.name = a
			this.value = b as string
			opts = c
		} else {
			this.value = a
			opts = b as LiteralOpts
		}
		
		this.ignoreCase = opts?.ignoreCase ?? false
	}

	parseAST(ctx: ParserContext): ValueNode | ASTError {
		let exp = this.value
		let test = ctx.peek(exp.length)
		let s = ''

		if(this.ignoreCase) {
			test = test.toLocaleLowerCase()
			exp = exp.toLocaleLowerCase()
			s = ' (case insensitive)'
		}

		if(exp !== test) {
			return new ASTError(this, `Expected literal${s} "${exp}".`, ctx.cursor)
		}
		return new ValueNode(ctx.take(exp.length))
	}
}

export function fromCharSet(values: string): Literal[] {
	return [...values].map(c => new Literal(c))
}