# @selfage/test_matcher

## Install

`npm install @selfage/test_matcher`

## Overview

Written in TypeScript and compiled to ES6. Provides an extended collection of test matchers to be used with `@selfage/test_base` for data structures encountered in all @selfage packages.

## Counter matcher

```TypeScript
import { eqCounter } from '@selfage/test_matcher/counter_matcher';
import { Counter } from '@selfage/counter'; // Install `@selfage/counter`.

let counter = new Counter<string>();
counter.increment('key1');
counter.increment('key2', 10);
// Match counter in insertion order.
assertThat(counter, eqCounter([eq('key1'), 1], [eq('key2', 10)]), 'counter');
```

## Observable array matcher

```TypeScript
import { eqObservableArray } from '@selfage/test_matcher/observable_array_matcher';
import { ObservableArray } from '@selfage/observable_array'; // Install `@selfage/observable_array`.

let ob = new ObservableArray<number>();
ob.push(10, 11, 12, 13, 14);
assertThat(ob, eqObservableArray([eq(10), eq(11), eq(12), eq(13), eq(14)]), `ob`);
```
