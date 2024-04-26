
/*
ftp://ftp.is.co.za/rfc/rfc1808.txt
http://www.ietf.org/rfc/rfc2396.txt
ldap://[2001:db8::7]/c=GB?objectClass?one
mailto:John.Doe@example.com
news:comp.infosystems.www.servers.unix
tel:+1-816-555-1212
telnet://192.0.2.16:80/
urn:oasis:names:specification:docbook:dtd:xml:4.1.2


A URI is a sequence of characters from a
very limited set: the letters of the basic Latin alphabet, digits,
and a few special characters.

For consistency, URI producers and normalizers should use 
uppercase hexadecimal digits for all percent-encodings.

For consistency, percent-encoded octets in the ranges of ALPHA, DIGIT, hyphen, period, underscore, or tilde
should not be created by URI producers and, when found in a URI, should be decoded to their corresponding 
unreserved characters by URI normalizers.

reserved    = gen-delims / sub-delims
gen-delims  = ":" / "/" / "?" / "#" / "[" / "]" / "@"
sub-delims  = "!" / "$" / "&" / "'" / "(" / ")" / "*" / "+" / "," / ";" / "="
unreserved  = ALPHA / DIGIT / "-" / "." / "_" / "~"


*/
//TODO:  ERR_INVALID_URL

type URIParts = {
	scheme: string
	authority?: URIAuthority
	path: string
}

type URIAuthority = {
	userinfo: string
	host: string
	port: number
}

export class URI {
	#parsed: URIParts

	constructor(str: string) {
		const work: Partial<URIParts> = {}

		//scheme
		const schemeEnd = str.indexOf(':')
		if(schemeEnd === -1) throw new Error("Missing URI scheme")
		work.scheme = str.substring(0, schemeEnd).toLowerCase()
		str = str.substring(schemeEnd+1)

		//authority
		if(str.startsWith('//')) {
			work.authority = {} as URIAuthority

			str = str.substring(2)
			const authEnd = findNext(str, '/', '?', '#') ?? str.length
			let authstr = str.substring(0, authEnd)
			str = str.substring(authEnd)
			
			//userinfo
			const uinfoEnd = findNext(str, '@')
			if(uinfoEnd !== undefined) {
				work.authority.userinfo = authstr.substring(0, uinfoEnd)
				authstr = authstr.substring(uinfoEnd+1)
			}
			
			//host
			const hostEnd = findNext(str, ':') ?? authEnd
			work.authority.host = authstr.substring(0, hostEnd)
			authstr = authstr.substring(hostEnd+1)

			//port
			if(authstr.startsWith(':')) {
				work.authority.port = parseInt(str.substring(1, hostEnd), 10)
			}
		}

		this.#parsed = work as URIParts
	}
}

function findNext(str: string, ...tokens: string[]) {
	for(const token of tokens) {
		const i = str.indexOf(token)
		if(i !== -1) return i
	}
	return undefined
}