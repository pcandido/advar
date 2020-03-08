const assert = require('assert');
const sinon = require('sinon');
const sparray = require('../src/sparray');

const eq = assert.equal;
const deq = assert.deepEqual;
const seq = assert.strictEqual;

const testNative = (func, req, res, resCompare) => {
  const callback = sinon.spy();
  const stub = sinon.stub(Array.prototype, func).returns(res);
  const arr = sparray.from(req)[func](callback);
  eq(stub.calledOnce, true, 'The native method was not called');
  deq(arr, resCompare);
  stub.restore();
};

describe('sparray', () => {

  describe('from', () => {

    it('should be called with no parameters', () => {
      deq(sparray.from().toArray(), []);
    });

    it('should accpet a single non-array-like element', () => {
      deq(sparray.from(1).toArray(), [1]);
      deq(sparray.from('a').toArray(), ['a']);
      deq(sparray.from({ a: 1 }).toArray(), [{ a: 1 }]);
      deq(sparray.from(true).toArray(), [true]);
    });

    it('should accept a single array-like element', () => {
      deq(sparray.from([]).toArray(), []);
      deq(sparray.from([1]).toArray(), [1]);
      deq(sparray.from(['a']).toArray(), ['a']);
      deq(sparray.from([{ a: 1 }]).toArray(), [{ a: 1 }]);
      deq(sparray.from([1, 2, 3]).toArray(), [1, 2, 3]);
      deq(sparray.from(['a', 1, false]).toArray(), ['a', 1, false]);
    });

    it('should accept a single list to be cloned', () => {
      deq(sparray.from(sparray.from()).toArray(), []);
      deq(sparray.from(sparray.from([1, 2, 3])).toArray(), [1, 2, 3]);
    });

    it('should accpet multiple elements', () => {
      deq(sparray.from(1, 2, 3).toArray(), [1, 2, 3]);
      deq(sparray.from([1], 2, '3', { a: 4 }).toArray(), [[1], 2, '3', { a: 4 }]);
      deq(sparray.from([], []).toArray(), [[], []]);
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
      deq(sparray.fillOf(3, 1).toArray(), [1, 1, 1]);
      deq(sparray.fillOf(3).toArray(), [undefined, undefined, undefined]);
      deq(sparray.fillOf(1, 1).toArray(), [1]);
      deq(sparray.fillOf(0, 1).toArray(), []);
      deq(sparray.fillOf(-1, 1).toArray(), []);
    });

    it('should throw an exception if n was not a number', () => {
      assert.throws(() => { sparray.fillOf('asdf', 1) });
    });

  });

  describe('fromSet', () => {

    it('should build a sparray from set', () => {
      deq(sparray.fromSet(new Set([])).toArray(), []);
      deq(sparray.fromSet(new Set([1, 2, 3])).toArray(), [1, 2, 3]);
      deq(sparray.fromSet(new Set([1, 2, 3, 1, 2, 3])).toArray(), [1, 2, 3]);
    });

  });

  describe('isSparray()', () => {

    it('should return true for sparrays', () => {
      eq(sparray.isSparray(sparray.from(1, 2, 3)), true);
      eq(sparray.isSparray(sparray.range(3)), true);
    });

    it('should return false for non-sparrays', () => {
      eq(sparray.isSparray(1), false);
      eq(sparray.isSparray([1, 2, 3]), false);
    });

  });

  describe('toArray()', () => {

    it('should return the raw stored data', () => {
      const a = sparray.from();
      a._data = [1, 2, 3];  //hard-coded to assert toArray without depends to the constructor
      deq(a.toArray(), [1, 2, 3]);
    });

    it('changes on returned raw data should not impact the sparray', () => {
      const a = sparray.from(1, 2, 3);
      const b = a.toArray();
      b.push(4);
      deq(a.toArray(), [1, 2, 3]);
      deq(b, [1, 2, 3, 4]);
    });

  });

  describe('get(i)', () => {

    it('should return an element by index', () => {
      const ad = sparray.from(1, 2, 3);
      eq(ad.get(1), 2);
      eq(ad.get(0), 1);
    });

    it('should return elements backwards for negative indices', () => {
      const ad = sparray.from(1, 2, 3);
      eq(ad.get(-1), 3);
      eq(ad.get(-2), 2);
    });

    it('should return undefined for out of bound indices', () => {
      seq(sparray.from(1, 2, 3).get(5), undefined);
      seq(sparray.from(1, 2, 3).get(-5), undefined);
    });
  });

  describe('values()', () => {

    it('should return an iterator', () => {
      const sp = sparray.from(1, 2, 3, 4, 5);
      const ir = sp.values();
      eq(ir.next().value, 1);
      eq(ir.next().value, 2);
      eq(ir.next().done, false);
    });

  });

  describe('length', () => {

    it('should return the size of the sparray', () => {
      eq(sparray.from().length, 0);
      eq(sparray.from(1, 2, 3).length, 3);
      eq(sparray.from([1, 2, 3]).length, 3);
    });

  });

  describe('size()', () => {

    it('should return the size of the sparray', () => {
      eq(sparray.from().size(), 0);
      eq(sparray.from(1, 2, 3).size(), 3);
      eq(sparray.from([1, 2, 3]).size(), 3);
    });

  });


  describe('count(filterFn, thisArg)', () => {

    it('should return the size of the sparray if no filterFn is provided', () => {
      eq(sparray.from().count(), 0);
      eq(sparray.from(1, 2, 3).count(), 3);
      eq(sparray.from([1, 2, 3]).count(), 3);
    });

    it('should count only filtered elements if a filterFn is provided', () => {
      eq(sparray.from(1, 2, 3, 4).count(a => a % 2), 2);
      eq(sparray.from(1, 2, 3, 4).count(a => false), 0);
      eq(sparray.from(1, 2, 3, 4).count(a => true), 4);
      eq(sparray.from(10, 20, 30, 40).count((a, i) => a == 10), 1);
      eq(sparray.from(10, 20, 30, 40).count((a, i) => i == 1), 1);
      eq(sparray.from(10, 20, 30, 40).count((a, i, s) => s.get(i) == a), 4);
    });

  });

  describe('distinct()', () => {

    it('should remove all duplicates', () => {
      deq(sparray.from().distinct().toArray(), []);
      deq(sparray.from(1).distinct().toArray(), [1]);
      deq(sparray.from(1, 2, 3).distinct().toArray(), [1, 2, 3]);
      deq(sparray.from(1, 1, 2, 2, 3, 3).distinct().toArray(), [1, 2, 3]);
      deq(sparray.from(1, 2, 3, 1, 2, 3).distinct().toArray(), [1, 2, 3]);
    });

  });

  describe('map(mapFn, thisArg)', () => {

    it('should call the native method', () => {
      testNative('map', [1, 2, 3], [1, 2, 3], sparray.from(1, 2, 3));
    });

    it('should transform the elements according to the function', () => {
      deq(sparray.from().map(a => a).toArray(), []);
      deq(sparray.from(1, 2, 3).map(a => a).toArray(), [1, 2, 3]);
      deq(sparray.from(1, 2, 3).map(a => a * 2).toArray(), [2, 4, 6]);
    });

  });

  describe('reduce(reduceFn, thisArg)', () => {

    it('should call the native method', () => {
      testNative('reduce', [1, 2, 3], 1, 1);
    });

    it('should reduce the elements according to the function', () => {
      eq(sparray.from(1, 2, 3).reduce((a, b) => a), 1);
      eq(sparray.from(1, 2, 3).reduce((a, b) => a + b, 5), 11);
      eq(sparray.from(120, 20, 2).reduce((a, b) => a / b), 3);
    });

    it('should throw exception if sparray is empty', () => {
      assert.throws(() => { sparray.from().reduce((a, b) => a + b) });
    });

  });

  describe('reduceRight(reduceFn, thisArg)', () => {

    it('should call the native method', () => {
      testNative('reduceRight', [1, 2, 3], 1, 1);
    });

    it('should reduce the elements according to the function', () => {
      eq(sparray.from(1, 2, 3).reduceRight((a, b) => a), 3);
      eq(sparray.from(1, 2, 3).reduceRight((a, b) => a + b, 5), 11);
      eq(sparray.from(2, 20, 120).reduceRight((a, b) => a / b), 3);
    });

    it('should throw exception if sparray is empty', () => {
      assert.throws(() => { sparray.from().reduceRight((a, b) => a + b) });
    });

  });

  describe('filter(filterFn, thisArg)', () => {

    it('should call the native method', () => {
      testNative('filter', [1, 2, 3], [1, 3], sparray.from(1, 3));
    });

    it('should filter the elements according to the function', () => {
      deq(sparray.from(1, 2, 3).filter(a => a % 2).toArray(), [1, 3]);
    });

  });

  describe('flatMap(mapFn, thisArg)', () => {

    it('should transform the elements according to the function and flatten the result', () => {
      deq(sparray.from().flatMap(a => a).toArray(), []);
      deq(sparray.from(1, 2, 3).flatMap(a => a).toArray(), [1, 2, 3]);
      deq(sparray.from(1, 2, 3).flatMap(a => sparray.range(a)).toArray(), [0, 0, 1, 0, 1, 2]);
      deq(sparray.from(1, 2, 3).flatMap(a => sparray.range(a).toArray()).toArray(), [0, 0, 1, 0, 1, 2]);
    });

  });

  describe('flatten(depth)', () => {

    it('should flat nested sparrays or arrays in the main sparray', () => {
      deq(sparray.from([1, 2], [3, 4]).flatten().toArray(), [1, 2, 3, 4]);
      deq(sparray.from([1, 2], []).flatten().toArray(), [1, 2]);
      deq(sparray.from([1, [2]], sparray.from([3, 4])).flatten().toArray(), [1, [2], 3, 4]);
    });

    it('should flat deep nested sparrays and arrays', () => {
      deq(sparray.from([1, [2]], sparray.from([3, [[4], 5]])).flatten(0).toArray(), [[1, [2]], sparray.from([3, [[4], 5]])]);
      deq(sparray.from([1, [2]], sparray.from([3, [[4], 5]])).flatten(1).toArray(), [1, [2], 3, [[4], 5]]);
      deq(sparray.from([1, [2]], sparray.from([3, [[4], 5]])).flatten(2).toArray(), [1, 2, 3, [4], 5]);
      deq(sparray.from([1, [2]], sparray.from([3, [[4], 5]])).flatten(3).toArray(), [1, 2, 3, 4, 5]);
      deq(sparray.from([1, [2]], sparray.from([3, [[4], 5]])).flatten(4).toArray(), [1, 2, 3, 4, 5]);
    });

  });

  describe('join(separator, thisArg)', () => {

    it('should join the elements as a string', () => {
      eq(sparray.from().join(), '');
      eq(sparray.from(1, 2, 3).join(), '1,2,3');
      eq(sparray.from(1, 2, 3).join(', '), '1, 2, 3');
    });

    it('should join the elements as a string using a function to determine separator', () => {
      eq(sparray.from().join((fromStart, fromEnd) => ','), '');
      eq(sparray.from(1, 2, 3).join((fromStart, fromEnd) => fromEnd == 0 ? ' and ' : ', '), '1, 2 and 3');
    });

  })

  describe('forEach(forEachFn, thisArg)', () => {

    it('should call the native method', () => {
      testNative('forEach', [1, 2, 3], undefined, undefined)
    });

    it('should iterate the elements of sparray', () => {
      const sp = sparray.from({ a: 1 }, { a: 2 }, { a: 3 });
      sp.forEach((a, i) => a.a = i);
      deq(sp, sparray.from({ a: 0 }, { a: 1 }, { a: 2 }));
    });

  })

  describe('some(someFn, thisArg)', () => {

    it('should call the native method', () => {
      testNative('some', [1, 2, 3], true, true)
    });

    it('should return true if some element matches the condiction of someFn', () => {
      eq(sparray.from().some(a => true), false);
      eq(sparray.from(1, 2, 3).some(a => true), true);
      eq(sparray.from(1, 2, 3).some(a => false), false);
      eq(sparray.from(1, 2, 3).some(a => a === 2), true);
    });

  })

  describe('every(everyFn, thisArg)', () => {

    it('should call the native method', () => {
      testNative('every', [1, 2, 3], true, true)
    });

    it('should return true if every element matches the condiction of everyFn', () => {
      eq(sparray.from().every(a => true), true);
      eq(sparray.from(1, 2, 3).every(a => true), true);
      eq(sparray.from(1, 2, 3).every(a => false), false);
      eq(sparray.from(1, 2, 3).every(a => a === 2), false);
      eq(sparray.from(1, 2, 3).every(a => a < 10), true);
    });

  })

  describe('concat(...toCpncat)', () => {

    it('should concat other sparrays', () => {
      deq(sparray.from(1, 2, 3).concat().toArray(), [1, 2, 3]);
      deq(sparray.from(1, 2, 3).concat(sparray.from()).toArray(), [1, 2, 3]);
      deq(sparray.from(1, 2, 3).concat(sparray.from(4, 5, 6)).toArray(), [1, 2, 3, 4, 5, 6]);
      deq(sparray.from(1, 2, 3).concat(sparray.from(4), sparray.from(5, 6)).toArray(), [1, 2, 3, 4, 5, 6]);
    });

    it('should concat other arrays', () => {
      deq(sparray.from(1, 2, 3).concat([]).toArray(), [1, 2, 3]);
      deq(sparray.from(1, 2, 3).concat([4, 5, 6]).toArray(), [1, 2, 3, 4, 5, 6]);
      deq(sparray.from(1, 2, 3).concat([4], [5, 6]).toArray(), [1, 2, 3, 4, 5, 6]);
    });

    it('should concat other elements', () => {
      deq(sparray.from(1, 2, 3).concat(4, 5, 6).toArray(), [1, 2, 3, 4, 5, 6]);
      deq(sparray.from(1, 2, 3).concat(4, [5, 6]).toArray(), [1, 2, 3, 4, 5, 6]);
    });

    it('should not change the original sparray', () => {
      const a = sparray.from(1, 2, 3);
      const b = sparray.from(4, 5, 6);
      const c = a.concat(b);

      deq(a.toArray(), [1, 2, 3])
      deq(b.toArray(), [4, 5, 6])
      deq(c.toArray(), [1, 2, 3, 4, 5, 6])
    });

  });

});
