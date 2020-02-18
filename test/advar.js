const assert = require('assert');
const { advar } = require('../src/advar');

const de = assert.deepEqual;
const eq = assert.equal;
const seq = assert.strictEqual;

describe('advar', () => {

  describe('toArray', () => {

    it('should return the raw stored data', () => {
      const a = new advar();
      a._data = [1, 2, 3];  //hard-coded to assert toArray without depends to the constructor
      de(a.toArray(), [1, 2, 3]);
    });

  });

  describe('constructor', () => {

    it('should be called with no parameters', () => {
      de(new advar().toArray(), []);
    });

    it('should accpet a single non-array-like element', () => {
      de(new advar(1).toArray(), [1]);
      de(new advar('a').toArray(), ['a']);
      de(new advar({a:1}).toArray(), [{a:1}]);
      de(new advar(true).toArray(), [true]);
    });

    it('should accept a single array-like element', () => {
      de(new advar([]).toArray(), []);
      de(new advar([1]).toArray(), [1]);
      de(new advar(['a']).toArray(), ['a']);
      de(new advar([{a:1}]).toArray(), [{a:1}]);
      de(new advar([1,2,3]).toArray(), [1,2,3]);
      de(new advar(['a',1,false]).toArray(), ['a',1,false]);
    });

    it('should create a copy of array instead of a reference', () => {
      let array = [1,2,3];
      let adv = new advar(array);
      array.pop();
      de(array, [1,2]);
      de(adv.toArray(), [1,2,3]);

      //TODO: make a change on adv and check array
    });

    it('should accept a single advar to be cloned', () => {
      de(new advar(new advar()).toArray(), []);
      de(new advar(new advar([1,2,3])).toArray(), [1,2,3]);
    });

    it('should create a copy of advar instead of a reference', () => {
      let adv1 = new advar([1,2,3]);
      let adv2 = new advar(adv1);
      
      //TODO: make a change on adv1 and check adv2 and vice-versa
    });

    it('should accpet multiple elements', () => {
      de(new advar(1,2,3).toArray(), [1,2,3]);
      de(new advar([1],2,'3',{a:4}).toArray(), [[1],2,'3',{a:4}]);
      de(new advar([],[]).toArray(), [[],[]]);
    });
  
  });

  describe('get', () => {

    it('should return an element by index', () => {
	const ad = new advar(1,2,3);
	eq(ad.get(1), 2);
        eq(ad.get(0), 1);
    });

    it('should return elements backwards for negative indices', () => {
        const ad = new advar(1,2,3);
	eq(ad.get(-1), 3);
        eq(ad.get(-2), 2);
    });

    it('should return undefined for out of bound indices', () => {
      seq(new advar(1,2,3).get(5), undefined);
      seq(new advar(1,2,3).get(-5), undefined);
    });
  });

});
