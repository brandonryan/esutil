export function DataCloneError() {

}

//Follows https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm
export function clone<T>(val: T): T {
	if(shouldCloneByValue(val)) return val

	if(val instanceof Boolean) {
		val
	}

	


	throw new Error("value not supported by structured clone algorithm")
}

function shouldCloneByValue(val: unknown) {
	switch(typeof val) {
		case "boolean":
		case "undefined":
		case "number":
		case "bigint":
		case "string":
			return true
		case "object":
			return val === null
		default: 
			return true
	}
}