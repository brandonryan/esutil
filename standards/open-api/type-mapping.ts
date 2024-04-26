import { UnionFromTuple, DefaultOptionalArray } from "../../utils.d.ts"
import { UrlPath, OpenApi, Parameter, JsonRef, PathItem } from "./spec.ts"

type a = FindPathKey<{
	paths: {
		"/test/{p}": {}
	}
}, '/test/p'>

type ResolveRef<Base, R> = (
	Base extends JsonRef ? (
		//TODO: resolve json ref
		never
	) :
	Exclude<R, JsonRef>
)

type FindPathKey<Api extends OpenApi, P extends UrlPath> = (
	Api["paths"] extends Record<infer Key extends UrlPath, infer Spec extends PathItem> ? (
		MatchPathPattern<Key, ExtractPathParameters<Api, Spec>, P>
	) :
	never
)

type ExtractPathParameters<Api extends OpenApi, P extends PathItem> = (
	ResolveRef<Api, UnionFromTuple<DefaultOptionalArray<P["parameters"]>>>
)

type MatchPathPattern<Pattern extends UrlPath, Params extends Parameter, TestPath extends UrlPath> = (
	PathToSegments<TestPath> extends PatternToSegments<Pattern> ? (
		Pattern
	) :
	never
)

type PatternToSegments<Pattern extends UrlPath> = ConvertPatternParams<PathToSegments<Pattern>>

type ConvertPatternParams<P extends string[]> = (
	P extends [infer Seg extends string, ...infer Rest extends string[]] ? (
		[ConvertPatternParam<Seg>, ...ConvertPatternParams<Rest>]
	) :
	[]
)

type ConvertPatternParam<P extends string> = (
	P extends `{${string}}` ? string : P
)

/** Converts a {@link JsonPtr} to a {@link JsonPath} */
export type PathToSegments<T extends UrlPath> = (
	T extends `/` ? [] :
	T extends `/${infer Seg}/${infer Rest}` ? [Seg, ...PathToSegments<`/${Rest}`>] :
	T extends `/${infer Seg}` ? [Seg] :
	string[]
)
