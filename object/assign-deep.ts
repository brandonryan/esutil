//TODO: options for arrays, map, set, etc...

export function assignDeep<T extends AnyObj>(target: T, val: DeepPartial<T>): void {
	for(const key in val) {
		if(isObj(val[key]) && isObj(target[key])) {
			//@ts-ignore type narrowing failing us here. dont want to make pointeless variables to make it work.
			assignDeep(target[key], val[key])
		} else {
			//@ts-ignore same reason as above
			target[key] = val[key]
		}
	}
}

function isObj(val: unknown): val is AnyObj {
	return typeof val === "object" && !Array.isArray(val)
}