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

  /**
   * Gets an element from Sparray by index. Negative indices will get elements backwards. Out of bound indices will return undefined.
   *
   * @param index is the position from where the element should be gotten
   */
  get(index) {
    if (index < 0)
      index = this._data.length + index;

    return this._data[index];
  }

  /**
   * Returns an iteratior of the sparray.
   */
  values() {
    return this._data.values();
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
    if (typeof thisArg !== 'undefined')
      return from(this._data.map(mapFn, thisArg)).flatten(1);
    else
      return from(this._data.map(mapFn)).flatten(1);
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
    let data = [...this._data];
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
   * Returns the first element that satisfy the condiction of findFn
   * @param findFn condiction to be test, should return boolean
   * @param thisArg object to be used as this inside everyFn
   */
  find(findFn, thisArg) {
    return this._data.find(findFn, thisArg || this);
  }

  /**
   * Returns the index of the first element that satisfy the condiction of findFn
   * @param findFn condiction to be test, should return boolean
   * @param thisArg object to be used as this inside everyFn
   */
  findIndex(findFn, thisArg) {
    return this._data.findIndex(findFn, thisArg || this);
  }


}

module.exports = {
  from, range, fillOf, fromSet, isSparray
}