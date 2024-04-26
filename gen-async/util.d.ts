export type AsyncSendable<T> = {
	send(val: T, sig?: AbortSignal): Promise<void>
	forward(iter: AsyncIterable<T>, sig?: AbortSignal): Promise<void>
	close(): Promise<void>
}

export type Yielded<T> = T extends AsyncIterator<infer V> ? V : never