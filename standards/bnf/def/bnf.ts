import { ASTError, ValueNode } from "../ast.ts"
import { Choice, Definition, fromCharSet, Literal, Repetition, Sequence } from "../definition.ts"

export class CharRange implements Definition {
	name?: string
	lower: number
	upper: number
	constructor(name: string, lower: number|string, upper: number|string)
	constructor(lower: number|string, upper: number|string)
	constructor(a: string | number, b: string | number, c?: string | number) {
		if(c !== undefined) {
			this.name = a as string
			a = b
			b = c!
		}

		this.lower = ((typeof a === "string") ? a.codePointAt(0) : a) ?? NaN
		this.upper = ((typeof b === "string") ? b.codePointAt(0) : b) ?? NaN

		if(isNaN(this.lower)) throw new Error("Missing lower")
		if(isNaN(this.upper)) throw new Error("Missing upper")
	}

	parseAST(str: string, from: number): ValueNode | ASTError {
		const val = str.codePointAt(from)
		if(!val) return new ASTError(this, ``, from)
		if(this.lower > val || this.upper < val) {
			const lc = String.fromCodePoint(this.lower)
			const uc = String.fromCodePoint(this.upper)
			return new ASTError(this, `Character out of range ${lc}-${uc} (${this.lower}-${this.upper})`, from)
		}
		return new ValueNode(str[from])
	}
}

const newline = new Choice("newline", new Literal('\n'), new Literal('\r\n'))
const optWhitespace = new Repetition("opt-whitespace", new Choice(
	new Literal('\n'),
	new Literal('\r\n'),
	new Literal('\t'),
	new Literal(" ")
))
const optSpace = new Repetition("opt-space", new Literal(" "))
const letter = new Choice("letter", new CharRange("A", "Z"), new CharRange("a", "z"))
const digit = new CharRange("digit", "0", "9")
const symbol = new Choice("symbol", ...fromCharSet(" |!#$%&()*+,-./:;>=<?@[\,]^_`{}~"))
const string = new Choice("string", 
	new Sequence(
		new Literal('"'),
		new Repetition(new Choice(letter, symbol, digit, new Literal("'"))),
		new Literal('"'),
	),
	new Sequence(
		new Literal("'"),
		new Repetition(new Choice(letter, symbol, digit, new Literal('"'))),
		new Literal("'"),
	),
)
const ruleChar = new Choice(letter, digit, new Literal("-"))
const ruleName = new Sequence("rule-name",
	new Literal("<"),
	letter,
	new Repetition(ruleChar),
	new Literal(">"),
)
const term = new Choice("term", string, ruleName)
const termSequence = new Repetition("term-sequence", term)
const alternate = new Sequence("alternate",
	new Literal("|"),
	termSequence
)
const expression = new Sequence("expression",
	termSequence,
	new Repetition(alternate),
)
const rule = new Sequence("rule",
	optSpace,
	ruleName,
	optSpace,
	new Literal("::="),
	optSpace,
	expression,
	optSpace,
	newline,
)
const statement = new Sequence( 
	optWhitespace,
	rule,
)

export const document = new Sequence("bnf-document",
	new Repetition(statement),
	optWhitespace,
)