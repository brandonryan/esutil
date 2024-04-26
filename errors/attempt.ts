import { coerceError } from './coerce-error.ts';

/**
 * Returns a wrapper around a function that will cause any thrown errors/rejections to return/resolve the error instead of throwing it.
 * @param fn the function to wrap
 */
export function attempt<F extends Async<UnknownFn>>(fn: F): (...args: Parameters<F>) => ReturnType<F> | Promise<Error>;
export function attempt<F extends UnknownFn>(fn: F): (...args: Parameters<F>) => ReturnType<F> | Error;
export function attempt(
	fn: UnknownFn,
): (...args: Parameters<typeof fn>) => ReturnType<typeof fn> | Error | Promise<Error> {
	return (...args) => {
		try {
			const result = fn(...args);
			if (result instanceof Promise) {
				return result.catch((err) => err);
			} else {
				return result;
			}
		} catch (err) {
			return coerceError(err);
		}
	};
}
