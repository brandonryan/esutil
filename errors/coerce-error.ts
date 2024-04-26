export function coerceError(err: unknown): Error {
	if(err instanceof Error) return err
	if(typeof err === "string") return new Error(err)
	if(typeof err === "object" && err !== null) {
		//do the best we can to convert the object to an error
		return Object.assign(new Error(), err)
	}
	return new Error("Incoercible Error")
}