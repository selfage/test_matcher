# @selfage/test_matcher

## Install
`npm install @selfage/test_matcher`

## Overview
Written in TypeScript and compiled to ES6 with inline source map & source. See [@selfage/tsconfig](https://www.npmjs.com/package/@selfage/tsconfig) for full compiler options. Provides basic assertions and matchers, which can be easily extended to custom data structures, promoting a framework or a pattern for matching actual value with expected in tests.

## Basic matchers

A matcher means a function that returns `MatchFn<T>` such as `eq()` and
`containStr()`. It's best to be used together with `assertThat()` to populate
error messages, and reads more naturally.

```TypeScript
// import other stuff...
import {
  assertThat, eq, containStr, eqArray, eqSet, eqMap
} from "@selfage/test_matcher";

// Usually called within a test case, if assertThat() fails, it throws an error
// which fails the rest of the test case.

// Equality is checked via `===`. Any type can be compared. The last argument
// `targetName` is filled into the error message `When matching ${targetName}:`,
// when assertion failed. In a test case, you can simply use the variable name,
// or anything you want to help you understand which assertion failed. You will
// see more why this is helpful in debugging when customizing matchers.
assertThat(actual, eq(expected), `actual`);

// `actual` must be a string that contains the expected text.
assertThat(actual, containStr('expected text'), `actual`);

// `actual` can be anything and will be ignored or always succeed.
assertThat(actual, ignore(), `actual`);

// `actual` must be an array of only one type.
// eqArray() takes an array of matchers to match each element from `actual`.
assertThat(actual, eqArray([eq(1), eq(2)]), `actual`);
// Therefore it can also be used like this.
assertThat(
  actual,
  eqArray([containStr('expected1'), eq('expected2'), ignore()]),
  `actual`);
// If `actual` is undefined, it can be matched as the following.
assertThat(actual, eqArray(), `actual`);

// `actual` must be a Set of only one type.
// eqSet() also takes an array of matchers just like eqArray() to match Set in
// insertion order.
assertThat(actual, eqSet([eq(1), eq(2)]), `actual`);
// If `actual` is undefined, it can be matched as the following.
assertThat(actual, eqSet(), `actual`);

// `actual` must be a Map of one key type and one value type.
// eqMap() takes an array of pairs of matchers, to match key and value in
// insertion order.
assertThat(
  actual,
  eqMap([[eq('key'), eq('value')], [eq('key2'), eq('value2')]]),
  `actual`);
// If `actual` is undefined, it can be matched as the following.
assertThat(actual, eqMap(), `actual`);
```

## Assert upon error

Often we need to assert when a function throws an error, which can be helped by
`assertReject()`, `assertThrow()`, and `eqError()`.

```TypeScript
import {
  assertThat, assertReject, assertThrow, eqError
} from '@selfage/test_matcher';

// Suppose we are in an async function.
let e = await assertReject(() => {
  return Promise.reject(new Error('It has to fail.'));
});
// `eqError()` expects the `actual` to be of `Error` type, to have the expected
// error name, and to contain (not equal to) the error message.
assertThat(e, eqError(new Error('has to')), `e`);

// If the function doesn't return a Promise.
let e = assertThrow(() => {
  // Suppose we are calling some function that would throw an error.
  throw an Error('It has to fail.');
});
assertThat(e, eqError(new Error('has to')), `e`);
```

## Customized matcher

Once you have your own data class, it becomes a pain to match each field in each
test. A customized matcher can help to ease the matching process.

```TypeScript
import {
  assert, assertThat, eq, eqArray, MatchFn
} from '@selfage/test_matcher';

// Suppose we define the following interfaces as data classes.
interface User {
  id?: number;
  name?: string;
  channelIds?: number[];
  creditCard?: CreditCard[];
}

interface CreditCard {
  cardNumber?: string;
  cvv?: string;
}

// The eventual goal is to define a matcher that works like the following, where
// both `actual` and `expected` follow the interface definition, but are of
// different instances, i.e., they are not equal by `===`.
assertThat(actual, eqUser(expected), `actual`);

// The `T` in `MatchFn<T>` is the usually the type of the actual value you want
// to match. In this case, `T` should be `User`. eqUser() is just an example
// name which is really up to you. But following this naming convention makes
// the assertion statement reads more naturally. 
function eqUser(expected?: User): MatchFn<User> {
  // `MatchFn<T>` is just an alias of a function type.
  // type MatchFn<T> = (actual: T) => void;
  // You will need to compare the actual value with the expected value in the
  // function body, and throw an error if anything is not matched, instead of
  // returning a boolean if you were wondering.
  return (actual) => {
    // When using assertThat(), the last argument `targetName` is used to
    // construct `When matching ${targetName}:` and it needs to be descriptive
    // enough for you to locate the failure within this matcher, because
    // `eqUser()` can be used inside other matchers, such as eqArray().
    if (expected === undefined) {
      // Supports matching when we expect `actual` to be undefined.
      assertThat(actual, eq(undefined), `nullity`);
    }
    assertThat(actual.id, eq(expected.id), `id field`);
    assertThat(actual.name, eq(expected.name), `name field`);
    // Because we can expect `actual.channelIds` to be undefined, the expected
    // array needs to be undefined in that case as well.
    let channelIds: MatchFn<number>[];
    if (expected.channelIds) {
      // Because eqArray() takes an array of matchers, we need to convert
      // `expected.channelIds` into `MatchFn<number>[]`.
      channelIds = expected.channelIds.map((channelId) => eq(channelId));
    }
    assertThat(actual.channelIds, eqArray(channelIds), `channelIds field`);
    // Similarly, let's convert `expected.creditCards` into
    // `MatchFn<CreditCard>[]`.
    let creditCards: MatchFn<CreditCard>[];
    if (expected.creditCards) {
      // Well eqCreditCard() doesn't exist. Let's define it below.
      creditCards = expected.creditCards.map(
        (channelId) => eqCreditCard(channelId)
      );
    }
    assertThat(actual.creditCards, eqArray(creditCards), `creditCards field`);
  };
}

function eqCreditCard(expected?: CreditCard): MatchFn<CreditCard> {
  return (actual) => {
    if (expected === undefined) {
      assertThat(actual, eq(undefined), `nullity`);
    }
    assertThat(actual.cardNumber, eq(expected.cardNumber), `cardNumber field`);
    assertThat(actual.cvv, eq(expected.cvv), `cvv field`);
    // If there are no exisitng matchers to help, you can fallback to use
    // `assert()`.
    assert(
      /^[0-9]$/.test(actual.cardNumber),
      `cardNumber to be of numbers only`,
      actual.cardNumber
    );
    // Or fallback to simply throw an error, if we re-write the above assertion
    // as the following.
    if (!(/^[0-9]$/.test(actual.cardNumber))) {
      throw Error(
        `Expect cardNumber to be of numbers only but it actually is ` +
        `${actual.cardNumber}.`
      );
    }
  };
}

// The input to a matcher is also up to you, as long as it returns `MatchFn<T>`.
// Hard-coded expected user.
function eqACertainUser(): MatchFn<User> {
  return (actual) => {
    // Match `actual` with a const User instance.
  };
}
assertThat(actual, eqACertainUser(), `actual`);
// Options to ignore certain fields.
function eqUserWithOptions(expected?: User, ignoreId: boolean): MatchFn<User> {
  return (actual) => {
    // Same as `eqUser()` except don't assert on id field, if `ignoreId` is
    // true.
  };
}
assertThat(actual, eqUserWithOptions(expected, true), `actual`);
```
