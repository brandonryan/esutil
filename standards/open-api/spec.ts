import { FlattenIntersection } from "../../utils.d.ts"
import { JsonSchema } from "../json-schema/spec-2020-12.ts"

export type UrlPath = `/${string}`
export type MediaType = `${string}/${string}`

type StatusCodeType = 1 | 2 | 3 | 4 | 5
type StatusCodeDigits = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
type StatusCode = `${StatusCodeType}XX` | `${StatusCodeType}${StatusCodeDigits}${StatusCodeDigits}`

export type OpenApi = {
	paths?: Paths
	components?: Components
}

export type Paths = Record<UrlPath, PathItem>

export type PathItem = {
	//$ref
	//summary
	//description
	//servers
    get?: Operation,
    put?: Operation,
    post?: Operation,
    delete?: Operation,
    options?: Operation,
    head?: Operation,
    patch?: Operation,
    trace?: Operation,
    parameters?: Array<Parameter | JsonRef>
}

type Components = {
	schema: Record<string, JsonSchema>
}

type Operation = {
	//tags
	//summary
	//description
	//externalDocs
	//operationId
	parameters?: Array<Parameter | JsonRef>
	requestBody?: RequestBody | JsonRef
	responses?: Responses
	//callbacks
	//deprecated
	//security
	//servers
}

type RequestBody = {
	//description
	required: boolean
	content: Record<MediaType, MediaTypeBody>
}

type MediaTypeBody = {
	schema: JsonSchema,
	//example
	//examples
	//encoding
}

type Responses = FlattenIntersection<{
	default?: Response | JsonRef
} & {
	[code in StatusCode]?: Response | JsonRef
}>

type Response = {
	//description
	//links
	headers: Record<string, Header | JsonRef>
	content: Record<MediaType, MediaTypeBody>
}

type Header = Omit<Parameter, "name" | "in">

type ParameterLocation = "query" | "header" | "path" | "cookie"
type ParameterStyle = "matrix" | "label" | "form" | "simple" | "spaceDelimited" | "pipeDelimited" | "deepObject"
export type Parameter = {
	name: string
	in: ParameterLocation
	//description
	required?: boolean
	//deprecated

	style?: ParameterStyle
	explode?: boolean
	allowReserved?: boolean
	schema: JsonSchema
}

//TODO: this should live in its own standard folder
export type JsonRef = {
    $ref: string
}
