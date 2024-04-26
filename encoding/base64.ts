export function base64Decode(base64: string): Uint8Array {
	switch(base64.length%4) {
		case 1: throw new Error("Invalid Base64 value");
		case 2: base64 += '=='; break;
		case 3: base64 += '='; break;
	}

	const groupCount = base64.length/4
	const result = new Uint8Array(groupCount*3)

	const bValues = Array.from(base64).map(base64Byte)
	for(let group = 0; group < groupCount; group++) {
		const bi = group * 4
		const ri = group * 3
		result[ri+0] = (bValues[bi]! << 2) + (bValues[bi+1]! >> 4)
		result[ri+1] = (bValues[bi+1]! << 4) + (bValues[bi+2]! >> 2)
		result[ri+2] = (bValues[bi+2]! << 6) + bValues[bi+3]!
	}

	if(base64.endsWith('==')) return result.subarray(0, -2)
	if(base64.endsWith('=')) return result.subarray(0, -1)
	return result
}

export function base64Encode(data: ArrayBufferLike): string {
	const arr = new Uint8Array(data)
	let result = ''

	//build out complete groups
	const groupCount = Math.floor(arr.byteLength/3)
	for(let group = 0; group < groupCount; group++) {
		const i = group * 3
		result += base64Char(arr[i]! >> 2)
		result += base64Char((arr[i]! << 4) + (arr[i+1]! >> 4) & 0b111111)
		result += base64Char((arr[i+1]! << 2) + (arr[i+2]! >> 6) & 0b111111)
		result += base64Char(arr[i+2]! & 0b111111)
	}

	//if neccesary, build the last partial group
	const partial = arr.byteLength % 3
	const i = groupCount * 3
	if(partial === 1) {
		result += base64Char(arr[i]! >> 2)
		result += base64Char((arr[i]! << 4) & 0b110000)
		result += '=='
	} else if(partial === 2) {
		result += base64Char(arr[i]! >> 2)
		result += base64Char((arr[i]! << 4) + (arr[i+1]! >> 4) & 0b111111)
		result += base64Char((arr[i+1]! << 2) & 0b111100)
		result += '='
	}
	return result
}

/** Gets the byte value for the specified character */
function base64Byte(v: string): number {
	const code = v.charCodeAt(0)
	if(code >= 65 && code <= 90) return code-65 //capitals
	if(code >= 97 && code <= 122) return code-97+26 //capitals
	if(code >= 48 && code <= 57) return code-48+52 //numbers

	if(v === '+') return 62
	if(v === '/') return 63
	if(v === '=') return 0

	throw new Error("Invalid base64 character.")
}

/** Gets the bas64 character for the specified 6bit value */
function base64Char(v: number): string {
	if(v < 26) return String.fromCharCode(v+65) //capitals
	if(v < 52) return String.fromCharCode(v-26+97) //lowercase
	if(v < 62) return String.fromCharCode(v-52+48) //numbers
	if(v === 62) return '+'
	if(v === 63) return '/'
	throw new Error("Number out of range. Must be a 6bit value.")
}