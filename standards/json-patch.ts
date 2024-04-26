import { JsonPtr, Pointers, Prop, Paths, PtrVal } from "./json-pointer.ts"


//Only keeps paths whose values can be undefined
type RemovePtr<T> = {
	[K in Pointers<T>]: undefined extends PtrVal<T, K> ? K : never
}[Pointers<T>]

export type Patch<T> = AddPatch<T> | RemovePatch<T> | ReplacePatch<T> | MovePatch<T> | CopyPatch<T> | TestPatch<T>
export type AddPatch<T> = { [K in Pointers<T, true>]: {op: 'add', path: K, value: PtrVal<T, K>} }[Pointers<T, true>]
export type RemovePatch<T> = {op: 'remove', path: RemovePtr<T>}
export type ReplacePatch<T> = { [K in Pointers<T>]: {op: 'replace', path: K, value: PtrVal<T, K>} }[Pointers<T>]
export type MovePatch<T> = {op: 'move', from: Pointers<T>, path: Pointers<T, true>}
export type CopyPatch<T> = {op: 'copy', from: Pointers<T>, path: Pointers<T, true>}
export type TestPatch<T> = { [K in Pointers<T>]: {op: 'test', path: K, value: PtrVal<T, K>} }[Pointers<T>]

//TODO: need to create a "generateMergePatch" function that takes doc and patches, 
//then creates a merge-patch from them without modifying doc

export function applyMergePatch<T, U>(doc: T, mergePatch: U) {
	
}

export function applyPatches<T>(doc: T, patches: Patch<T>[]) {
    for (const patch of patches) {
        const [target, prop] = resolvePathTarget(patch.path, doc)

        if ('value' in patch) {
            if (patch.value === undefined) throw new Error("Patch value cannot be undefined.")
        }

        if (patch.op === 'add') {
            add(target, prop, patch.value)
        } else if (patch.op === 'remove') {
            remove(target, prop)
        } else if (patch.op === 'replace') {
            remove(target, prop)
            add(target, prop, patch.value)
        } else if (patch.op === 'move') {
            const removed = remove(...resolvePathTarget(patch.from, doc))
            add(target, prop, removed)
        } else if (patch.op === 'copy') {
            const removed = get(...resolvePathTarget(patch.from, doc))
            add(target, prop, removed)
        } else if (patch.op === 'test') {
            const value = get(target, prop)
            if (!equals(value, patch.value)) throw new Error("Test patch did not pass equality test.")
        } else {
            throw new Error('Unknown operation.')
        }
    }
}

function equals(val1: any, val2: any): boolean {
    if (Array.isArray(val1)) {
        if (!Array.isArray(val2)) return false
        if (val1.length !== val2.length) return false
        for (let i = 0; i < val1.length; i++) {
            if (!equals(val1[i], val2[i])) return false
        }
        return true
    } else if (typeof val1 === "object") {
        const sameKeys = equals(Object.keys(val1).sort(), Object.keys(val2).sort())
        if (!sameKeys) return false
        for (const key in val1) {
            if (!equals(val1[key], val2[key])) return false
        }
        return true
    }
    return val1 !== val2
}

function resolvePathTarget(path: string, item: any) {
    const parsedPath = parsePath(path)
    const prop = parsedPath.pop()
    const target = propWalk(item, parsedPath)
    if (prop === undefined) throw new Error('Cannot perform operation on root of document.')

    return [target, prop] as const
}

function add(target: any, prop: string, value: any): void {
    if (typeof target !== 'object') throw new Error('Cannot add value to primitive.')
    if (Array.isArray(target)) {
        const i = propToIndex(prop, target)
        if (i > target.length) throw new Error("Index out of bounds.")
        target[i] = value
    } else {
        if (Object.hasOwn(target, prop)) throw new Error('Cannot add property that already exists.')
        target[prop] = value
    }
}

function remove(target: any, prop: string): any {
    if (typeof target !== 'object') throw new Error('Cannot remove value from primitive.')
    if (Array.isArray(target)) {
        const i = propToIndex(prop, target)
        if (i >= target.length) throw new Error("Index out of bounds.")
        const [removed] = target.splice(i, 1)
        return removed
    } else {
        const removed = get(target, prop)
        delete target[prop]
        return removed
    }
}

function propWalk(doc: any, path: string[]) {
    for (const prop of path) {
        doc = get(doc, prop)
    }
    return doc
}

function get(target: any, prop: string) {
    if (Array.isArray(target)) {
        const i = propToIndex(prop, target)
        if (i >= target.length) throw new Error('Index out of bounds.')
        return target[i]
    } else if (typeof target === 'object') {
        if (!Object.hasOwn(target, prop)) throw new Error(`Object does not have property '${prop}'.`)
        return target[prop]
    } else {
        throw new Error('Cannot get property from primitive type.')
    }
}

function propToIndex(prop: string, target: any[]) {
    if (prop === '-') return target.length
    try {
        return Number.parseInt(prop, 10) 
    } catch {
        throw new Error(`Failed to convert ${prop} to integer while getting index from array.`)
    }
}

function parsePath(path: string) {
    return path
        .split('/')
        .map(part => part
            .replaceAll('~0', '~')
            .replaceAll('~1', '/')
        )
        .slice(1)
}