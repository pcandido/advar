const util = require('util');


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
const from = (...data) => {
  if (data.length === 0) {
    return new Sparray([]);
  } else if (data.length === 1) {
    data = data[0];
    if (Array.isArray(data)) {
      return new Sparray([...data]);
    } else if (data instanceof Sparray) {
      return new Sparray([...data._data]);
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
const range = (start, end, step) => {
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

  data = [];
  if (end < start) {
    for (let i = start; i > end; i += step) data.push(i);
  } else {
    for (let i = start; i < end; i += step) data.push(i);
  }
  return new Sparray(data);
}

/**
 * Builds a sparray of n static value elements.
 * @param n the desired length of the sparray
 * @param value the static value for all the elements
 */
const fillOf = (n, value) => {
  if (typeof n !== 'number') {
    throw new Error('Invalid number (n) of elements');
  }

  data = [];
  for (let i = 0; i < n; i++) {
    data.push(value);
  }

  return new Sparray(data);
}

/**
 * Builds a sparray from a set
 * 
 * @param set source of data
 */
const fromSet = (set) => {
  return new Sparray(Array.from(set))
}

/**
 * Determines if the obj is an instance of Sparray
 * @param obj obj to verify
 */
const isSparray = (obj) => {
  return obj instanceof Sparray;
}

class Sparray {

  _data;

  /**
   * Constructor of the Sparray. Receive an array as data.
   *
   * @param data an array with the elements
   */
  constructor(data) {
    if (!Array.isArray(data))
      throw new Error('Invalid data input');

    this._data = data;
  }

  /**
   * Returns the raw data as a native array
   */
  toArray() {
    return [...this._data];
  }

  /**
   * An node debugger/inspect representation for the Sparray. It will be the same of the raw data (array-like representation).
   */
  [util.inspect.custom](depth, opts) {
    return this._data;
  }

  _resolveIndex(index) {
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
  get(index) {
    return this._data[this._resolveIndex(index)];
  }

  /**
   * Returns a keys iteratior of the sparray.
   */
  keys() {
    return this._data.keys();
  }

  /**
   * Returns a values iteratior of the sparray.
   */
  values() {
    return this._data.values();
  }

  /**
   * Returns an entry iteratior of the sparray.
   */
  entries() {
    return this._data.entries();
  }

  /**
   * The number of elements of the sparray.
   */
  get length() {
    return this._data.length;
  }

  /*
   * Returns the number of elements of the sparray.
   */
  size() {
    return this.length;
  }

  /**
   * Counts the number of elements. If a filterFn is provided,only the filtered elements will be counted
   *
   * @param filterFn is an optional filter function to be applied during the count
   * @param thisArg object to be used as this inside filterFn
   */
  count(filterFn, thisArg) {
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
  map(mapFn, thisArg) {
    return from(this._data.map(mapFn, thisArg || this));
  }

  /**
   * Aggregate the elements of sparray pair-by-pair, according to the reduceFn, 
   * accumulating the aggregation until last element.
   * @param reduceFn aggragation (reducer) function
   * @param initialValue to initialize the accumulated value
   * @param thisArg object to be used as this inside reduceFn
   */
  reduce(reduceFn, initialValue, thisArg) {
    if (typeof initialValue !== 'undefined')
      return this._data.reduce(reduceFn, initialValue, thisArg || this);
    else
      return this._data.reduce(reduceFn);
  }

  /**
   * Aggregate the elements of sparray pair-by-pair, from the right to the left, according to the reduceFn, 
   * accumulating the aggregation until last element.
   * @param reduceFn aggragation (reducer) function
   * @param initialValue to initialize the accumulated value
   * @param thisArg object to be used as this inside reduceFn
   */
  reduceRight(reduceFn, initialValue, thisArg) {
    if (typeof initialValue !== 'undefined')
      return this._data.reduceRight(reduceFn, initialValue, thisArg || this);
    else
      return this._data.reduceRight(reduceFn);
  }

  /**
   * Builds a new sparray with only the selected elements by filterFn
   * @param filterFn 
   * @param thisArg 
   */
  filter(filterFn, thisArg) {
    return from(this._data.filter(filterFn, thisArg || this));
  }

  /**
   * Iterates over each element of array
   * @param forEachFn function to be executed over each element
   * @param thisArg object to be used as this in forEachFn
   */
  forEach(forEachFn, thisArg) {
    return this._data.forEach(forEachFn, thisArg || this);
  }

  /**
   * Build a new sparray by transforming the elements according to the mapFn function and flatten the result sparrays or arrays.
   * @param mapFn transformation function
   * @param thisArg object to be used as this inside mapFn
   */
  flatMap(mapFn, thisArg) {
    mapFn.bind(thisArg || this);

    let flatted = [];
    for (const i in this._data) {
      const mapped = mapFn(this._data[i], i, this);
      if (isSparray(mapped)) {
        flatted = flatted.concat(mapped._data);
      } else {
        flatted = flatted.concat(mapped);
      }
    }
    return from(flatted);
  }

  /**
   * Builds a new sparray flatting the nested sparrays and arrays to the main sparray
   * @param depth how depth the flatten will be applied
   */
  flatten(depth) {
    if (typeof depth === 'undefined') {
      depth = 1;
    }

    if (depth <= 0) {
      return this;
    }

    const res = from(this._data.reduce((a, b) => {
      if (b instanceof Sparray) b = b.toArray();
      return a.concat(b)
    }, []));

    return res.flatten(depth - 1);
  }

  /**
   * Remove all the duplicates and create a new sparray of distinct values
   */
  distinct() {
    return fromSet(new Set(this._data));
  }

  /**
   * Join the elements of the sparray in a string using the separator. The default separator is ','.
   * Separator can be a string or a function which returns a string. The function will receive as parameter
   * the index of separator from beggining and the index from end. Note the count of separators is the count
   * of elements minus one.
   * @param separator the string to be used to separate the elements
   * @param thisArg object to be used as this inside the function, if it is provided
   */
  join(separator, thisArg) {
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
  some(someFn, thisArg) {
    return this._data.some(someFn, thisArg || this);
  }

  /**
    * Returns true if every element produce the result true in the everyFn
    * @param everyFn condiction to be test, should return boolean
    * @param thisArg object to be used as this inside everyFn
    */
  every(everyFn, thisArg) {
    return this._data.every(everyFn, thisArg || this);
  }

  /**
   * Concats one or more sparrays, arrays or elements to the original sparray.
   * The result will be a new sparray.
   * @param toConcat sparrays, arrays or elements to concat
   */
  concat(...toConcat) {
    let data = this.toArray();
    for (const obj of toConcat) {
      if (isSparray(obj)) {
        data = data.concat(obj._data);
      } else if (Array.isArray(obj)) {
        data = data.concat(obj);
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
  find(findFn, thisArg) {
    return this._data.find(findFn, thisArg || this);
  }

  /**
   * Returns the index of the first element that satisfy the condiction of findFn, or -1 if no element satisfy
   * @param findFn condiction to be test, should return boolean
   * @param thisArg object to be used as this inside everyFn
   */
  findIndex(findFn, thisArg) {
    return this._data.findIndex(findFn, thisArg || this);
  }


  /**
   * Returns the first index of the element equals to the searchElement, or -1 if not found
   * @param searchElement value to search
   */
  indexOf(searchElement) {
    return this._data.indexOf(searchElement);
  }

  /**
   * Returns the last index of the element equals to the searchElement, or -1 if not found
   * @param searchElement value to search
   */
  lastIndexOf(searchElement) {
    return this._data.lastIndexOf(searchElement);
  }

  /**
   * Returns true if the sparray constains the value, and false otherwise
   * @param value value to search
   */
  includes(value) {
    return this._data.includes(value);
  }

  /**
   * Builds a new sparray with the reverse order
   */
  reverse() {
    return from(this.toArray().reverse());
  }

  /**
  * Builds a new sparray with the elements sorted by either a natural order or a custom sortFn
  * @param sortFn otional custom sort condition
  * @param thisArg object to be used as this inside sortFn
  */
  sort(sortFn, thisArg) {
    if (typeof sortFn !== 'undefined') {
      return from(this.toArray().sort(sortFn, thisArg));
    } else {
      return from(this.toArray().sort())
    }
  }

  /**
   * Builds a new sparray with the elements sliced from the original one. Negative indices could be used to backward indexing. The end index is optional.
   * @param startIndex 
   * @param endIndex 
   */
  slice(startIndex, endIndex) {
    if (typeof endIndex == 'undefined')
      return from(this._data.slice(this._resolveIndex(startIndex)))
    else
      return from(this._data.slice(this._resolveIndex(startIndex), this._resolveIndex(endIndex)));
  }

  /**
   * Returns the string representation of the sparray and its elements
   */
  toString() {
    return this._data.toString();
  }

  /**
   * Returns the string localized representation of the sparray and its elements
   */
  toLocaleString(locales, options) {
    return this._data.toLocaleString(locales, options);
  }

  /**
   * Returns true if all the elements of the array is numeric
   */
  isNumeric() {
    return this.every(a => typeof a === 'number');
  }

  /**
   * Sums all the elements of the sparray. If there is a non-numeric element, the return will be NaN
   */
  sum() {
    if (!this.isNumeric()) return NaN;
    return this.reduce((a, b) => a + b, 0);
  }

  /**
   * Calculates the average of all the elements of the sparray. If there is a non-numeric element, the return will be NaN
   */
  avg() {
    if (this.length === 0) return undefined;
    if (!this.isNumeric()) return NaN;
    return this.sum() / this.length;
  }

  /**
   * Indexes the elements by a key. The result is an object where the keys are providen by keyFn and the values are the own elements. 
   * If there are duplicate keys, the last element that generated that key will be preserved. 
   * @see groupBy
   * @param keyFn function to provide a key by element
   * @param thisArg object to be used as this inside keyFn
   */
  indexBy(keyFn, thisArg) {
    keyFn.bind(thisArg || this);
    return this._data.reduce((a, b) => {
      a[keyFn(b)] = b;
      return a;
    }, {});
  }

  /**
   * Groups the elements by a key. The result is an object where the keys are providen by keyFn and the values are grouped as a sparray.
   * It is possible to handle the groupd elements (as sparrays) by valuesFn
   * @see indexBy
   * @param keyFn function to provide a key by element
   * @param valuesFn handle the sparray of the grouped elements
   * @param thisArg object to be used as this inside keyFn
   */
  groupBy(keyFn, valuesFn, thisArg) {
    if (typeof valuesFn === 'undefined')
      valuesFn = a => a;

    keyFn.bind(thisArg || this);
    valuesFn.bind(thisArg || this);

    const grouped = this._data.reduce((a, b) => {
      const key = keyFn(b);
      (a[key] = a[key] || []).push(b);
      return a;
    }, {});

    for (const p of Object.keys(grouped)) {
      grouped[p] = valuesFn(from(grouped[p]));
    }

    return grouped;
  }

  /**
   * Returns true if the sparray is empty and false otherwise
   */
  isEmpty() {
    return this._data.length === 0;
  }


  /**
   * Returns false if the sparray is empty and true otherwise
   */
  isNotEmpty() {
    return this._data.length > 0;
  }

  /**
   * Partitions the sparray in batches of size. If step is providen, it determines the step to the next batch.
   * @param size the size of partition
   * @param step how many steps to the next partition, by default is the same of size
   */
  sliding(size, step) {
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
   * Builds a new sparray with the same elements
   */
  clone() {
    return from([...this._data]);
  }

  /**
   * Return the first element, and if the 'n' param is provided, return the first n elements as a new sparray
   * @param n [optional] number of elements
   */
  first(n) {
    if (typeof n === 'undefined') {
      return this.get(0);
    } else {
      return this.slice(0, n);
    }
  }

}

module.exports = {
  from, range, fillOf, fromSet, isSparray
}