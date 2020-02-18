const util = require('util');

class advar{

  _data;

  /**
   * Constructor of advar. It can be called in a several ways:
   * 1) with no param for an empty array
   * 2) with a single non-array-like element for an array of one element
   * 3) with a single array-like element for a copy of this array
   * 4) with a single advar object for a copy of this advar
   * 5) with multiple params for a multi-element array
   *
   * @param data is the elements to build an advar
   */
  constructor(...data){
    if(data.length === 0){
      this._data = [];
    } else if(data.length === 1) {
      data = data[0];
      if (Array.isArray(data)){
        this._data = [...data];
      } else if(data instanceof advar) {
        this._data = [...data._data];
      } else {
        this._data = [data];
      }
    } else {
      this._data = data;
    }
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

}

module.exports = { advar }
