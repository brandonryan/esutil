//TODO: this kinda sucks, should be getting the least common prefix of all lines and removing that instead of all leading space.
export function strblock(template: TemplateStringsArray, ...substitutions: unknown[]): string {
	const lines = String.raw(template, ...substitutions).split('\n')
	if(lines[0] === '') lines.shift()
	return lines.map(line => line.trimStart()).join('\n')
}

