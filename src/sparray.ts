import util from 'util'

/**
 * Builds a sparray from several ways:
 * 1) with no param for an empty array
 * 2) with a single non-array-like element for an array of one element
 * 3) with a single array-like element for a copy of this array
 * 4) with a single sparray object for a copy of this sparray
 * 5) with multiple params for a multi-element array
 *
 * @param data - elements to build a sparray
 */
export function from<T>(...data: any): Sparray<T> {
  if (data.length === 0) {
    return new Sparray([])
  } else if (data.length === 1) {
    data = data[0]
    if (Array.isArray(data)) {
      return new Sparray(data)
    } else if (data instanceof Set) {
      return new Sparray(Array.from(data))
    } else if (data instanceof Sparray) {
      return new Sparray(data._data)
    } else {
      return new Sparray([data])
    }
  } else {
    return new Sparray(data)
  }
}

/**
 * Builds a sparray from a range. It can be used in several ways:
 * 1) with one param, the range iterates 1-by-1 from 0 (inclusive) to the value of param (exclusive)
 * 2) with two params, the range iterates 1-by-1 from the first param (inclusive) to the second param (exclusive)
 * 3) with three params, the range iterates by the value of the third param, from the value of the first param (inclusive) to the value of the second param (exclusive)
 *
 * @param start - start of the range (inclusive)
 * @param end - end of the range (exclusive)
 * @param step - the increment size
 */
export function range(start: number, end?: number, step?: number): Sparray<number> {
  if (typeof start === 'undefined') {
    throw new Error('No param was supplied')
  }

  if (typeof end === 'undefined') {
    end = start
    start = 0
  }

  if (typeof step === 'undefined') {
    step = end < start ? -1 : 1
  }

  if ((end < start && step >= 0) || (start < end && step <= 0)) {
    throw new Error(`Invalid step ${step}`)
  }

  const data = []
  if (end < start) {
    for (let i = start; i > end; i += step) data.push(i)
  } else {
    for (let i = start; i < end; i += step) data.push(i)
  }
  return new Sparray<number>(data)
}

/**
 * Builds a sparray of a number (n) of static valued elements.
 * @param n - the desired length of the sparray
 * @param value - the static value for all the elements
 */
export function fillOf<T>(n: number, value: T): Sparray<T> {
  if (typeof n !== 'number') {
    throw new Error('Invalid number (n) of elements')
  }

  const data = []
  for (let i = 0; i < n; i++) {
    data.push(value)
  }

  return new Sparray<T>(data)
}

/**
 * Builds an empty sparray
 */
export function empty(): Sparray<any> {
  return new Sparray([])
}

/**
 * Determines if an object is an instance of sparray
 * @param obj - object to verify
 */
export function isSparray(obj: any): boolean {
  return obj instanceof Sparray
}

/**
 * Sparray - Supper Array
 * Holds the methods and attributes of a sparray. Sparrays are immutable, i.e. it is not possible to include,
 * remove or replace an element of a sparray (although it is possible to change the referenced element,
 * e.g: attributes of an object). Every operation/transformation (such as map, filter, and concat)
 * will generate a new and immutable sparray.
 */
export class Sparray<T>  {

  /**
   * Internal structure to hold data.
   */
  _data: T[]

  /**
   * Constructor of the sparray. Receive an array as data.
   *
   * @constructor
   * @param data - array with the elements
   */
  constructor(data: T[]) {
    if (!Array.isArray(data))
      throw new Error('Invalid data input')

    this._data = data
  }

  /**
   * Returns the raw data as a native array
   */
  toArray(): T[] {
    return [...this._data]
  }

  /**
   * Returns the raw data as a native set
   */
  toSet(): Set<T> {
    return new Set(this.toArray())
  }

  /**
   * An node debugger/inspect representation for the sparray. It will be the same as the raw data (array-like representation).
   */
  [util.inspect.custom](depth: any, opts: any): any {
    return this._data
  }

  /**
   * Resolve the index, considering the posibility of backwoards indexing
   * @param index the index to resolve
   */
  private _resolveIndex(index: number): number {
    if (index < 0)
      return this.length + index
    else
      return index
  }

  /**
   * Gets an element from sparray by index. Negative indices will get elements backward. Out of bound indices will return undefined.
   *
   * @param index - the position of the element that should be gotten
   */
  get(index: number): T {
    return this._data[this._resolveIndex(index)]
  }


  /**
   * The number of elements of the sparray.
   */
  get length(): number {
    return this._data.length
  }

  /**
   * Returns the number of elements of the sparray.
   */
  size(): number {
    return this.length
  }

  /**
   * Counts the number of elements. If a conditionFn is provided, only the elements that match the condition will be counted.
   *
   * @param conditionFn - an optional condition function
   * @param thisArg - object to be used as this inside conditionFn
   */
  count(conditionFn: (value: T, index: number, sparray: Sparray<T>) => boolean, thisArg?: any): number {
    if (!conditionFn) return this.length

    conditionFn.bind(thisArg || this)

    let c = 0
    for (let i = 0; i < this.length; i++) {
      if (conditionFn(this.get(i), i, this))
        c++
    }

    return c
  }

  /**
   * Returns a key iterator of the sparray.
   */
  keys(): IterableIterator<number> {
    return this._data.keys()
  }

  /**
   * Returns a value iterator of the sparray. It is the default iterator in for-of loops.
   */
  values(): IterableIterator<T> {
    return this._data.values()
  }

  /**
   * Returns a values iterator of the sparray.
   */
  [Symbol.iterator]() {
    return this.values()
  }

  /**
   * Returns an entry iterator of the sparray. Each element is a two-position array, the index, and the value.
   */
  entries(): IterableIterator<[number, T]> {
    return this._data.entries()
  }


  /**
   * Build a new sparray by transforming the elements according to the mapFn function. For each element in sparray, mapFn must return a new element (derived or not from the original one).
   * @param mapFn - transformation function
   * @param thisArg - object to be used as this inside mapFn
   */
  map<U>(mapFn: (value: T, index: number, sparray: Sparray<T>) => U, thisArg?: any): Sparray<U> {
    mapFn.bind(thisArg || this)

    const mapped: U[] = []
    for (let i = 0; i < this.length; i++) {
      mapped[i] = mapFn(this.get(i), i, this)
    }

    return from(mapped)
  }

  /**
   * Aggregate the elements of sparray pair-by-pair, according to the reduceFn,
   * accumulating the aggregation until the last element.
   * @param reduceFn - aggragation (reducer) function
   * @param initialValue - value to initialize the accumulated variable
   * @param thisArg - object to be used as this inside reduceFn
   */
  reduce<U>(reduceFn: (previousValue: U | T, currentValue: T, currentIndex: number, sparray: Sparray<T>) => U, initialValue?: U, thisArg?: any): U | T {
    if (this.length === 0 && (typeof initialValue === 'undefined')) {
      throw new Error('Reduce of empty sparray with no initial value')
    }

    reduceFn.bind(thisArg || this)

    let i: number
    let prev: U | T
    if (typeof initialValue === 'undefined') {
      i = 1
      prev = this.get(0)
    } else {
      i = 0
      prev = initialValue
    }

    for (; i < this.length; i++) {
      prev = reduceFn(prev, this.get(i), i, this)
    }

    return prev
  }

  /**
   * Aggregate the elements of sparray pair-by-pair, from the right to the left, according to the reduceFn,
   * accumulating the aggregation until the last element.
   * @param reduceFn - aggragation (reducer) function
   * @param initialValue - value to initialize the accumulated variable
   * @param thisArg - object to be used as this inside reduceFn
   */
  reduceRight<U>(reduceFn: (previousValue: U | T, currentValue: T, currentIndex: number, sparray: Sparray<T>) => U, initialValue?: U, thisArg?: any): U | T {
    if (this.length === 0 && (typeof initialValue === 'undefined')) {
      throw new Error('Reduce of empty sparray with no initial value')
    }

    reduceFn.bind(thisArg || this)

    let i: number
    let prev: U | T
    if (typeof initialValue === 'undefined') {
      i = this._resolveIndex(-2)
      prev = this.get(-1)
    } else {
      i = this._resolveIndex(-1)
      prev = initialValue
    }

    for (; i >= 0; i--) {
      prev = reduceFn(prev, this.get(i), i, this)
    }

    return prev
  }

  /**
   * Builds a new sparray with only the elements selected by filterFn.
   * @param filterFn - filter function
   * @param thisArg - object to be used as this inside reduceFn
   */
  filter(filterFn: (value: T, index: number, sparray: Sparray<T>) => boolean, thisArg?: any): Sparray<T> {
    filterFn.bind(thisArg || this)

    const filtered: T[] = []
    for (const [i, a] of this.entries()) {
      if (filterFn(a, i, this)) {
        filtered.push(a)
      }
    }

    return from(filtered)
  }

  /**
   * Iterates over each element of the sparray. The own sparray is returned at the end, thus other methods may be chained.
   * @param forEachFn - function to be executed over each element
   * @param thisArg - object to be used as this in forEachFn
   */
  forEach(forEachFn: (value: T, index: number, sparray: Sparray<T>) => void, thisArg?: any): Sparray<T> {
    forEachFn.bind(thisArg || this)

    for (const [i, a] of this.entries()) {
      forEachFn(a, i, this)
    }

    return this
  }

  /**
   * Build a new sparray by transforming the elements according to the flatMapFn function and flatten the resultant sparrays or arrays.
   * @param flatMapFn - transformation function
   * @param thisArg - object to be used as this inside flatMapFn
   */
  flatMap<U>(flatMapFn: (value: T, index: number, sparray: Sparray<T>) => U[] | Sparray<U>, thisArg?: any): Sparray<U> {
    flatMapFn.bind(thisArg || this)

    const flatted: U[] = []
    for (const [i, a] of this.entries()) {
      const mapped = flatMapFn(a, i, this)
      if (mapped != null) {
        if (isSparray(mapped)) {
          flatted.push(...((mapped as Sparray<U>)._data))
        } else {
          flatted.push(...(mapped as U[]))
        }
      }
    }
    return from(flatted)
  }

  /**
   * Builds a new sparray flatting the nested sparrays and/or arrays to the main sparray
   * @param depth - how deep the flatten will be applied
   */
  flatten(depth: number): Sparray<any> {
    if (typeof depth === 'undefined') {
      depth = 1
    }

    if (depth <= 0) {
      return this
    }

    const res = from(this._data.reduce((a: any[], b) => {
      if (b instanceof Sparray) {
        return a.concat(b.toArray())
      }
      return a.concat(b)
    }, []))

    return res.flatten(depth - 1)
  }

  /**
   * Builds a new sparray of distinct values, removing all the duplicates
   */
  distinct(): Sparray<T> {
    return from(new Set(this._data))
  }

  /**
   * Join the elements of the sparray in a string using the separator.
   * The comma is the default separator. The separator can be a string
   * or a function that returns a string. The function will receive as
   * parameter the index of the separator from the beginning and the
   * index from the end. Note the count of separators is the count of
   * elements minus one.
   *
   * @param separator - the string or function that resolves the separator
   * @param thisArg - object to be used as this inside the function
   */
  join(separator: string | ((indexFromStart: number, indexFromEnd: number) => string), thisArg?: any): string {
    if (typeof separator === 'string') {
      return this._data.join(separator)
    } else if (typeof separator === 'function') {
      separator.bind(thisArg || this)
      const sepCount = this.length - 1

      let res = ''
      this._data.forEach((a, i) => {
        if (i > 0) {
          res += separator(i - 1, sepCount - i)
        }
        res += a
      })

      return res
    } else {
      return this._data.join()
    }
  }

  /**
   * Returns true if some element produces the result true in the someFn.
   * @param someFn - condiction to be tested
   * @param thisArg - object to be used as this inside someFn
   */
  some(someFn: (value: T, index: number, sparray: Sparray<T>) => boolean, thisArg?: any): boolean {
    someFn.bind(thisArg || this)

    for (const [i, a] of this.entries()) {
      if (someFn(a, i, this)) return true
    }

    return false
  }

  /**
   * Returns true if every element produces the result true in the everyFn.
   * @param everyFn - condiction to be tested
   * @param thisArg - object to be used as this inside everyFn
   */
  every(everyFn: (value: T, index: number, sparray: Sparray<T>) => boolean, thisArg?: any): boolean {
    everyFn.bind(thisArg || this)

    for (const [i, a] of this.entries()) {
      if (!everyFn(a, i, this)) return false
    }

    return true
  }

  /**
   * Concatenates one or more sparrays, arrays or elements to the original sparray.
   * The result will be a new sparray. The original sparray is not changed.
   *
   * @param toConcat - sparrays, arrays or elements to concatenate
   */
  concat(...toConcat: any): Sparray<T> {
    const data = this.toArray()
    for (const obj of toConcat) {
      if (isSparray(obj)) {
        data.push(...obj._data)
      } else if (Array.isArray(obj)) {
        data.push(...obj)
      } else {
        data.push(obj)
      }
    }

    return from(data)
  }

  /**
   * Returns the first element that satisfies the condition of findFn, or undefined if no element satisfies.
   * @param findFn - condiction to be tested
   * @param thisArg - object to be used as this inside everyFn
   */
  find(filterFn: (value: T, index: number, sparray: Sparray<T>) => boolean, thisArg?: any): T | undefined {
    filterFn.bind(thisArg || this)

    const filtered: T[] = []
    for (const [i, a] of this.entries()) {
      if (filterFn(a, i, this)) {
        return a
      }
    }

    return undefined
  }

  /**
   * Returns the index of the first element that satisfies the condition of findFn, or -1 if no element satisfies.
   * @param findFn - condiction to be tested
   * @param thisArg - object to be used as this inside everyFn
   */
  findIndex(findFn: (value: T, index: number, sparray: Sparray<T>) => boolean, thisArg?: any): number {
    findFn.bind(thisArg || this)

    for (const [i, a] of this.entries()) {
      if (findFn(a, i, this)) {
        return i
      }
    }

    return -1
  }


  /**
   * Returns the first index of the element equals to the searchElement, or -1 if not found
   * @param searchElement value to search
   */
  indexOf(searchElement: T): number {
    return this._data.indexOf(searchElement)
  }

  /**
   * Returns the last index of the element equals to the searchElement, or -1 if not found
   * @param searchElement value to search
   */
  lastIndexOf(searchElement: T): number {
    return this._data.lastIndexOf(searchElement)
  }

  /**
   * Returns true if the sparray contains the value, and false otherwise
   * @param value value to search
   */
  includes(value: T): boolean {
    return this._data.includes(value)
  }

  /**
   * Returns true if the sparray contains all the values, and false otherwise
   * @param value values to search
   */
  includesAll(values: any): boolean {
    if (isSparray(values))
      values = (values as Sparray<T>).toArray()

    if (!Array.isArray(values)) {
      return this.includes(values as T)
    }

    return values.every(a => this._data.includes(a))
  }

  /**
   * Builds a new sparray with the reverse order
   */
  reverse(): Sparray<T> {
    return from(this.toArray().reverse())
  }

  /**
   * Builds a new sparray with the elements sorted by either a natural order or a custom sortFn
   * @param sortFn - otional custom sort condition
   * @param thisArg - object to be used as this inside sortFn
   */
  sort(sortFn?: (a: T, b: T) => number, thisArg?: any): Sparray<T> {
    if (typeof sortFn === 'undefined') {
      return from(this.toArray().sort())
    } else {
      sortFn.bind(thisArg || this)
      return from(this.toArray().sort(sortFn))
    }
  }

  /**
   * Builds a new sparray with the elements sorted by the criteria provided by keyFn
   * @param keyFn - get sort key from object
   * @param thisArg object to be used as this inside sortFn
   */
  sortBy<U>(keyFn: (value: T) => U | U[] | Sparray<U>, reverse: boolean, thisArg?: any): Sparray<T> {
    keyFn.bind(thisArg || this)

    return from(this._data.sort((a, b) => {
      let keysA = keyFn(a)
      let keysB = keyFn(b)

      if (isSparray(keysA)) keysA = (keysA as Sparray<U>).toArray()
      if (isSparray(keysB)) keysB = (keysB as Sparray<U>).toArray()

      if (!Array.isArray(keysA)) keysA = [keysA as U]
      if (!Array.isArray(keysB)) keysB = [keysB as U]

      for (let i = 0; i < Math.min(keysA.length, keysB.length); i++) {
        if (keysA[i] < keysB[i]) return reverse ? 1 : -1
        if (keysA[i] > keysB[i]) return reverse ? -1 : 1
      }

      return 0
    }))
  }

  /**
   * Builds a new sparray with the elements sliced from the original one. Negative indices could be used to backward indexing.
   * @param startIndex - slice from this index (inclusive).
   * @param endIndex - slice until this index (exclusive). If it is not provided, it assumes the end of the sparray.
   */
  slice(startIndex: number, endIndex?: number): Sparray<T> {
    if (typeof endIndex === 'undefined')
      return from(this._data.slice(this._resolveIndex(startIndex)))
    else
      return from(this._data.slice(this._resolveIndex(startIndex), this._resolveIndex(endIndex)))
  }

  /**
   * Returns the string representation of the sparray and its elements
   */
  toString(): string {
    if (this.isEmpty()) {
      return '[ ]'
    } else {
      return `[ ${this.join(', ')} ]`
    }
  }

  /**
   * Ensures all the elements are numeric. Non-numeric elements will be transformed into NaN.
   */
  toNumeric(): Sparray<number> {
    return this.map(a => {
      if (typeof a === 'number')
        return a
      else
        return NaN
    })
  }

  /**
   * Sums all the elements of the sparray. If there is a non-numeric element, the return will be NaN
   */
  sum(): number {
    return this.toNumeric().reduce((a, b) => a + b, 0)
  }

  /**
   * Calculates the average of all the elements of the sparray. If there is a non-numeric element, the return will be NaN
   */
  avg(): number {
    if (this.isEmpty())
      return NaN

    return this.sum() / this.length
  }

  /**
   * Returns the min value of the sparray
   */
  min(): T | undefined {
    if (this.isEmpty())
      return undefined

    return this._data.reduce((a, b) => a < b ? a : b)
  }

  /**
   * Returns a sparray with all the elements which has the minimum value returned by valueFn
   */
  minBy(valueFn: (value: T) => any, thisArg?: any): Sparray<T> {
    if (this.isEmpty())
      return empty()

    valueFn.bind(thisArg || this)

    const minValue = this.map(valueFn).min()
    return this.filter(a => valueFn(a) === minValue)
  }

  /**
   * Returns the max value of the sparray
   */
  max(): T | undefined {
    if (this.isEmpty())
      return undefined

    return this._data.reduce((a, b) => a > b ? a : b)
  }

  /**
   * Returns a sparray with all the elements which have the maximum value returned by valueFn
   */
  maxBy(valueFn: (value: T) => any, thisArg?: any): Sparray<T> {
    if (this.isEmpty())
      return empty()

    valueFn.bind(thisArg || this)

    const maxValue = this.map(valueFn).max()
    return this.filter(a => valueFn(a) === maxValue)
  }

  /**
   * Indexes the elements by a key. The result will be an object where the keys are provided by keyFn and the values are the own elements.
   * If there are duplicate keys, the last element that generated that key will be preserved.
   * @see groupBy
   * @param keyFn - function to provide a key by element
   * @param thisArg - object to be used as this inside keyFn
   */
  indexBy(keyFn: (value: T) => string): { [key: string]: T }
  indexBy<R>(keyFn: (value: T) => string, valuesFn?: (value: T, key: string) => R, thisArg?: any): { [key: string]: R }
  indexBy(keyFn: (value: T) => string, valuesFn?: (value: T, key: string) => any, thisArg?: any): { [key: string]: any } {
    keyFn.bind(thisArg || this)

    const result = this._data.reduce((a, b) => {
      const key = keyFn(b)
      a[key] = (valuesFn || (a => a))(b, key)
      return a
    }, {} as { [key: string]: T; })

    Object.defineProperty(result, 'asSparray', {
      /* tslint:disable:completed-docs */
      get: (): Sparray<{ key: string, value: T }> => {
        return from(Object.keys(result))
          .map(k => ({ key: k as string, value: result[k as string] as T }))
      },
      /* tslint:enable:completed-docs */
      configurable: false,
      enumerable: false
    })

    return result
  }

  /**
   * Groups the elements by a key. The result will be an object where the keys are provided by keyFn and the values are grouped as sparrays.
   * It is possible to handle the grouped elements (as sparrays) by valuesFn
   * @see indexBy
   * @param keyFn  - function to provide a key by element
   * @param valuesFn - handle the sparray of the grouped elements for each key
   * @param thisArg - object to be used as this inside keyFn
   */
  groupBy(keyFn: (value: T) => string): { [key: string]: Sparray<T> }
  groupBy<R>(keyFn: (value: T) => string, valuesFn?: (values: Sparray<T>, key: string) => R, thisArg?: any): { [key: string]: R }
  groupBy(keyFn: (value: T) => string, valuesFn?: (values: Sparray<T>, key: string) => any, thisArg?: any): { [key: string]: any } {
    if (typeof valuesFn === 'undefined')
      valuesFn = (a, k) => a

    keyFn.bind(thisArg || this)
    valuesFn.bind(thisArg || this)

    const grouped = this._data.reduce((a, b) => {
      const key = keyFn(b);
      (a[key] = a[key] || []).push(b)
      return a
    }, {} as any)

    for (const p of Object.keys(grouped)) {
      grouped[p] = valuesFn(from(grouped[p]), p)
    }

    Object.defineProperty(grouped, 'asSparray', {
      /* tslint:disable:completed-docs */
      get: (): Sparray<{ key: string, values: Sparray<any> }> => {
        return from(Object.keys(grouped))
          .map(k => ({ key: k as string, values: grouped[k as string] }))
      },
      /* tslint:enable:completed-docs */
      configurable: false,
      enumerable: false
    })

    return grouped
  }

  /**
   * Returns true if the sparray is empty and false otherwise
   */
  isEmpty(): boolean {
    return this._data.length === 0
  }


  /**
   * Returns false if the sparray is empty and true otherwise
   */
  isNotEmpty(): boolean {
    return this._data.length > 0
  }

  /**
   * Partitions the sparray in batches of the provided size. The step determines the size of the step before generating each partition.
   * @param size - the size of the partition
   * @param step - the size of the step. By default is the same as the size of the partition.
   */
  sliding(size: number, step?: number): Sparray<Sparray<T>> {
    if (size < 1) throw new Error('Size must be a positive integer')

    if (typeof step === 'undefined') {
      step = size
    }

    if (step < 1) throw new Error('Step must be a positive integer')

    const partitions = []
    for (let i = 0; i - step + size < this._data.length; i += step) {
      partitions.push(this.slice(i, i + size))
    }

    return from(partitions)
  }

  /**
   * Return the first element of the sparray. If the param 'n' is provided, the first n elements as a new sparray are returned.
   * @param n - number of elements
   */
  first(): T
  first(n: number): Sparray<T>
  first(n?: number): T | Sparray<T> {
    if (typeof n === 'number') {
      return this.slice(0, n)
    } else {
      return this.get(0)
    }
  }

  /**
   * Return the last element of the sparray. If the param 'n' is provided, the last n elements as a new sparray are returned.
   * @param n - number of elements
   */
  last(): T
  last(n: number): Sparray<T>
  last(n?: number): T | Sparray<T> {
    if (typeof n === 'number') {
      return this.slice(-n)
    } else {
      return this.get(this.length - 1)
    }
  }

  /**
   * Maps each element to an object containing the index and the value
   */
  enumerate() {
    return this.map((value, index) => ({ index, value }))
  }

  /**
   * Create a new sparray zipping the source and any other sparray/array provided.
   * The size of the new sparray will be the size of the largest sparray/array
   * and each element of the new sparray will be a sparray containing the element
   * of i-th index from source and each provided sparray/array.
   *
   * @param toZip sparrays or arrays to zip
   */
  zip(...toZip: any[]): Sparray<Sparray<any>> {
    const size = toZip.filter(a => a.length).map(a => a.length).reduce((a, b) => Math.max(a, b), this.length)

    const data = []
    for (let i = 0; i < size; i++) {
      const element = [this.get(i)]
      for (const a of toZip) {
        if (isSparray(a)) {
          element.push(a.get(i))
        } else if (Array.isArray(a)) {
          element.push(a[i])
        } else {
          element.push(a)
        }
      }
      data.push(from(element))
    }
    return from(data)
  }

  /**
   * Sample data from the sparray. If n is not provided, a single element
   * will be returned, otherwise, a new sparray of size n will be returned.
   *
   * @param n - the number of sampled elements
   * @param withReplacement - determines if an element could be selected twice or more
   */
  sample(): T
  sample(n: number, withReplacement?: boolean): Sparray<T>
  sample(n?: number, withReplacement?: boolean): T | Sparray<T> {

    const random = (max: number) => Math.trunc(Math.random() * max)

    if (typeof n === 'undefined') {
      return this.get(random(this.length))
    } else {
      if (!withReplacement && n > this.length) {
        throw new Error('n cannot be greater than the length of sparray, if withReplacement=false')
      }

      const selected = []
      const all = this.toArray()
      for (let i = 0; i < n; i++) {
        const j = random(all.length)
        selected.push(all[j])
        if (!withReplacement) {
          all.splice(j, 1)
        }
      }
      return from(selected)
    }
  }

  /**
   * Builds a cartesian product from this and a second sparray/array. A combine function may be used to handle each pair combination.
   *
   * @param that - sparray or array to cross
   * @param combineFn - receive the objects from both sides to combine
   * @param thisArg - object to be used as this inside combineFn
   */
  cross<U>(that: Sparray<U> | U[], combineFn: (left: T, right: U) => any = (l, r) => [l, r], thisArg?: any): Sparray<any> {
    combineFn.bind(thisArg || this)

    const data = []
    for (const t1 of this) {
      for (const t2 of that) {
        data.push(combineFn(t1, t2))
      }
    }

    return from(data)
  }

}

export default { from, range, fillOf, empty, isSparray }
