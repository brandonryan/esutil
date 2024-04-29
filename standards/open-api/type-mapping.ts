import { UnionFromTuple, DefaultOptionalArray, FlattenIntersection } from "../../utils.d.ts"
import { TypeFromSchema } from '../json-schema/type-mapping.ts';
import { UrlPath, OpenApi, Parameter, JsonRef, PathItem, ParameterLocation } from "./spec.ts"

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

type ResolveOpenApiRefs<Api extends OpenApi> = FlattenIntersection<{
	
}>

type FindPathKey<Api extends OpenApi, P extends UrlPath> = (
	Api["paths"] extends Record<infer Key extends UrlPath, infer PI extends PathItem> ? (
		MatchPathPattern<Key, ExtractPathParameters<Api, PI>, P>
	) :
	never
)

type ExtractPathParameters<Api extends OpenApi, P extends PathItem> = (
	ResolveRef<Api, UnionFromTuple<DefaultOptionalArray<P["parameters"]>>>
)

type MatchPathPattern<Pattern extends UrlPath, PI extends PathItem, TestPath extends UrlPath> = (
	PathToSegments<TestPath> extends PatternToSegments<Pattern> ? (
		Pattern
	) :
	never
)

type PatternToSegments<Pattern extends UrlPath> = ConvertPathParams<PathToSegments<Pattern>>

type ConvertPathParams<Params extends Parameter, P extends string[]> = (
	P extends [infer Seg extends string, ...infer Rest extends string[]] ? (
		[ConvertPathParam<Seg>, ...ConvertPathParams<Rest>]
	) :
	[]
)

type ConvertPathParam<Params extends Parameter, P extends string> = (
	P extends `{${infer Name}}` ? (
		TypeFromSchema<ExtractParameter<Params, Name, "path">["schema"]>
	) :
	P
)

/** Extracts a {@link Parameter} by name and {@link ParameterLocation} */
type ExtractParameter<Params extends Parameter, Name extends string, In extends ParameterLocation> = (
	Params extends { name: Name, in: In } ? Params : never
)

type bing = ConvertPathParam<
	"test",
	{ in: "path", name: "test", schema: {type: "string"} } |
	{ in: "path", name: "boop", schema: {type: "number"} }
>

/** Converts a {@link JsonPtr} to a {@link JsonPath} */
export type PathToSegments<T extends UrlPath> = (
	T extends `/` ? [] :
	T extends `/${infer Seg}/${infer Rest}` ? [Seg, ...PathToSegments<`/${Rest}`>] :
	T extends `/${infer Seg}` ? [Seg] :
	string[]
)
