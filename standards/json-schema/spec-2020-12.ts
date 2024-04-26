export type JsonPrimitive = null | boolean | string | number
export type JsonValue = JsonObj | JsonArr | JsonPrimitive
export type JsonObj = { [key: string]: JsonValue }
export type JsonArr = JsonValue[]
type URI = string
type Regex = string

export type SchemaType = undefined | "null" | "boolean" | "object" | "array" | "number" | "string" | "integer"
export type SchemaTypeTuple = [SchemaType, ...SchemaType[]]
export type JsonSchema = (BaseType & BaseProperties & StringProperties & NumberProperties & ArrayProperties & ObjectProperties) | boolean

/* TODO:
all properties optional
break out vocabularies?

allOf
anyOf
oneOf
not
if
then
else
dependentSchemas
*/


interface Commented {
    $comment: string
}

export interface BaseType {
    type?: SchemaType | SchemaTypeTuple
}

export interface BaseProperties {
    $schema?: URI
    $vocabulary?: { [scheme: URI]: boolean }
    $id?: URI
    $anchor?: string
    $dynamicAnchor?: string
    $ref?: URI
    $dynamicRef?: URI
    $defs?: { [name: string]: JsonSchema }

    format?: string
    enum?: JsonArr
    const?: JsonValue
    title?: string
    description?: string
    default?: JsonValue
    deprecated?: boolean
    readOnly?: boolean
    writeOnly?: boolean
    examples?: JsonValue[]
}

export interface NumberProperties {
    /** Must be greater than 0 */
    multipleOf?: number
    maximum?: number
    exclusiveMaximum?: number
    minimum?: number
    exclusiveMinimum?: number
}

export type StringFormat = "date-time" | "date" | "time" | "duration" | "email" | "idn-email" | "hostname" | "idn-hostname" | "ipv4" | "ipv6" | "uri" | "uri-reference" | "iri" | "iri-reference" |
    "uuid" | "uri-template" | "json-pointer" | "relative-json-pointer" | "regex" | string

export interface StringProperties {
    maxLength?: number
    minLength?: number
    pattern?: string
    format?: StringFormat
    contentEncoding?: string
    contentMediaType?: string
    contentSchema?: JsonSchema
}

export interface ArrayProperties {
    maxItems?: number
    minItems?: number
    uniqueItems?: boolean
    maxContains?: number
    minContains?: number

    //applicator vocabulary
    prefixItems?: JsonSchema[]
    items?: JsonSchema
    contains?: JsonSchema

    //unevaluated vocabulary
    unevaluatedItems?: JsonSchema
}

export interface ObjectProperties {
    maxProperties?: number
    minProperties?: number
    required?: string[]
    dependentRequired?: {
        [key: string]: string[]
    }

    //applicator vocabulary
    properties?: {
        [name: string]: JsonSchema
    }
    patternProperties?: {
        [pattern: Regex]: JsonSchema
    }
    additionalProperties?: JsonSchema
    propertyNames?: StringProperties

    //unevaluated vocabulary
    unevaluatedProperties?: JsonSchema
}
