import { Choice, Literal, Repetition, Sequence } from "../definition.ts"
import { CharRange } from "./bnf.ts"

export const ALPHA = new Choice("ALPHA",
	new CharRange(0x41, 0x5A),
	new CharRange(0x61, 0x7A),
)
export const DIGIT = new CharRange("DIGIT", 0x30, 0x39)
export const HEXDIG = new Choice("HEXDIG",
	DIGIT,
	new Literal("A", {ignoreCase: false}),
	new Literal("B", {ignoreCase: false}),
	new Literal("C", {ignoreCase: false}),
	new Literal("D", {ignoreCase: false}),
	new Literal("E", {ignoreCase: false}),
	new Literal("F", {ignoreCase: false}),
)
export const BIT = new Choice("BIT",
	new Literal("0"),
	new Literal("1"),
)
export const CR = new Literal("CR", '\r')
export const LF = new Literal("LF", '\n')
export const CRLF = new Sequence("CRLF", CR, LF)
export const DQUOTE = new Literal("DQUOTE", '"')
export const SP = new Literal("SP", ' ')
export const HTAB = new Literal("HTAB", '\t')
export const WSP = new Choice("WSP", SP, HTAB)
export const LWSP = new Repetition("LWSP", new Choice(
	new Sequence(CRLF, WSP),
	WSP,
))
export const CHAR = new CharRange("CHAR", 0x01, 0x7F)
export const VCHAR = new CharRange("VCHAR", 0x21, 0x7E)
export const OCTET = new CharRange("OCTET", 0x00, 0xFF)
export const CTL = new Choice("CTL",
	new CharRange(0x00, 0x1F),
	new Literal('\x7F'),
)