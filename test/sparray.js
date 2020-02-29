const assert = require('assert');
const sparray = require('../src/sparray');

const eq = assert.equal;
const deq = assert.deepEqual;
const seq = assert.strictEqual;

describe('sparray', () => {

  describe('of', () => {

    it('should be called with no parameters', () => {
      deq(sparray.of().toArray(), []);
    });

    it('should accpet a single non-array-like element', () => {
      deq(sparray.of(1).toArray(), [1]);
      deq(sparray.of('a').toArray(), ['a']);
      deq(sparray.of({ a: 1 }).toArray(), [{ a: 1 }]);
      deq(sparray.of(true).toArray(), [true]);
    });

    it('should accept a single array-like element', () => {
      deq(sparray.of([]).toArray(), []);
      deq(sparray.of([1]).toArray(), [1]);
      deq(sparray.of(['a']).toArray(), ['a']);
      deq(sparray.of([{ a: 1 }]).toArray(), [{ a: 1 }]);
      deq(sparray.of([1, 2, 3]).toArray(), [1, 2, 3]);
      deq(sparray.of(['a', 1, false]).toArray(), ['a', 1, false]);
    });

    it('should accept a single list to be cloned', () => {
      deq(sparray.of(sparray.of()).toArray(), []);
      deq(sparray.of(sparray.of([1, 2, 3])).toArray(), [1, 2, 3]);
    });

    it('should accpet multiple elements', () => {
      deq(sparray.of(1, 2, 3).toArray(), [1, 2, 3]);
      deq(sparray.of([1], 2, '3', { a: 4 }).toArray(), [[1], 2, '3', { a: 4 }]);
      deq(sparray.of([], []).toArray(), [[], []]);
    });

  });

  describe('range', () => {

    it('should throws an exception if no param is provided', () => {
      assert.throws(() => { sparray.range() }, Error);
    })

    it('should build a list with 1 param', () => {
      deq(sparray.range(0).toArray(), []);
      deq(sparray.range(3).toArray(), [0, 1, 2]);
      deq(sparray.range(-3).toArray(), [0, -1, -2]);
    });

    it('should build a list with 2 params', () => {
      deq(sparray.range(3, 3).toArray(), []);
      deq(sparray.range(0, 3).toArray(), [0, 1, 2]);
      deq(sparray.range(3, 6).toArray(), [3, 4, 5]);
      deq(sparray.range(-3, 3).toArray(), [-3, -2, -1, 0, 1, 2]);
      deq(sparray.range(3, -3).toArray(), [3, 2, 1, 0, -1, -2]);
    });

    it('should build a list with 3 params', () => {
      deq(sparray.range(5, 10, 1).toArray(), [5, 6, 7, 8, 9]);
      deq(sparray.range(5, 10, 2).toArray(), [5, 7, 9]);
      deq(sparray.range(5, 11, 2).toArray(), [5, 7, 9]);
      deq(sparray.range(11, 5, -2).toArray(), [11, 9, 7]);
      assert.throws(() => { sparray.range(5, 10, -1) }, Error);
      assert.throws(() => { sparray.range(10, 5, 1) }, Error);
    });

  });

});

describe('List', () => {

  describe('toArray', () => {

    it('should return the raw stored data', () => {
      const a = sparray.of();
      a._data = [1, 2, 3];  //hard-coded to assert toArray without depends to the constructor
      deq(a.toArray(), [1, 2, 3]);
    });

  });

  describe('get', () => {

    it('should return an element by index', () => {
      const ad = sparray.of(1, 2, 3);
      eq(ad.get(1), 2);
      eq(ad.get(0), 1);
    });

    it('should return elements backwards for negative indices', () => {
      const ad = sparray.of(1, 2, 3);
      eq(ad.get(-1), 3);
      eq(ad.get(-2), 2);
    });

    it('should return undefined for out of bound indices', () => {
      seq(sparray.of(1, 2, 3).get(5), undefined);
      seq(sparray.of(1, 2, 3).get(-5), undefined);
    });
  });

});
