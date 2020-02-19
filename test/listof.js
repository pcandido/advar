const assert = require('assert');
const listof = require('../src/listof');

const eq = assert.equal;
const deq = assert.deepEqual;
const seq = assert.strictEqual;

describe('listof', () => {

  describe('of', () => {

    it('should be called with no parameters', () => {
      deq(listof.of().toArray(), []);
    });

    it('should accpet a single non-array-like element', () => {
      deq(listof.of(1).toArray(), [1]);
      deq(listof.of('a').toArray(), ['a']);
      deq(listof.of({ a: 1 }).toArray(), [{ a: 1 }]);
      deq(listof.of(true).toArray(), [true]);
    });

    it('should accept a single array-like element', () => {
      deq(listof.of([]).toArray(), []);
      deq(listof.of([1]).toArray(), [1]);
      deq(listof.of(['a']).toArray(), ['a']);
      deq(listof.of([{ a: 1 }]).toArray(), [{ a: 1 }]);
      deq(listof.of([1, 2, 3]).toArray(), [1, 2, 3]);
      deq(listof.of(['a', 1, false]).toArray(), ['a', 1, false]);
    });

    it('should accept a single list to be cloned', () => {
      deq(listof.of(listof.of()).toArray(), []);
      deq(listof.of(listof.of([1, 2, 3])).toArray(), [1, 2, 3]);
    });

    it('should accpet multiple elements', () => {
      deq(listof.of(1, 2, 3).toArray(), [1, 2, 3]);
      deq(listof.of([1], 2, '3', { a: 4 }).toArray(), [[1], 2, '3', { a: 4 }]);
      deq(listof.of([], []).toArray(), [[], []]);
    });

  });

  describe('range', () => {

    it('should throws an exception if no param is provided', () => {
      assert.throws(() => { listof.range() }, Error);
    })

    it('should build a list with 1 param', () => {
      deq(listof.range(0).toArray(), []);
      deq(listof.range(3).toArray(), [0, 1, 2]);
      deq(listof.range(-3).toArray(), [0, -1, -2]);
    });

    it('should build a list with 2 params', () => {
      deq(listof.range(3, 3).toArray(), []);
      deq(listof.range(0, 3).toArray(), [0, 1, 2]);
      deq(listof.range(3, 6).toArray(), [3, 4, 5]);
      deq(listof.range(-3, 3).toArray(), [-3, -2, -1, 0, 1, 2]);
      deq(listof.range(3, -3).toArray(), [3, 2, 1, 0, -1, -2]);
    });

    it('should build a list with 3 params', () => {
      deq(listof.range(5, 10, 1).toArray(), [5, 6, 7, 8, 9]);
      deq(listof.range(5, 10, 2).toArray(), [5, 7, 9]);
      deq(listof.range(5, 11, 2).toArray(), [5, 7, 9]);
      deq(listof.range(11, 5, -2).toArray(), [11, 9, 7]);
      assert.throws(() => { listof.range(5, 10, -1) }, Error);
      assert.throws(() => { listof.range(10, 5, 1) }, Error);
    });

  });

});

describe('List', () => {

  describe('toArray', () => {

    it('should return the raw stored data', () => {
      const a = listof.of();
      a._data = [1, 2, 3];  //hard-coded to assert toArray without depends to the constructor
      deq(a.toArray(), [1, 2, 3]);
    });

  });

  describe('get', () => {

    it('should return an element by index', () => {
      const ad = listof.of(1, 2, 3);
      eq(ad.get(1), 2);
      eq(ad.get(0), 1);
    });

    it('should return elements backwards for negative indices', () => {
      const ad = listof.of(1, 2, 3);
      eq(ad.get(-1), 3);
      eq(ad.get(-2), 2);
    });

    it('should return undefined for out of bound indices', () => {
      seq(listof.of(1, 2, 3).get(5), undefined);
      seq(listof.of(1, 2, 3).get(-5), undefined);
    });
  });

});
