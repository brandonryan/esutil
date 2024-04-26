import { UnionFromTuple, FlattenIntersection } from '../../utils.d.ts';
import { SchemaTypeTuple, JsonSchema, SchemaType, JsonValue, ObjectProperties, ArrayProperties } from "./spec-2020-12.ts"

type TypedSchema = Exclude<JsonSchema, boolean>

export type TypeFromSchema<S extends JsonSchema> = (
    S extends true ? JsonValue :
    S extends false ? never :
    ExtractTypeFromSchema<SchemaTypeUnion<S>, S>
)

export type TypeFromSchemaTuple<Items extends JsonSchema[]> = (
	Items extends [infer Head extends JsonSchema, ...infer Rest extends JsonSchema[]] ? (
		[TypeFromSchema<Head>, ...TypeFromSchemaTuple<Rest>]
	) :
	[]
)

type ExtractTypeFromSchema<T extends SchemaType | unknown, S extends TypedSchema> = (
    T extends "string" ? string :
    T extends "number" | "integer" ? number :
    T extends "boolean" ? boolean :
    T extends "null" ? null :
    T extends "object" ? ExtractObject<S> :
    T extends "array" ? ExtractArray<S> :
    JsonValue
)

type ExtractArray<S extends ArrayProperties> = (
	[...ExtractPrefixItems<S>, ...(
		S["items"] extends JsonSchema ? TypeFromSchema<S["items"]>[] : []
	)]
)

type ExtractPrefixItems<S extends ArrayProperties> = (
	S["prefixItems"] extends JsonSchema[] ? TypeFromSchemaTuple<S["prefixItems"]> : []
)

type ExtractObject<S extends ObjectProperties> = (
	S["properties"] extends object ? FlattenIntersection<(
		{ [Prop in OptionalObjectProperties<S>]?: TypeFromSchema<S["properties"][Prop]> } &
		{ [Prop in RequiredObjectProperties<S>]: TypeFromSchema<S["properties"][Prop]> }
	)> :
	unknown
)

type RequiredObjectProperties<S extends ObjectProperties> = (
	S["required"] extends unknown[] ? (
		Extract<keyof S["properties"], UnionFromTuple<S["required"]>>
	) :
	never
)
  
type OptionalObjectProperties<S extends ObjectProperties> = (
	S["required"] extends unknown[] ? (
		Exclude<keyof S["properties"], UnionFromTuple<S["required"]>>
	) :
	keyof S["properties"]
)

//Splitting the schema into union with properties
type SchemaTypeUnion<S extends TypedSchema> = (
    S["type"] extends SchemaTypeTuple ? (
        UnionFromTuple<S["type"]>
    ) :
    S["type"] extends SchemaType ? S["type"] :
    unknown
)
