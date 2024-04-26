async function * gen() {
	for(let i=0; i < 10; i++) {
		await new Promise<void>(res => setTimeout(res, 250))
		try {
			yield i
		} catch (err) {
			console.log("got error: " + err.message)
		} finally {
			console.log("Here")
		}
	}
}

;(async () => {
	const g = gen()
	for await (const item of g) {
		if(item === 4) g.throw(new Error("we dont like 4"))
		console.log(item)
	}
})()