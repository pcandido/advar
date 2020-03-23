var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
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
export function from() {
    var data = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        data[_i] = arguments[_i];
    }
    if (data.length === 0) {
        return new Sparray([]);
    }
    else if (data.length === 1) {
        data = data[0];
        if (Array.isArray(data)) {
            return new Sparray(data);
        }
        else if (data instanceof Set) {
            return new Sparray(Array.from(data));
        }
        else if (data instanceof Sparray) {
            return new Sparray(data._data);
        }
        else {
            return new Sparray([data]);
        }
    }
    else {
        return new Sparray(data);
    }
}
/**
 * Builds a Sparray from a range. It can be used in several ways:
 * 1) with one param, the range iterates 1-by-1 from 0 (inclusive) to the value of param (exclusive)
 * 2) with two params, the range iterates 1-by-1 from the first param (inclusive) to the second param (exclusive)
 * 3) with three params, the range iterates by the value of the third param, from the value of the first param (inclusive) to the value of the second param (exclusive)
 *
 * @param start of range (inclusive)
 * @param end of range (exclusive)
 * @param step the size of increment
 */
export function range(start, end, step) {
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
        throw new Error("Invalid step " + step);
    }
    var data = [];
    if (end < start) {
        for (var i = start; i > end; i += step)
            data.push(i);
    }
    else {
        for (var i = start; i < end; i += step)
            data.push(i);
    }
    return new Sparray(data);
}
/**
 * Builds a sparray of n static value elements.
 * @param n the desired length of the sparray
 * @param value the static value for all the elements
 */
export function fillOf(n, value) {
    if (typeof n !== 'number') {
        throw new Error('Invalid number (n) of elements');
    }
    var data = [];
    for (var i = 0; i < n; i++) {
        data.push(value);
    }
    return new Sparray(data);
}
/**
 * Builds an empty sparray
 */
export function empty() {
    return new Sparray([]);
}
/**
 * Determines if the obj is an instance of Sparray
 * @param obj obj to verify
 */
export function isSparray(obj) {
    return obj instanceof Sparray;
}
var Sparray = /** @class */ (function () {
    /**
     * Constructor of the Sparray. Receive an array as data.
     *
     * @param data an array with the elements
     */
    function Sparray(data) {
        if (!Array.isArray(data))
            throw new Error('Invalid data input');
        this._data = data;
    }
    /**
     * Returns the raw data as a native array
     */
    Sparray.prototype.toArray = function () {
        return __spread(this._data);
    };
    /**
     * An node debugger/inspect representation for the Sparray. It will be the same of the raw data (array-like representation).
     */
    /*
    //TODO: verify how to include this withou break browser version
    import util from 'util';
    [util.inspect.custom](depth: any, opts: any): any {
      return this._data;
    }
    */
    Sparray.prototype._resolveIndex = function (index) {
        if (index < 0)
            return this.length + index;
        else
            return index;
    };
    /**
     * Gets an element from sparray by index. Negative indices will get elements backward. Out of bound indices will return undefined.
     *
     * @param index is the position from where the element should be gotten
     */
    Sparray.prototype.get = function (index) {
        return this._data[this._resolveIndex(index)];
    };
    Object.defineProperty(Sparray.prototype, "length", {
        /**
         * The number of elements of the sparray.
         */
        get: function () {
            return this._data.length;
        },
        enumerable: true,
        configurable: true
    });
    /*
     * Returns the number of elements of the sparray.
     */
    Sparray.prototype.size = function () {
        return this.length;
    };
    /**
     * Counts the number of elements. If a filterFn is provided, only the filtered elements will be counted.
     *
     * @param filterFn is an optional filter function to be applied during the count
     * @param thisArg object to be used as this inside filterFn
     */
    Sparray.prototype.count = function (filterFn, thisArg) {
        if (!filterFn)
            return this.length;
        filterFn.bind(thisArg || this);
        var c = 0;
        for (var i = 0; i < this.length; i++) {
            if (filterFn(this.get(i), i, this))
                c++;
        }
        return c;
    };
    /**
     * Returns a key iterator of the sparray.
     */
    Sparray.prototype.keys = function () {
        return this._data.keys();
    };
    /**
     * Returns a value iterator of the sparray. It is the default iterator in for-of loops.
     */
    Sparray.prototype.values = function () {
        return this._data.values();
    };
    /**
     * Returns a values iteratior of the sparray.
     */
    Sparray.prototype[Symbol.iterator] = function () {
        return this.values();
    };
    /**
     * Returns an entry iterator of the sparray. Each element is a two-position array, the index, and the value.
     */
    Sparray.prototype.entries = function () {
        return this._data.entries();
    };
    /**
     * Build a new sparray by transforming the elements according to the mapFn function.
     * @param mapFn transformation function
     * @param thisArg object to be used as this inside mapFn
     */
    Sparray.prototype.map = function (mapFn, thisArg) {
        mapFn.bind(thisArg || this);
        var mapped = [];
        for (var i = 0; i < this.length; i++) {
            mapped[i] = mapFn(this.get(i), i, this);
        }
        return from(mapped);
    };
    /**
     * Aggregate the elements of sparray pair-by-pair, according to the reduceFn,
     * accumulating the aggregation until last element.
     * @param reduceFn aggragation (reducer) function
     * @param initialValue to initialize the accumulated value
     * @param thisArg object to be used as this inside reduceFn
     */
    Sparray.prototype.reduce = function (reduceFn, initialValue, thisArg) {
        if (this.length === 0 && (typeof initialValue === 'undefined')) {
            throw 'Reduce of empty sparray with no initial value';
        }
        reduceFn.bind(thisArg || this);
        var i, prev;
        if (typeof initialValue === 'undefined') {
            i = 1;
            prev = this.get(0);
        }
        else {
            i = 0;
            prev = initialValue;
        }
        for (; i < this.length; i++) {
            prev = reduceFn(prev, this.get(i), i, this);
        }
        return prev;
    };
    /**
     * Aggregate the elements of sparray pair-by-pair, from the right to the left, according to the reduceFn,
     * accumulating the aggregation until the last element.
     * @param reduceFn aggragation (reducer) function
     * @param initialValue to initialize the accumulated value
     * @param thisArg object to be used as this inside reduceFn
     */
    Sparray.prototype.reduceRight = function (reduceFn, initialValue, thisArg) {
        if (this.length === 0 && (typeof initialValue === 'undefined')) {
            throw 'Reduce of empty sparray with no initial value';
        }
        reduceFn.bind(thisArg || this);
        var i, prev;
        if (typeof initialValue === 'undefined') {
            i = this._resolveIndex(-2);
            prev = this.get(-1);
        }
        else {
            i = this._resolveIndex(-1);
            prev = initialValue;
        }
        for (; i >= 0; i--) {
            prev = reduceFn(prev, this.get(i), i, this);
        }
        return prev;
    };
    /**
     * Builds a new sparray with only the elements selected by filterFn.
     * @param filterFn
     * @param thisArg
     */
    Sparray.prototype.filter = function (filterFn, thisArg) {
        var e_1, _a;
        filterFn.bind(thisArg || this);
        var filtered = [];
        try {
            for (var _b = __values(this.entries()), _c = _b.next(); !_c.done; _c = _b.next()) {
                var _d = __read(_c.value, 2), i = _d[0], a = _d[1];
                if (filterFn(a, i, this)) {
                    filtered.push(a);
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return from(filtered);
    };
    /**
     * Iterates over each element of the sparray. The sparray is returned, thus other methods may be chained.
     * @param forEachFn function to be executed over each element
     * @param thisArg object to be used as this in forEachFn
     */
    Sparray.prototype.forEach = function (forEachFn, thisArg) {
        var e_2, _a;
        forEachFn.bind(thisArg || this);
        try {
            for (var _b = __values(this.entries()), _c = _b.next(); !_c.done; _c = _b.next()) {
                var _d = __read(_c.value, 2), i = _d[0], a = _d[1];
                forEachFn(a, i, this);
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_2) throw e_2.error; }
        }
        return this;
    };
    /**
     * Build a new sparray by transforming the elements according to the flatMapFn function and flatten the result sparrays or arrays.
     * @param flatMapFn transformation function
     * @param thisArg object to be used as this inside flatMapFn
     */
    Sparray.prototype.flatMap = function (flatMapFn, thisArg) {
        var e_3, _a;
        flatMapFn.bind(thisArg || this);
        var flatted = [];
        try {
            for (var _b = __values(this.entries()), _c = _b.next(); !_c.done; _c = _b.next()) {
                var _d = __read(_c.value, 2), i = _d[0], a = _d[1];
                var mapped = flatMapFn(a, i, this);
                if (mapped != null) {
                    if (isSparray(mapped)) {
                        flatted.push.apply(flatted, __spread((mapped._data)));
                    }
                    else {
                        flatted.push.apply(flatted, __spread(mapped));
                    }
                }
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_3) throw e_3.error; }
        }
        return from(flatted);
    };
    /**
     * Builds a new sparray flatting the nested sparrays and arrays to the main sparray
     * @param depth how depth the flatten will be applied
     */
    Sparray.prototype.flatten = function (depth) {
        if (typeof depth === 'undefined') {
            depth = 1;
        }
        if (depth <= 0) {
            return this;
        }
        var res = from(this._data.reduce(function (a, b) {
            if (b instanceof Sparray) {
                return a.concat(b.toArray());
            }
            return a.concat(b);
        }, []));
        return res.flatten(depth - 1);
    };
    /**
     * Remove all the duplicates and create a new sparray of distinct values
     */
    Sparray.prototype.distinct = function () {
        return from(new Set(this._data));
    };
    /**
     * Join the elements of the sparray in a string using the separator.
     * The comma is the default separator. The separator can be a string or
     * a function that returns a string. The function will receive as parameter
     * the index of the separator from beggining and the index from end.
     * Note the count of separators is the count of elements minus one.
     *
     * @param separator the string to be used to separate the elements
     * @param thisArg object to be used as this inside the function, if it is provided
     */
    Sparray.prototype.join = function (separator, thisArg) {
        if (typeof separator === 'string') {
            return this._data.join(separator);
        }
        else if (typeof separator === 'function') {
            separator.bind(thisArg || this);
            var sepCount_1 = this.length - 1;
            var res_1 = '';
            this._data.forEach(function (a, i) {
                if (i > 0) {
                    res_1 += separator(i - 1, sepCount_1 - i);
                }
                res_1 += a;
            });
            return res_1;
        }
        else {
            return this._data.join();
        }
    };
    /**
     * Returns true if some element produces the result true in the someFn.
     * @param someFn condiction to be test, should return boolean
     * @param thisArg object to be used as this inside someFn
     */
    Sparray.prototype.some = function (someFn, thisArg) {
        var e_4, _a;
        someFn.bind(thisArg || this);
        try {
            for (var _b = __values(this.entries()), _c = _b.next(); !_c.done; _c = _b.next()) {
                var _d = __read(_c.value, 2), i = _d[0], a = _d[1];
                if (someFn(a, i, this))
                    return true;
            }
        }
        catch (e_4_1) { e_4 = { error: e_4_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_4) throw e_4.error; }
        }
        return false;
    };
    /**
      * Returns true if every element produces the result true in the everyFn.
      * @param everyFn condiction to be test, should return boolean
      * @param thisArg object to be used as this inside everyFn
      */
    Sparray.prototype.every = function (everyFn, thisArg) {
        var e_5, _a;
        everyFn.bind(thisArg || this);
        try {
            for (var _b = __values(this.entries()), _c = _b.next(); !_c.done; _c = _b.next()) {
                var _d = __read(_c.value, 2), i = _d[0], a = _d[1];
                if (!everyFn(a, i, this))
                    return false;
            }
        }
        catch (e_5_1) { e_5 = { error: e_5_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_5) throw e_5.error; }
        }
        return true;
    };
    /**
     * Concatenates one or more sparrays, arrays or elements to the original sparray.
     * The result will be a new sparray. The original sparray is not changed.
     *
     * @param toConcat sparrays, arrays or elements to concat
     */
    Sparray.prototype.concat = function () {
        var e_6, _a;
        var toConcat = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            toConcat[_i] = arguments[_i];
        }
        var data = this.toArray();
        try {
            for (var toConcat_1 = __values(toConcat), toConcat_1_1 = toConcat_1.next(); !toConcat_1_1.done; toConcat_1_1 = toConcat_1.next()) {
                var obj = toConcat_1_1.value;
                if (isSparray(obj)) {
                    data.push.apply(data, __spread(obj._data));
                }
                else if (Array.isArray(obj)) {
                    data.push.apply(data, __spread(obj));
                }
                else {
                    data.push(obj);
                }
            }
        }
        catch (e_6_1) { e_6 = { error: e_6_1 }; }
        finally {
            try {
                if (toConcat_1_1 && !toConcat_1_1.done && (_a = toConcat_1.return)) _a.call(toConcat_1);
            }
            finally { if (e_6) throw e_6.error; }
        }
        return from(data);
    };
    /**
     * Returns the first element that satisfies the condition of findFn, or undefined if no element satisfies.
     * @param findFn condiction to be test, should return boolean
     * @param thisArg object to be used as this inside everyFn
     */
    Sparray.prototype.find = function (filterFn, thisArg) {
        var e_7, _a;
        filterFn.bind(thisArg || this);
        var filtered = [];
        try {
            for (var _b = __values(this.entries()), _c = _b.next(); !_c.done; _c = _b.next()) {
                var _d = __read(_c.value, 2), i = _d[0], a = _d[1];
                if (filterFn(a, i, this)) {
                    return a;
                }
            }
        }
        catch (e_7_1) { e_7 = { error: e_7_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_7) throw e_7.error; }
        }
        return undefined;
    };
    /**
     * Returns the index of the first element that satisfies the condition of findFn, or -1 if no element satisfies.
     * @param findFn condiction to be test, should return boolean
     * @param thisArg object to be used as this inside everyFn
     */
    Sparray.prototype.findIndex = function (findFn, thisArg) {
        var e_8, _a;
        findFn.bind(thisArg || this);
        try {
            for (var _b = __values(this.entries()), _c = _b.next(); !_c.done; _c = _b.next()) {
                var _d = __read(_c.value, 2), i = _d[0], a = _d[1];
                if (findFn(a, i, this)) {
                    return i;
                }
            }
        }
        catch (e_8_1) { e_8 = { error: e_8_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_8) throw e_8.error; }
        }
        return -1;
    };
    /**
     * Returns the first index of the element equals to the searchElement, or -1 if not found
     * @param searchElement value to search
     */
    Sparray.prototype.indexOf = function (searchElement) {
        return this._data.indexOf(searchElement);
    };
    /**
     * Returns the last index of the element equals to the searchElement, or -1 if not found
     * @param searchElement value to search
     */
    Sparray.prototype.lastIndexOf = function (searchElement) {
        return this._data.lastIndexOf(searchElement);
    };
    /**
     * Returns true if the sparray constains the value, and false otherwise
     * @param value value to search
     */
    Sparray.prototype.includes = function (value) {
        return this._data.includes(value);
    };
    /**
     * Returns true if the sparray constains all the values, and false otherwise
     * @param value values to search
     */
    Sparray.prototype.includesAll = function (values) {
        var _this = this;
        if (isSparray(values))
            values = values.toArray();
        if (!Array.isArray(values)) {
            return this.includes(values);
        }
        return values.every(function (a) { return _this._data.includes(a); });
    };
    /**
     * Builds a new sparray with the reverse order
     */
    Sparray.prototype.reverse = function () {
        return from(this.toArray().reverse());
    };
    /**
    * Builds a new sparray with the elements sorted by either a natural order or a custom sortFn
    * @param sortFn otional custom sort condition
    * @param thisArg object to be used as this inside sortFn
    */
    Sparray.prototype.sort = function (sortFn, thisArg) {
        if (typeof sortFn === 'undefined') {
            return from(this.toArray().sort());
        }
        else {
            sortFn.bind(thisArg || this);
            return from(this.toArray().sort(sortFn));
        }
    };
    /**
     * Builds a new sparray with the elements sorted by the criteria provided by keyFn
     * @param keyFn get key from object
     * @param thisArg object to be used as this inside sortFn
     */
    Sparray.prototype.sortBy = function (keyFn, reverse, thisArg) {
        keyFn.bind(thisArg || this);
        return from(this._data.sort(function (a, b) {
            var keysA = keyFn(a);
            var keysB = keyFn(b);
            if (isSparray(keysA))
                keysA = keysA.toArray();
            if (isSparray(keysB))
                keysB = keysB.toArray();
            if (!Array.isArray(keysA))
                keysA = [keysA];
            if (!Array.isArray(keysB))
                keysB = [keysB];
            for (var i = 0; i < Math.min(keysA.length, keysB.length); i++) {
                if (keysA[i] < keysB[i])
                    return reverse ? 1 : -1;
                if (keysA[i] > keysB[i])
                    return reverse ? -1 : 1;
            }
            return 0;
        }));
    };
    /**
     * Builds a new sparray with the elements sliced from the original one. Negative indices could be used to backward indexing. The end index is optional.
     * @param startIndex
     * @param endIndex
     */
    Sparray.prototype.slice = function (startIndex, endIndex) {
        if (typeof endIndex == 'undefined')
            return from(this._data.slice(this._resolveIndex(startIndex)));
        else
            return from(this._data.slice(this._resolveIndex(startIndex), this._resolveIndex(endIndex)));
    };
    /**
     * Returns the string representation of the sparray and its elements
     */
    Sparray.prototype.toString = function () {
        return this._data.toString();
    };
    /**
     * Returns true if all the elements of the array is numeric
     */
    Sparray.prototype.toNumeric = function () {
        return this.map(function (a) {
            if (typeof a === 'number')
                return a;
            else
                return NaN;
        });
    };
    /**
     * Sums all the elements of the sparray. If there is a non-numeric element, the return will be NaN
     */
    Sparray.prototype.sum = function () {
        return this.toNumeric().reduce(function (a, b) { return a + b; }, 0);
    };
    /**
     * Calculates the average of all the elements of the sparray. If there is a non-numeric element, the return will be NaN
     */
    Sparray.prototype.avg = function () {
        if (this.isEmpty())
            return NaN;
        return this.sum() / this.length;
    };
    /**
     * Returns the min value of the sparray
     */
    Sparray.prototype.min = function () {
        if (this.isEmpty())
            return undefined;
        return this._data.reduce(function (a, b) { return a < b ? a : b; });
    };
    /**
     * Returns a sparray with all the elements which has the minimum value returned by valueFn
     */
    Sparray.prototype.minBy = function (valueFn, thisArg) {
        if (this.isEmpty())
            return empty();
        valueFn.bind(thisArg || this);
        var minValue = this.map(valueFn).min();
        return this.filter(function (a) { return valueFn(a) === minValue; });
    };
    /**
     * Returns the max value of the sparray
     */
    Sparray.prototype.max = function () {
        if (this.isEmpty())
            return undefined;
        return this._data.reduce(function (a, b) { return a > b ? a : b; });
    };
    /**
     * Returns a sparray with all the elements which has the maximum value returned by valueFn
     */
    Sparray.prototype.maxBy = function (valueFn, thisArg) {
        if (this.isEmpty())
            return empty();
        valueFn.bind(thisArg || this);
        var maxValue = this.map(valueFn).max();
        return this.filter(function (a) { return valueFn(a) === maxValue; });
    };
    /**
     * Indexes the elements by a key. The result is an object where the keys are providen by keyFn and the values are the own elements.
     * If there are duplicate keys, the last element that generated that key will be preserved.
     * @see groupBy
     * @param keyFn function to provide a key by element
     * @param thisArg object to be used as this inside keyFn
     */
    Sparray.prototype.indexBy = function (keyFn, thisArg) {
        keyFn.bind(thisArg || this);
        return this._data.reduce(function (a, b) {
            a[keyFn(b)] = b;
            return a;
        }, {});
    };
    /**
     * Groups the elements by a key. The result is an object where the keys are providen by keyFn and the values are grouped as a sparray.
     * It is possible to handle the groupd elements (as sparrays) by valuesFn
     * @see indexBy
     * @param keyFn function to provide a key by element
     * @param valuesFn handle the sparray of the grouped elements
     * @param thisArg object to be used as this inside keyFn
     */
    Sparray.prototype.groupBy = function (keyFn, valuesFn, thisArg) {
        var e_9, _a;
        if (typeof valuesFn === 'undefined')
            valuesFn = function (a) { return a; };
        keyFn.bind(thisArg || this);
        valuesFn.bind(thisArg || this);
        var grouped = this._data.reduce(function (a, b) {
            var key = keyFn(b);
            (a[key] = a[key] || []).push(b);
            return a;
        }, {});
        try {
            for (var _b = __values(Object.keys(grouped)), _c = _b.next(); !_c.done; _c = _b.next()) {
                var p = _c.value;
                grouped[p] = valuesFn(from(grouped[p]));
            }
        }
        catch (e_9_1) { e_9 = { error: e_9_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_9) throw e_9.error; }
        }
        return grouped;
    };
    /**
     * Returns true if the sparray is empty and false otherwise
     */
    Sparray.prototype.isEmpty = function () {
        return this._data.length === 0;
    };
    /**
     * Returns false if the sparray is empty and true otherwise
     */
    Sparray.prototype.isNotEmpty = function () {
        return this._data.length > 0;
    };
    /**
     * Partitions the sparray in batches of size. If step is providen, it determines the step to the next batch.
     * @param size the size of partition
     * @param step how many steps to the next partition, by default is the same of size
     */
    Sparray.prototype.sliding = function (size, step) {
        if (size < 1)
            throw new Error('Size must be a positive integer');
        if (typeof step === 'undefined') {
            step = size;
        }
        if (step < 1)
            throw new Error('Step must be a positive integer');
        var partitions = [];
        for (var i = 0; i - step + size < this._data.length; i += step) {
            partitions.push(this.slice(i, i + size));
        }
        return from(partitions);
    };
    /**
     * Return the first element, and if the 'n' param is provided, return the first n elements as a new sparray
     * @param n [optional] number of elements
     */
    Sparray.prototype.first = function (n) {
        if (typeof n === 'undefined') {
            return this.get(0);
        }
        else {
            return this.slice(0, n);
        }
    };
    /**
    * Return the last element, and if the 'n' param is provided, return the last n elements as a new sparray
    * @param n [optional] number of elements
    */
    Sparray.prototype.last = function (n) {
        if (typeof n === 'undefined') {
            return this.get(this.length - 1);
        }
        else {
            return this.slice(-n);
        }
    };
    /**
     * Maps each element to an object containing the index and the value
     */
    Sparray.prototype.enumerate = function () {
        return this.map(function (value, index) { return ({ index: index, value: value }); });
    };
    Sparray.prototype.zip = function () {
        var e_10, _a;
        var toZip = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            toZip[_i] = arguments[_i];
        }
        var size = toZip.filter(function (a) { return a.length; }).map(function (a) { return a.length; }).reduce(function (a, b) { return Math.max(a, b); }, this.length);
        var data = [];
        for (var i = 0; i < size; i++) {
            var element = [this.get(i)];
            try {
                for (var toZip_1 = (e_10 = void 0, __values(toZip)), toZip_1_1 = toZip_1.next(); !toZip_1_1.done; toZip_1_1 = toZip_1.next()) {
                    var a = toZip_1_1.value;
                    if (isSparray(a)) {
                        element.push(a.get(i));
                    }
                    else if (Array.isArray(a)) {
                        element.push(a[i]);
                    }
                    else {
                        element.push(a);
                    }
                }
            }
            catch (e_10_1) { e_10 = { error: e_10_1 }; }
            finally {
                try {
                    if (toZip_1_1 && !toZip_1_1.done && (_a = toZip_1.return)) _a.call(toZip_1);
                }
                finally { if (e_10) throw e_10.error; }
            }
            data.push(from(element));
        }
        return from(data);
    };
    /**
     * Sample data from the sparray. If n is not provided, a single element will be returned, otherwise, a new sparray will be returned.
     * @param n
     * @param withReplacement
     */
    Sparray.prototype.sample = function (n, withReplacement) {
        var random = function (n) { return Math.trunc(Math.random() * n); };
        if (typeof n === 'undefined') {
            return this.get(random(this.length));
        }
        else {
            if (!withReplacement && n > this.length) {
                throw 'n cannot be greater than the length of sparray, if withReplacement=false';
            }
            var selected = [];
            var all = this.toArray();
            for (var i = 0; i < n; i++) {
                var j = random(all.length);
                selected.push(all[j]);
                if (!withReplacement) {
                    all.splice(j, 1);
                }
            }
            return from(selected);
        }
    };
    return Sparray;
}());
