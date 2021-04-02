# sparray
Super Array - A simple and powerful library to handle immutable arrays/lists

[![GitHub license](https://img.shields.io/github/license/pcandido/sparray)](https://github.com/pcandido/sparray/blob/master/LICENSE)
![GitHub package.json version](https://img.shields.io/github/package-json/v/pcandido/sparray)
[![GitHub issues](https://img.shields.io/github/issues/pcandido/sparray)](https://github.com/pcandido/sparray/issues)
[![Build Status](https://travis-ci.org/pcandido/sparray.svg?branch=master)](https://travis-ci.org/pcandido/sparray)
[![Coverage Status](https://coveralls.io/repos/github/pcandido/sparray/badge.svg?branch=master)](https://coveralls.io/github/pcandido/sparray?branch=master)

The full API documentation can be found [here](https://pcandido.github.io/sparray/).
Sparray includes most of the native array methods (those that do not change the array state) plus some advanced features.

## Instalation

```
npm i sparray
```

### Usage

```javascript
const sparray = require('sparray');

sparray.from(1, 2, 3, 4, 5, 6, 7, 8)
  // the result is a sparray, an immutable list structure. it can be transformed, generating new sparrays.

  .map(a => a * 2) // [ 2, 4, 6, 8, 10, 12, 14, 16]
  // the map function works just like in native arrays

  .filter(a => a > 5) // [ 6, 8, 10, 12, 14, 16 ]
  // the filter function works just like in native arrays

  .forEach((a,i) => console.log(`${i}. ${a}`)) // [ 6, 8, 10, 12, 14, 16 ]
  // forEach can be chained, but the function return does not change the chain

  .flatMap(a => a.toString().split('')).map(a => parseInt(a)) // [ 6, 8, 1, 0, 1, 2, 1, 4, 1, 6 ]
  // flatMap is a kind of map that flatten nested arrays/sparrays to the main sparray

  .groupBy(a => a % 2 === 0) // {true: [ 6, 8, 0, 2, 4, 6 ], false: [ 1, 1, 1, 1 ]}
  // group elements according to a given criterion

  .asSparray // [{key: 'true', values: [ 6, 8, 0, 2, 4, 6 ]}, {key: 'false', values: [ 1, 1, 1, 1 ]}]
  // transform the group object back to sparray

  .map(a => a.values) // [[ 6, 8, 0, 2, 4, 6 ], [ 1, 1, 1, 1 ]]
  // back to a sparray of sparrays

  .flatten() // [ 6, 8, 0, 2, 4, 6, 1, 1, 1, 1 ]
  // flat the nested sparrays to the main one

  .distinct() // [ 6, 8, 0, 2, 4, 1 ]
  // remove all the duplicated elements

  .zip([10, 20, 30, 40, 50, 60]) // [[6, 10], [8, 20], [0, 30], [2, 40], [4, 50], [1, 60]]
  // join two sparrays/arrays, matching the elements by index

  .map(a => a.sum()) // [ 16, 28, 30, 42, 54, 61 ]
  // sparrays can sum all their elements, they can also get the average (avg), min and max

  .sliding(2) // [[16, 28], [30, 42], [54, 61]]
  // break the sparray in smaller parts

  .map(a => a.get(-1)) // [ 28, 42, 61 ]
  // get is the way to access an element (it cannot be set). negative indices can be used to backward indexing

  .cross([1, 2, 3], (a, b) => a * b) // [ 28, 56, 84, 42, 84, 126, 61, 122, 183]
  // produces a cartesian product. a combine function may or may not be given

  .slice(2,-1) // [ 84, 42, 84, 126, 61, 122 ]
  // slices can be used with negative indices

  .first(5) // [ 84, 42, 84, 126, 61 ]
  // first can be used with or without parameter

  .sample(4) // [ 61, 84, 126, 42 ]
  // randomly select some elements. can be used with or without replacement

  .indexBy(a => Math.trunc(a/10)) // { '6': 61, '8': 84, '12': 126, '4': 42 }
  // like groupBy, but elements with the same index will conflict and only one will be preserved

  .asSparray // [{key:'6', value:61}, {key:'8', value:84}, {key:'12', value:126}, {key:'4', value:42}]
  // transform back to sparray

  .sortBy(a => parseInt(a.key)) // [{key:'4', value:42}, {key:'6', value:61}, {key:'8', value:84}, {key:'12', value:126}]
  // besides sort, sortBy take a function to extract the sort key of each element

  .isEmpty() // false
  // determines if the sparray is or not empty. there is also the function isNotEmpty()

```

This example shows a few features of sparrays, consult the [documentation](https://pcandido.github.io/sparray/) for all the features.

Fell free to send an issue by GitHub for questions, bugs, suggestions, and so on.
