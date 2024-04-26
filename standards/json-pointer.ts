/** A valid json key */
export type Prop = string | number

/** Represents a decoded Json Pointer */
export type JsonPath = Array<string | number>

/** Represents an encoded Json Pointer */
export type JsonPtr = string // should be: '' | `/${string}` but i dont want to deal with it right now

/** Converts a {@link JsonPtr} to a {@link JsonPath} */
export type PtrToPath<T extends string> = (
	T extends `/${infer Rest}` ? _PtrToPath<Rest> :
	T extends '' ? [] :
	string[]
)

//pretty sure this can be gotten rid of
type _PtrToPath<T extends string> = (
	T extends `${infer Prop}/${infer Rest}` ? [DecodeProp<Prop>, ..._PtrToPath<Rest>] : [DecodeProp<T>]
)

/** Converts a {@link JsonPath} to a {@link JsonPtr} */
export type PathToPtr<T extends Prop[]> = (
	T extends [Prop, ...Prop[]] ? `/${_PathToPtr<T>}` :
	T extends never[] ? '' :
	string
)

//pretty sure this can be gotten rid of
type _PathToPtr<T extends Prop[]> = (
	T extends [Prop] ? EncodeProp<T[0]> :
	T extends [Prop, ...infer Rest extends Prop[]] ? 
		`${EncodeProp<T[0]>}/${_PathToPtr<Rest>}` 
	: string
)

/** Decodes a json pointer property */
export type DecodeProp<T extends Prop> = (
    T extends `${infer A}~0${infer B}` ? `${DecodeProp<A>}~${DecodeProp<B>}` :
    T extends `${infer A}~1${infer B}` ? `${DecodeProp<A>}/${DecodeProp<B>}` :
    T
)

/** Encodes a json pointer property */
export type EncodeProp<T extends Prop> = (
    T extends `${infer A}~${infer B}` ? `${EncodeProp<A>}~0${EncodeProp<B>}` :
    T extends `${infer A}/${infer B}` ? `${EncodeProp<A>}~1${EncodeProp<B>}` :
    T
)

/** Infers value type from {@link T} using a {@link JsonPtr} */
export type PtrVal<T, Ptr extends JsonPtr> = PathVal<T, PtrToPath<Ptr>>

/** Infers value type from {@link T} using a {@link JsonPath} */
export type PathVal<T, Path extends JsonPath> = (
	Path extends [infer P extends Prop, ...infer Rest extends JsonPath] ? 
		PathVal<GetProp<T, P>, Rest> : 
	T
)

type GetProp<T, P extends Prop> = (
	unknown extends T ? unknown :
	P extends keyof T ? T[P] :
	number extends keyof T ? 
		P extends `${number|'-'}` ? 
			T[number] : 
		never :
	never
)

/**
 * Gets {@link JsonPtr}'s for {@link T}.  
 * Pass true for {@link set} if you want "-" included in array indexing.
 */
export type Pointers<T, set=false> = PathToPtr<Paths<T, set>>

/**
 * Gets {@link JsonPath}'s for {@link T}.  
 * Pass true for {@link set} if you want "-" included in array indexing.
 */
export type Paths<T, set=false> = (
	[T] extends [never] ? [] :
	unknown extends T ? JsonPath :
	T extends unknown[] ? 
		[] | { [K in keyof T]-? : WithSet<[K], set> | [K, ...Paths<T[K], set>] }[number] :
	T extends Record<string, unknown> ?
		[] | { [K in keyof T]-? : [K] | [K, ...Paths<T[K], set>] }[Exclude<keyof T, symbol>] :
	[]
)

type WithSet<K extends [unknown], set> = (
	true extends set ?
		K extends [number] ? 
			['-'] | K : 
		K :
	K
)

/// Actual Code

export class JsonPtrError extends Error {
	name = "JsonPtrError"
	constructor(path: JsonPath, index: number, message: string) {
		const ptr = encodePointer(path.slice(0, index+1))
		super(`"${ptr}": ${message}`)
	}
}

export function get<T, P extends Paths<T>>(target: T, ptr: P): PathVal<T, P>
export function get<T, P extends Pointers<T>>(target: T, ptr: P): PtrVal<T, P>
export function get<T, P extends string>(target: T, ptr: P): PtrVal<T, P>
export function get(target: unknown, ptr: string|string[]): unknown
export function get(target: unknown, ptr: string|string[]) {
	const path = typeof ptr === "string" ? decodePointer(ptr) : ptr

	for(const [i, prop] of path.entries()) {
		if(!isObject(target)) throw new JsonPtrError(path, i, "Target must be array or object.")
		if(!(prop in target)) throw new JsonPtrError(path, i, "Property does not exist on target.")
		//@ts-expect-error: no way to tell typescript that we have validated that prop is in target
		target = target[prop]
	}

	return target
}

export function set<Ptr extends string, T, V extends PtrVal<T, Ptr>>(target: T, ptr: Ptr, val: V) {
	const path = decodePointer(ptr)
	if(path.length === 0) return val
	const ptarget = get(target, path.slice(0, -1))
	const prop = path[path.length-1]
	if(!isObject(ptarget)) throw new JsonPtrError(path, path.length-1, "Target must be array or object.")

	if(prop === '-' && Array.isArray(ptarget)) {
		ptarget.push(val)
	} else {
		//@ts-ignore not a good way to type this
		ptarget[prop] = val
	}
	
	return target
}

function isObject(target: unknown): target is object {
	return typeof target === "object" && target !== null
}

export function decodePointer<Ptr extends string>(ptr: Ptr): PtrToPath<Ptr> {
	if(ptr === "") return [] as PtrToPath<Ptr>
	if(ptr.charAt(0) !== '/') throw new Error("JSON Pointer must start with '/'.")
	
	return ptr
        .split('/')
		.slice(1)
        .map(part => part
            .replaceAll('~0', '~')
            .replaceAll('~1', '/')
        ) as PtrToPath<Ptr>
}

export function encodePointer<P extends JsonPath>(path: [...P]): PathToPtr<P> {
	if(path.length === 0) return "" as PathToPtr<P>
	return '/' + path
		.map(part => part
			.toString()
			.replaceAll('~', '~0')
			.replaceAll('/', '~1')
		)
		.join('/') as PathToPtr<P>
}

const a = {
	b: ''
}

const result = get(a, '/')