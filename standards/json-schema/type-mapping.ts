import { UnionFromTuple } from '../../utils.d.ts';
import { SchemaTypeTuple, JsonSchema, SchemaType, JsonValue, BaseType, StringProperties, BaseProperties, NumberProperties } from "./spec-2020-12.ts"

type TypedSchema = Exclude<JsonSchema, boolean>

export type TypeFromSchema<S extends JsonSchema> = (
    S extends true ? JsonValue :
    S extends false ? never :
    ExtractTypeFromSchema<SchemaTypeUnion<S>, S>
)

type ExtractTypeFromSchema<T extends SchemaType, S extends JsonSchema> = (
    T extends undefined ? JsonValue : 
    T extends "string" ? string :
    T extends "number" | "integer" ? number :
    T extends "boolean" ? boolean :
    T extends "null" ? null :
    T extends "object" ? object :
    T extends "array" ? unknown[] :
    never
)

//Splitting the schema into union with properties
type SchemaTypeUnion<S extends TypedSchema> = (
    S["type"] extends SchemaTypeTuple ? (
        UnionFromTuple<S["type"]>
    ) :
    S["type"] extends SchemaType ? S["type"] :
    undefined
)

// type SchemaPropsFromType<T extends SchemaType> = BaseProperties & (
//     T extends "null" ? unknown :
//     T extends "boolean" ? unknown :
//     T extends "integer" | "number" ? NumberProperties :
//     T extends "string" ? StringProperties :
//     // T extends "object" ? ObjectTypeFromSchema<S> :
//     // T extends "array" ? ArrayTypeFromSchema<S> :
//     unknown
// )

type a = UnionFromTuple<SchemaTypeTuple>


type AcceptableValue = "number" | "string" | "null"
type AcceptableValueTuple = [AcceptableValue, ...AcceptableValue[]]
type TestMapping<T extends AcceptableValue> = (
    T extends "number" ? number :
    T extends "null" ? null :
    T extends "string" ? string :
    never
)

type ExtractType<T extends AcceptableValue | AcceptableValueTuple> = (
    T extends AcceptableValueTuple ? TestMapping<UnionFromTuple<T>> :
    T extends AcceptableValue ? TestMapping<T> :
    never
)

type Working1 = TestMapping<UnionFromTuple<AcceptableValueTuple>>
type Working2 = TestMapping<UnionFromTuple<["number", "string"]>>
type Working3 = ExtractType<["number", "string"]>