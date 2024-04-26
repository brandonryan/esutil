import {UnknownFn, Async} from '../utils.d.ts'

/**
 * Returns a wrapper around a function that will cause any thrown errors/rejections to be the cause of a rethrown error
 * @param message message to use for the error
 * @param fn the function to wrap
 */
export function errorCause<F extends Async<UnknownFn>>(message: string, fn: F): (...args: Parameters<F>) => ReturnType<F>;
export function errorCause<F extends UnknownFn>(message: string, fn: F): (...args: Parameters<F>) => ReturnType<F>;
export function errorCause(
	message: string,
	fn: UnknownFn,
): (...args: Parameters<typeof fn>) => ReturnType<typeof fn> {
	return (...args) => {
		try {
			const result = fn(...args);
			if (result instanceof Promise) {
				return result.catch((cause) => {
					throw new Error(message, {cause})
				});
			} else {
				return result;
			}
		} catch (cause) {
			throw new Error(message, {cause})
		}
	};
}