import { Choice, Definition, Optional, Repetition, Sequence } from "./definition.ts"
import { sprintf } from "https://deno.land/std@0.182.0/fmt/printf.ts";
import * as color from "https://deno.land/std@0.182.0/fmt/colors.ts";
import { strblock } from "../../string/strblock.ts";

export interface ASTNode {
	name?: string
	get length(): number
	get value(): string
	terminalError?: ASTError
	debug(): string
}

/**
 * This class intentionall does not extend Error to avoid creating stack trace.
 */
export class ASTError {
	def: Definition
	message: string
	position: number

	constructor(def: Definition, message: string, position: number) {
		this.def = def
		this.message = message
		this.position = position
	}

	toString() {
		return strblock`
		
		${this.message}
		`
	}
}

export class SequenceNode implements ASTNode {
	name?: string
	nodes: ASTNode[]
	def: Sequence
	constructor(def: Sequence, nodes: ASTNode[]=[]) {
		this.def = def
		this.nodes = nodes
	}

	get length(): number {
		return this.nodes.reduce((l, n) => l + n.length, 0)
	}

	get value() {
		return this.nodes.map(n => n.value).join('')
	}

	debug(): string {
		return fmtBlock(this.name, "Sequence", ...this.nodes)
	}
}

export class RepetitionNode implements ASTNode {
	name?: string
	nodes: ASTNode[]
	terminalError?: ASTError
	def: Repetition
	constructor(def: Repetition, nodes: ASTNode[]=[]) {
		this.def = def
		this.nodes = nodes
	}

	get count() {
		return this.nodes.length
	}

	get length() {
		return this.nodes.reduce((l, n) => l + n.length, 0)
	}

	get value() {
		return this.nodes.map(n => n.value).join('')
	}

	//TODO: need to add range specifier and 
	debug(): string {
		return fmtBlock(this.name, "Repetition", ...this.nodes)
	}
}

export class ChoiceNode implements ASTNode {
	name?: string
	index: number
	node: ASTNode
	def: Choice
	constructor(def: Choice, index: number, node: ASTNode) {
		this.def = def
		this.index = index
		this.node = node
	}

	get length() {
		return this.node.length
	}

	get value() {
		return this.node.value
	}

	debug(): string {
		return fmtBlock(this.name, `Choice[${this.index}]`, this.node)
	}
}

export class OptionNode implements ASTNode {
	name?: string
	node?: ASTNode
	terminalError?: ASTError;
	def: Optional
	constructor(def: Optional, node?: ASTNode) {
		this.def = def
		this.node = node
	}

	get present() {
		return this.node !== undefined
	}

	get length() {
		return this.node?.length ?? 0
	}

	get value() {
		return this.node?.value ?? ''
	}

	debug(): string {
		if(!this.node) return '<none>'
		return fmtBlock(this.name, "Option", this.node)
	}
}

export class ValueNode implements ASTNode {
	name?: string
	value: string
	constructor(value: string) {
		this.value = value
	}

	get length() {
		return this.value.length
	}

	debug(): string {
		const value = sprintf("%#v", this.value)
		if(this.name) {
			return this.name + ": Value {" + value + "}"
		}
		return color.yellow(value)
	}
}

function pre(p: string, value: string) {
	return value.split('\n').map(v => p + v).join('\n')
}

type fmtBlockOpts = {
	name?: string
	type: string
	color: boolean
}
function fmtBlock(name: string|undefined, type: string, ...nodes: ASTNode[]) {
	const {cyan, blue} = color

	name = name ? name + ': ' : ''
	const lside = `${cyan(name)}${blue(type)} `
	let inner = nodes.map(n => n.debug())

	if(nodes.length === 0) {
		return lside + '{}'
	} else if(nodes.length === 1) {
		const r = inner[0].endsWith('}') ? '}' : ' }'
		return lside + '{ ' + inner[0] + r
	}

	inner = inner.map(v => pre("  ", v))
	return lside + '{\n' + inner.join('\n') + '\n}'
}