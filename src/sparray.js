const util = require('util');

class List {

  _data;

  /**
   * Constructor of the list. Receive an array as data.
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
   * An node debugger/inspect representation for the list. It will be the same of the raw data (array-like representation).
   */
  [util.inspect.custom](depth, opts) {
    return this._data;
  }

  /**
   * Gets an element from list by index. Negative indices will get elements backwards. Out of bound indices will return undefined.
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
  values(){
    return this._data.values();
  }

  /**
   * The number of elements of the sparray.
   */
  get length(){
    return this._data.length;
  }

  /*
   * Returns the number of elements of the sparray.
   */ 
  size(){
    return this.length;
  }

  /**
   * Counts the number of elements. If a filterFn is provided,only the filtered elements will be counted
   *
   * @param filterFn is an optional filter function to be applied during the count
   * @param thisArg object to be used as this inside filterFn
   */
  count(filterFn, thisArg){
    if(!filterFn) return this.length;

    filterFn.bind(thisArg || this);

    let c = 0;
    for(let i = 0; i < this.length; i++){
      if(filterFn(this.get(i), i, this))
        c++;
    }

    return c;    
  }

}

/**
   * Builds a list from several ways:
   * 1) with no param for an empty array
   * 2) with a single non-array-like element for an array of one element
   * 3) with a single array-like element for a copy of this array
   * 4) with a single list object for a copy of this list
   * 5) with multiple params for a multi-element array
   *
   * @param data is the elements to build an list
   */
exports.of = (...data) => {
  if (data.length === 0) {
    return new List([]);
  } else if (data.length === 1) {
    data = data[0];
    if (Array.isArray(data)) {
      return new List([...data]);
    } else if (data instanceof List) {
      return new List([...data._data]);
    } else {
      return new List([data]);
    }
  } else {
    return new List(data);
  }
}

/**
 * Builds a list from a range. It can be used on several ways:
 * 1) with one param, the range iterates 1-by-1 from 0 (inclusive) to the value of param (exclusive)
 * 2) with two params, the range iterates 1-by-1 from the first param (inclusive) to the second param (exclusive)
 * 3) with three params, the range iterates by the value of the third param, from the value of the first param (inclusive) to the value of the second param (exclusive)
 *
 * @param start of range (inclusive)
 * @param end of range (exclusive)
 * @param step the size of increment
 */
exports.range = (start, end, step) => {
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
  return new List(data);
}

/**
 * Creates an sparray of n static value elements.
 * @param n the desired length of the sparray
 * @param value the static value for all the elements
 */
exports.fillOf = (n, value) => {
  if(typeof n !== 'number'){
    throw new Error('Invalid number (n) of elements');
  }

  data = [];
  for(let i = 0; i < n; i++){
    data.push(value);
  }

  return new List(data);
}
