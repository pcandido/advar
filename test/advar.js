const assert = require('assert');
const { advar } = require('../src/advar');

describe('advar', () => {

  describe('toArray', () => {

    it('should return the raw stored data', () => {
      const a = new advar();
      a._data = [1, 2, 3];  //hard-coded to assert toArray without depends to the constructor
      assert.deepEqual(a.toArray(), [1, 2, 3]);
    });

  });

});
