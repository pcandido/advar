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
    return this._data;
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
   * Build a new sparray transforming the elements according to the mapFn function.
   * @param mapFn transformation function
   * @param thisArg object to be used as this inside mapFn
   */
  map(mapFn, thisArg) {
    if (typeof thisArg !== 'undefined')
      return from(this._data.map(mapFn, thisArg));
    else
      return from(this._data.map(mapFn));
  }

  /**
   * Aggregate the elements of sparray pair-by-pair, according to the reduceFn, 
   * accumulating the aggregation until last element.
   * @param reduceFn aggragation (reducer) function
   * @param initialValue to initialize the accumulated value
   * @param thisArg object to be used as this inside reduceFn
   */
  reduce(reduceFn, initialValue, thisArg) {
    if (typeof thisArg !== 'undefined')
      return this._data.reduce(reduceFn, initialValue, thisArg);
    else if (typeof initialValue !== 'undefined')
      return this._data.reduce(reduceFn, initialValue);
    else
      return this._data.reduce(reduceFn);
  }

  filter(filterFn, thisArg) {
    if (typeof thisArg !== 'undefined')
      return from(this._data.filter(filterFn, thisArg));
    else
      return from(this._data.filter(filterFn));
  }

  /**
   * Remove all the duplicates and create a new sparray of distinct values
   */
  distinct() {
    return fromSet(new Set(this._data));
  }

}

module.exports = {
  from, range, fillOf, fromSet
}