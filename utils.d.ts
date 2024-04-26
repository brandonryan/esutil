export type UnknownFn = (...args: never[]) => unknown;
export type Async<F extends UnknownFn> = (...args: Parameters<F>) => Promise<ReturnType<F>>;
export type Fn<Args extends unknown[], R> = (...args: Args) => R;
export type AnyFn = (...arguments: unknown[]) => unknown;
export type AnyObj = Record<string, unknown>;

//immutability
export type Writeable<T> = { -readonly [P in keyof T]: T[P] };
export type DeepPartial<T> = T extends AnyObj ? { [P in keyof T]?: DeepPartial<T[P]> } : T;

//Type Mapping
export type UnionFromTuple<T extends unknown[]> = T[number];
export type FlattenIntersection<T extends object> = (
	T extends infer O ? { [K in keyof O]: O[K] } : never
)

//Optional Defaults
export type DefaultOptionalArray<Arr extends unknown[] | undefined> = (
	Arr extends undefined ? [] : Arr
)
