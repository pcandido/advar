const util = require('util');

class List{

  _data;

  /**
   * Constructor of the list. Receive an array as data.
   *
   * @param data an array with the elements
   */
  constructor(data){
    if(!Array.isArray(data))
      throw new Error('Invalid data input');

    this._data = data;
  }

  /**
   * Returns the raw data as a native array
   */
  toArray(){
    return this._data;
  }

  /**
   * An node debugger/inspect representation for the advar. It will be the same of the raw data (array-like representation).
   */
  [util.inspect.custom](depth, opts) {
    return this._data;
  }

  /**
   * Gets an element from advar by index. Negative indices will get elements backwards. Out of bound indices will return undefined.
   *
   * @param index is the position from where the element should be gotten
   */
  get(index){
    if(index < 0)
      index = this._data.length + index;

    return this._data[index];
  }

}

exports.array = (data) => new List(data);
