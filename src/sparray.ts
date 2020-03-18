/**
   * Builds a Sparray from several ways:
   * 1) with no param for an empty array
   * 2) with a single non-array-like element for an array of one element
   * 3) with a single array-like element for a copy of this array
   * 4) with a single Sparray object for a copy of this Sparray
   * 5) with multiple params for a multi-element array
   *
   * @param data is the elements to build an Sparray
   */
export function from<T>(...data: any): Sparray<T> {
  if (data.length === 0) {
    return new Sparray([]);
  } else if (data.length === 1) {
    data = data[0];
    if (Array.isArray(data)) {
      return new Sparray(data);
    } else if (data instanceof Set) {
      return new Sparray(Array.from(data));
    } else if (data instanceof Sparray) {
      return new Sparray(data._data);
    } else {
      return new Sparray([data]);
    }
  } else {
    return new Sparray(data);
  }
}

/**
 * Builds a Sparray from a range. It can be used on several ways:
 * 1) with one param, the range iterates 1-by-1 from 0 (inclusive) to the value of param (exclusive)
 * 2) with two params, the range iterates 1-by-1 from the first param (inclusive) to the second param (exclusive)
 * 3) with three params, the range iterates by the value of the third param, from the value of the first param (inclusive) to the value of the second param (exclusive)
 *
 * @param start of range (inclusive)
 * @param end of range (exclusive)
 * @param step the size of increment
 */
export function range(start: number, end?: number, step?: number): Sparray<number> {
  if (typeof start === 'undefined') {
    throw new Error('No param was supplied');
  }

  if (typeof end === 'undefined') {
    end = start;
    start = 0;
  }

  if (typeof step === 'undefined') {
    step = end < start ? -1 : 1;
  }

  if ((end < start && step >= 0) || (start < end && step <= 0)) {
    throw new Error(`Invalid step ${step}`);
  }

  const data = [];
  if (end < start) {
    for (let i = start; i > end; i += step) data.push(i);
  } else {
    for (let i = start; i < end; i += step) data.push(i);
  }
  return new Sparray<number>(data);
}

/**
 * Builds a sparray of n static value elements.
 * @param n the desired length of the sparray
 * @param value the static value for all the elements
 */
export function fillOf<T>(n: number, value: T): Sparray<T> {
  if (typeof n !== 'number') {
    throw new Error('Invalid number (n) of elements');
  }

  const data = [];
  for (let i = 0; i < n; i++) {
    data.push(value);
  }

  return new Sparray<T>(data);
}

/**
 * Builds an empty sparray
 */
export function empty(): Sparray<any> {
  return new Sparray([])
}

/**
 * Determines if the obj is an instance of Sparray
 * @param obj obj to verify
 */
export function isSparray(obj: any): boolean {
  return obj instanceof Sparray;
}

class Sparray<T>  {

  _data: T[];

  /**
   * Constructor of the Sparray. Receive an array as data.
   *
   * @param data an array with the elements
   */
  constructor(data: T[]) {
    if (!Array.isArray(data))
      throw new Error('Invalid data input');

    this._data = data;
  }

  /**
   * Returns the raw data as a native array
   */
  toArray(): T[] {
    return [...this._data];
  }

  /**
   * An node debugger/inspect representation for the Sparray. It will be the same of the raw data (array-like representation).
   */
  /*
  //TODO: verify how to include this withou break browser version
  import util from 'util';
  [util.inspect.custom](depth: any, opts: any): any {
    return this._data;
  }
  */

  private _resolveIndex(index: number): number {
    if (index < 0)
      return this.length + index;
    else
      return index;
  }

  /**
   * Gets an element from Sparray by index. Negative indices will get elements backwards. Out of bound indices will return undefined.
   *
   * @param index is the position from where the element should be gotten
   */
  get(index: number): T {
    return this._data[this._resolveIndex(index)];
  }

  /**
   * Returns a keys iteratior of the sparray.
   */
  keys(): IterableIterator<number> {
    return this._data.keys();
  }

  /**
   * Returns a values iteratior of the sparray.
   */
  values(): IterableIterator<T> {
    return this._data.values();
  }

  /**
   * Returns a values iteratior of the sparray.
   */
  [Symbol.iterator]() {
    return this.values()
  }

  /**
   * Returns an entry iteratior of the sparray.
   */
  entries(): IterableIterator<[number, T]> {
    return this._data.entries();
  }

  /**
   * The number of elements of the sparray.
   */
  get length(): number {
    return this._data.length;
  }

  /*
   * Returns the number of elements of the sparray.
   */
  size(): number {
    return this.length;
  }

  /**
   * Counts the number of elements. If a filterFn is provided,only the filtered elements will be counted
   *
   * @param filterFn is an optional filter function to be applied during the count
   * @param thisArg object to be used as this inside filterFn
   */
  count(filterFn: (value: T, index: number, sparray: Sparray<T>) => boolean, thisArg?: any): number {
    if (!filterFn) return this.length;

    filterFn.bind(thisArg || this);

    let c = 0;
    for (let i = 0; i < this.length; i++) {
      if (filterFn(this.get(i), i, this))
        c++;
    }

    return c;
  }

  /**
   * Build a new sparray by transforming the elements according to the mapFn function.
   * @param mapFn transformation function
   * @param thisArg object to be used as this inside mapFn
   */
  map<U>(mapFn: (value: T, index: number, sparray: Sparray<T>) => U, thisArg?: any): Sparray<U> {
    mapFn.bind(thisArg || this);

    const mapped: U[] = [];
    for (let i = 0; i < this.length; i++) {
      mapped[i] = mapFn(this.get(i), i, this);
    }

    return from(mapped);
  }

  /**
   * Aggregate the elements of sparray pair-by-pair, according to the reduceFn, 
   * accumulating the aggregation until last element.
   * @param reduceFn aggragation (reducer) function
   * @param initialValue to initialize the accumulated value
   * @param thisArg object to be used as this inside reduceFn
   */
  reduce<U>(reduceFn: (previousValue: U | T, currentValue: T, currentIndex: number, sparray: Sparray<T>) => U, initialValue?: U, thisArg?: any): U | T {
    if (this.length === 0 && (typeof initialValue === 'undefined')) {
      throw 'Reduce of empty sparray with no initial value';
    }

    reduceFn.bind(thisArg || this);

    let i: number, prev: U | T;
    if (typeof initialValue === 'undefined') {
      i = 1;
      prev = this.get(0);
    } else {
      i = 0;
      prev = initialValue;
    }

    for (; i < this.length; i++) {
      prev = reduceFn(prev, this.get(i), i, this);
    }

    return prev;
  }

  /**
   * Aggregate the elements of sparray pair-by-pair, from the right to the left, according to the reduceFn, 
   * accumulating the aggregation until last element.
   * @param reduceFn aggragation (reducer) function
   * @param initialValue to initialize the accumulated value
   * @param thisArg object to be used as this inside reduceFn
   */
  reduceRight<U>(reduceFn: (previousValue: U | T, currentValue: T, currentIndex: number, sparray: Sparray<T>) => U, initialValue?: U, thisArg?: any): U | T {
    if (this.length === 0 && (typeof initialValue === 'undefined')) {
      throw 'Reduce of empty sparray with no initial value';
    }

    reduceFn.bind(thisArg || this);

    let i: number, prev: U | T;
    if (typeof initialValue === 'undefined') {
      i = this._resolveIndex(-2);
      prev = this.get(-1);
    } else {
      i = this._resolveIndex(-1);
      prev = initialValue;
    }

    for (; i >= 0; i--) {
      prev = reduceFn(prev, this.get(i), i, this);
    }

    return prev;
  }

  /**
   * Builds a new sparray with only the selected elements by filterFn
   * @param filterFn 
   * @param thisArg 
   */
  filter(filterFn: (value: T, index: number, sparray: Sparray<T>) => boolean, thisArg?: any): Sparray<T> {
    filterFn.bind(thisArg || this);

    const filtered: T[] = [];
    for (const [i, a] of this.entries()) {
      if (filterFn(a, i, this)) {
        filtered.push(a);
      }
    }

    return from(filtered);
  }

  /**
   * Iterates over each element of array
   * @param forEachFn function to be executed over each element
   * @param thisArg object to be used as this in forEachFn
   */
  forEach(forEachFn: (value: T, index: number, sparray: Sparray<T>) => void, thisArg?: any): Sparray<T> {
    forEachFn.bind(thisArg || this);

    for (const [i, a] of this.entries()) {
      forEachFn(a, i, this);
    }

    return this;
  }

  /**
   * Build a new sparray by transforming the elements according to the mapFn function and flatten the result sparrays or arrays.
   * @param mapFn transformation function
   * @param thisArg object to be used as this inside mapFn
   */
  flatMap<U>(mapFn: (value: T, index: number, sparray: Sparray<T>) => U[] | Sparray<U>, thisArg?: any): Sparray<U> {
    mapFn.bind(thisArg || this);

    const flatted: U[] = [];
    for (const [i, a] of this.entries()) {
      const mapped = mapFn(a, i, this);
      if (mapped != null) {
        if (isSparray(mapped)) {
          flatted.push(...((mapped as Sparray<U>)._data));
        } else {
          flatted.push(...(mapped as U[]));
        }
      }
    }
    return from(flatted);
  }

  /**
   * Builds a new sparray flatting the nested sparrays and arrays to the main sparray
   * @param depth how depth the flatten will be applied
   */
  flatten(depth: number): Sparray<any> {
    if (typeof depth === 'undefined') {
      depth = 1;
    }

    if (depth <= 0) {
      return this;
    }

    const res = from(this._data.reduce((a: any[], b) => {
      if (b instanceof Sparray) {
        return a.concat(b.toArray())
      }
      return a.concat(b)
    }, []));

    return res.flatten(depth - 1);
  }

  /**
   * Remove all the duplicates and create a new sparray of distinct values
   */
  distinct(): Sparray<T> {
    return from(new Set(this._data));
  }

  /**
   * Join the elements of the sparray in a string using the separator. The default separator is ','.
   * Separator can be a string or a function which returns a string. The function will receive as parameter
   * the index of separator from beggining and the index from end. Note the count of separators is the count
   * of elements minus one.
   * @param separator the string to be used to separate the elements
   * @param thisArg object to be used as this inside the function, if it is provided
   */
  join(separator: (indexFromStart: number, indexFromEnd: number) => string | string, thisArg?: any): string {
    if (typeof separator === 'string') {
      return this._data.join(separator);
    } else if (typeof separator === 'function') {
      separator.bind(thisArg || this);
      const sepCount = this.length - 1;

      let res = '';
      this._data.forEach((a, i) => {
        if (i > 0) {
          res += separator(i - 1, sepCount - i)
        }
        res += a;
      });

      return res;
    } else {
      return this._data.join();
    }
  }

  /**
   * Returns true if some element produce the result true in the someFn
   * @param someFn condiction to be test, should return boolean
   * @param thisArg object to be used as this inside someFn
   */
  some(someFn: (value: T, index: number, sparray: Sparray<T>) => boolean, thisArg?: any): boolean {
    someFn.bind(thisArg || this);

    for (const [i, a] of this.entries()) {
      if (someFn(a, i, this)) return true;
    }

    return false;
  }

  /**
    * Returns true if every element produce the result true in the everyFn
    * @param everyFn condiction to be test, should return boolean
    * @param thisArg object to be used as this inside everyFn
    */
  every(everyFn: (value: T, index: number, sparray: Sparray<T>) => boolean, thisArg?: any): boolean {
    everyFn.bind(thisArg || this);

    for (const [i, a] of this.entries()) {
      if (!everyFn(a, i, this)) return false;
    }

    return true;
  }

  /**
   * Concats one or more sparrays, arrays or elements to the original sparray.
   * The result will be a new sparray.
   * @param toConcat sparrays, arrays or elements to concat
   */
  concat(...toConcat: any): Sparray<T> {
    let data = this.toArray();
    for (const obj of toConcat) {
      if (isSparray(obj)) {
        data.push(...obj._data);
      } else if (Array.isArray(obj)) {
        data.push(...obj);
      } else {
        data.push(obj);
      }
    }

    return from(data);
  }

  /**
   * Returns the first element that satisfy the condiction of findFn, or undefined if no element satisfy
   * @param findFn condiction to be test, should return boolean
   * @param thisArg object to be used as this inside everyFn
   */
  find(filterFn: (value: T, index: number, sparray: Sparray<T>) => boolean, thisArg?: any): T | undefined {
    filterFn.bind(thisArg || this);

    const filtered: T[] = [];
    for (const [i, a] of this.entries()) {
      if (filterFn(a, i, this)) {
        return a;
      }
    }

    return undefined;
  }

  /**
   * Returns the index of the first element that satisfy the condiction of findFn, or -1 if no element satisfy
   * @param findFn condiction to be test, should return boolean
   * @param thisArg object to be used as this inside everyFn
   */
  findIndex(findFn: (value: T, index: number, sparray: Sparray<T>) => boolean, thisArg?: any): number {
    findFn.bind(thisArg || this);

    for (const [i, a] of this.entries()) {
      if (findFn(a, i, this)) {
        return i;
      }
    }

    return -1;
  }


  /**
   * Returns the first index of the element equals to the searchElement, or -1 if not found
   * @param searchElement value to search
   */
  indexOf(searchElement: T): number {
    return this._data.indexOf(searchElement);
  }

  /**
   * Returns the last index of the element equals to the searchElement, or -1 if not found
   * @param searchElement value to search
   */
  lastIndexOf(searchElement: T): number {
    return this._data.lastIndexOf(searchElement);
  }

  /**
   * Returns true if the sparray constains the value, and false otherwise
   * @param value value to search
   */
  includes(value: T): boolean {
    return this._data.includes(value);
  }

  /**
   * Returns true if the sparray constains all the values, and false otherwise
   * @param value values to search
   */
  includesAll(values: any): boolean {
    if (isSparray(values))
      values = (values as Sparray<T>).toArray();

    if (!Array.isArray(values)) {
      return this.includes(values as T)
    }

    return values.every(a => this._data.includes(a));
  }

  /**
   * Builds a new sparray with the reverse order
   */
  reverse(): Sparray<T> {
    return from(this.toArray().reverse());
  }

  /**
  * Builds a new sparray with the elements sorted by either a natural order or a custom sortFn
  * @param sortFn otional custom sort condition
  * @param thisArg object to be used as this inside sortFn
  */
  sort(sortFn: (a: T, b: T) => number, thisArg?: any): Sparray<T> {
    if (typeof sortFn === 'undefined') {
      return from(this.toArray().sort())
    } else {
      sortFn.bind(thisArg || this);
      return from(this.toArray().sort(sortFn));
    }
  }

  /**
   * Builds a new sparray with the elements sorted by the criteria provided by keyFn
   * @param keyFn get key from object
   * @param thisArg object to be used as this inside sortFn
   */
  sortBy<U>(keyFn: (value: T) => any, reverse: boolean, thisArg?: any) {
    keyFn.bind(thisArg || this);

    return from(this._data.sort((a, b) => {
      let keysA = keyFn(a);
      let keysB = keyFn(b);

      if (isSparray(keysA)) keysA = (keysA as Sparray<U>).toArray();
      if (isSparray(keysB)) keysB = (keysB as Sparray<U>).toArray();

      if (!Array.isArray(keysA)) keysA = [keysA];
      if (!Array.isArray(keysB)) keysB = [keysB];

      for (let i = 0; i < Math.min(keysA.length, keysB.length); i++) {
        if (keysA[i] < keysB[i]) return reverse ? 1 : -1;
        if (keysA[i] > keysB[i]) return reverse ? -1 : 1;
      }

      return 0;
    }))
  }

  /**
   * Builds a new sparray with the elements sliced from the original one. Negative indices could be used to backward indexing. The end index is optional.
   * @param startIndex 
   * @param endIndex 
   */
  slice(startIndex: number, endIndex?: number): Sparray<T> {
    if (typeof endIndex == 'undefined')
      return from(this._data.slice(this._resolveIndex(startIndex)))
    else
      return from(this._data.slice(this._resolveIndex(startIndex), this._resolveIndex(endIndex)));
  }

  /**
   * Returns the string representation of the sparray and its elements
   */
  toString(): string {
    return this._data.toString();
  }

  /**
   * Returns true if all the elements of the array is numeric
   */
  toNumeric(): Sparray<number> {
    return this.map(a => {
      if (typeof a === 'number')
        return a
      else
        return NaN
    });
  }

  /**
   * Sums all the elements of the sparray. If there is a non-numeric element, the return will be NaN
   */
  sum(): number {
    return this.toNumeric().reduce((a, b) => a + b, 0);
  }

  /**
   * Calculates the average of all the elements of the sparray. If there is a non-numeric element, the return will be NaN
   */
  avg(): number {
    if (this.isEmpty())
      return NaN;

    return this.sum() / this.length;
  }

  /**
   * Returns the min value of the sparray
   */
  min(): T | undefined {
    if (this.isEmpty())
      return undefined;

    return this._data.reduce((a, b) => a < b ? a : b);
  }

  /**
   * Returns a sparray with all the elements which has the minimum value returned by valueFn
   */
  minBy(valueFn: (value: T) => any, thisArg?: any): Sparray<T> {
    if (this.isEmpty())
      return empty();

    valueFn.bind(thisArg || this);

    const minValue = this.map(valueFn).min();
    return this.filter(a => valueFn(a) === minValue);
  }

  /**
   * Returns the max value of the sparray
   */
  max(): T | undefined {
    if (this.isEmpty())
      return undefined;

    return this._data.reduce((a, b) => a > b ? a : b);
  }

  /**
   * Returns a sparray with all the elements which has the maximum value returned by valueFn
   */
  maxBy(valueFn: (value: T) => any, thisArg?: any): Sparray<T> {
    if (this.isEmpty())
      return empty();

    valueFn.bind(thisArg || this);

    const maxValue = this.map(valueFn).max();
    return this.filter(a => valueFn(a) === maxValue);
  }

  /**
   * Indexes the elements by a key. The result is an object where the keys are providen by keyFn and the values are the own elements. 
   * If there are duplicate keys, the last element that generated that key will be preserved. 
   * @see groupBy
   * @param keyFn function to provide a key by element
   * @param thisArg object to be used as this inside keyFn
   */
  indexBy(keyFn: (value: T) => string, thisArg?: any): { [key: string]: T; } {
    keyFn.bind(thisArg || this);

    return this._data.reduce((a, b) => {
      a[keyFn(b)] = b;
      return a;
    }, {} as { [key: string]: T; });
  }

  /**
   * Groups the elements by a key. The result is an object where the keys are providen by keyFn and the values are grouped as a sparray.
   * It is possible to handle the groupd elements (as sparrays) by valuesFn
   * @see indexBy
   * @param keyFn function to provide a key by element
   * @param valuesFn handle the sparray of the grouped elements
   * @param thisArg object to be used as this inside keyFn
   */
  groupBy(keyFn: (value: T) => string, valuesFn: (values: Sparray<T>) => any, thisArg?: any): any {
    if (typeof valuesFn === 'undefined')
      valuesFn = a => a;

    keyFn.bind(thisArg || this);
    valuesFn.bind(thisArg || this);

    const grouped = this._data.reduce((a, b) => {
      const key = keyFn(b);
      (a[key] = a[key] || []).push(b);
      return a;
    }, {} as any);

    for (const p of Object.keys(grouped)) {
      grouped[p] = valuesFn(from(grouped[p]));
    }

    return grouped;
  }

  /**
   * Returns true if the sparray is empty and false otherwise
   */
  isEmpty(): boolean {
    return this._data.length === 0;
  }


  /**
   * Returns false if the sparray is empty and true otherwise
   */
  isNotEmpty(): boolean {
    return this._data.length > 0;
  }

  /**
   * Partitions the sparray in batches of size. If step is providen, it determines the step to the next batch.
   * @param size the size of partition
   * @param step how many steps to the next partition, by default is the same of size
   */
  sliding(size: number, step?: number): Sparray<Sparray<T>> {
    if (size < 1) throw new Error('Size must be a positive integer');

    if (typeof step === 'undefined') {
      step = size;
    }

    if (step < 1) throw new Error('Step must be a positive integer');

    const partitions = [];
    for (let i = 0; i - step + size < this._data.length; i += step) {
      partitions.push(this.slice(i, i + size));
    }

    return from(partitions);
  }

  /**
   * Return the first element, and if the 'n' param is provided, return the first n elements as a new sparray
   * @param n [optional] number of elements
   */
  first(n?: number): T | Sparray<T> {
    if (typeof n === 'undefined') {
      return this.get(0);
    } else {
      return this.slice(0, n);
    }
  }

  /**
  * Return the last element, and if the 'n' param is provided, return the last n elements as a new sparray
  * @param n [optional] number of elements
  */
  last(n?: number): T | Sparray<T> {
    if (typeof n === 'undefined') {
      return this.get(this.length - 1);
    } else {
      return this.slice(-n);
    }
  }

  /**
   * Maps each element to an object containing the index and the value
   */
  enumerate() {
    return this.map((value, index) => ({ index, value }));
  }

  zip(...toZip: any[]): Sparray<Sparray<any>> {
    const size = toZip.filter(a => a.length).map(a => a.length).reduce((a, b) => Math.max(a, b), this.length);

    const data = [];
    for (let i = 0; i < size; i++) {
      const element = [this.get(i)];
      for (const a of toZip) {
        if (isSparray(a)) {
          element.push(a.get(i));
        } else if (Array.isArray(a)) {
          element.push(a[i]);
        } else {
          element.push(a)
        }
      }
      data.push(from(element));
    }
    return from(data);
  }

  /**
   * Sample data from the sparray. If n is not provided, a single element will be returned, otherwise, a new sparray will be returned. 
   * @param n 
   * @param withReplacement 
   */
  sample(n?: number, withReplacement?: boolean): T | Sparray<T> {

    const random = (n: number) => Math.trunc(Math.random() * n);

    if (typeof n === 'undefined') {
      return this.get(random(this.length));
    } else {
      if (!withReplacement && n > this.length) {
        throw 'n cannot be greater than the length of sparray, if withReplacement=false';
      }

      let selected = [];
      let all = this.toArray();
      for (let i = 0; i < n; i++) {
        const j = random(all.length);
        selected.push(all[j]);
        if (!withReplacement) {
          all.splice(j, 1);
        }
      }
      return from(selected);
    }
  }

}