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

    it('should build an array from 0 to n (exclusive) for a given n param', () => {
      deq(sparray.range(0).toArray(), []);
      deq(sparray.range(3).toArray(), [0, 1, 2]);
      deq(sparray.range(-3).toArray(), [0, -1, -2]);
    });

    it('should build an array from n to m (exclusive) for a given n and m params', () => {
      deq(sparray.range(3, 3).toArray(), []);
      deq(sparray.range(0, 3).toArray(), [0, 1, 2]);
      deq(sparray.range(3, 6).toArray(), [3, 4, 5]);
      deq(sparray.range(-3, 3).toArray(), [-3, -2, -1, 0, 1, 2]);
      deq(sparray.range(3, -3).toArray(), [3, 2, 1, 0, -1, -2]);
    });

    it('should build an array from n to m (exclusive), incremented by i for a given n, m and i params', () => {
      deq(sparray.range(5, 10, 1).toArray(), [5, 6, 7, 8, 9]);
      deq(sparray.range(5, 10, 2).toArray(), [5, 7, 9]);
      deq(sparray.range(5, 11, 2).toArray(), [5, 7, 9]);
      deq(sparray.range(11, 5, -2).toArray(), [11, 9, 7]);
    });

    it('should throw an exception if the direction of range does not match the direction of increment', () => {
      assert.throws(() => { sparray.range(5, 10, -1) }, Error);
      assert.throws(() => { sparray.range(10, 5, 1) }, Error);
    });

  });

  describe('fillOf(n, value)', () => {

    it('should generate a sparray of "n" "value" elements', () => {
      deq(sparray.fillOf(3,1).toArray(), [1,1,1]);
      deq(sparray.fillOf(3).toArray(), [undefined, undefined, undefined]);
      deq(sparray.fillOf(1,1).toArray(), [1]);
      deq(sparray.fillOf(0,1).toArray(), []);
      deq(sparray.fillOf(-1,1).toArray(), []);
    });

    it('should throw an exception if n was not a number', () => {
      assert.throws(() => {sparray.fillOf('asdf',1)});
    });

  });

  describe('toArray()', () => {

    it('should return the raw stored data', () => {
      const a = sparray.of();
      a._data = [1, 2, 3];  //hard-coded to assert toArray without depends to the constructor
      deq(a.toArray(), [1, 2, 3]);
    });

  });

  describe('get(i)', () => {

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

  describe('values()', () => {

    it('should return an iterator', () => {
      const sp = sparray.of(1,2,3,4,5);
      const ir = sp.values();
      eq(ir.next().value, 1);
      eq(ir.next().value, 2);
      eq(ir.next().done, false);
    });

  });

  describe('length', () => {

    it('should return the size of the sparray', () => {
      eq(sparray.of().length, 0);
      eq(sparray.of(1,2,3).length, 3);
      eq(sparray.of([1,2,3]).length, 3);
    });

  });

  describe('size()', () => {

    it('should return the size of the sparray', () => {
      eq(sparray.of().size(), 0);
      eq(sparray.of(1,2,3).size(), 3);
      eq(sparray.of([1,2,3]).size(), 3);
    });

  });


  describe('count([filterFn[, thisArg]])', () => {

    it('should return the size of the sparray if no filterFn is provided', () => {
      eq(sparray.of().count(), 0);
      eq(sparray.of(1,2,3).count(), 3);
      eq(sparray.of([1,2,3]).count(), 3);
    });

    it('should count only filtered elements if a filterFn is provided', () => {
      eq(sparray.of(1,2,3,4).count(a => a%2), 2);
      eq(sparray.of(1,2,3,4).count(a => false), 0);
      eq(sparray.of(1,2,3,4).count(a => true), 4);
      eq(sparray.of(10,20,30,40).count((a,i) => a == 10), 1);
      eq(sparray.of(10,20,30,40).count((a,i) => i == 1), 1);
      eq(sparray.of(10,20,30,40).count((a,i,s) => s.get(i) == a), 4);
    });

  });

});
