import { ASTError } from "./ast.ts"
import { document } from "./def/bnf.ts"
import { ASTParser } from "./parser.ts"

const parser = new ASTParser(document)
// console.dir(document, {})
try {
	const ast = parser.parseAST(`
	<test> ::= 'whatever'
	<test> ::= 'whatever'
	<test> ::= 'whatever'
	<test> ::= 'test'
	d
`)

	console.log(ast.length)
	console.log(ast.debug())
} catch (err) {
	console.log(err)
}
