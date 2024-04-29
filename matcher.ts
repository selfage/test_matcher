export function assert(
  tested: boolean,
  expected: string,
  actual: string
): void {
  if (!tested) {
    throw new Error(`Expect ${expected} but it actually is ${actual}.`);
  }
}

export async function assertReject(promise: Promise<any>) {
  try {
    await promise;
  } catch (e) {
    return e;
  }
  throw new Error("Failed to assert the promise to be rejected.");
}

export function assertThrow(method: () => void) {
  try {
    method();
  } catch (e) {
    return e;
  }
  throw new Error("Failed to assert an error to be thrown.");
}

export type AsyncMatchFn<T> = (actual: T) => Promise<void>;

export async function asyncAssertThat<T>(
  actual: T,
  asyncMatch: AsyncMatchFn<T>,
  targetName: string
): Promise<void> {
  try {
    await asyncMatch(actual);
  } catch (e) {
    e.message = `When matching ${targetName}:\n${e.message}`;
    throw e;
  }
}

export type MatchFn<T> = (actual: T) => void;

export function assertThat<T>(
  actual: T,
  match: MatchFn<T>,
  targetName: string
): void {
  try {
    match(actual);
  } catch (e) {
    e.message = `When matching ${targetName}:\n${e.message}`;
    throw e;
  }
}

export function any<T>(): MatchFn<T> {
  return (actual) => {};
}

export function eq<T>(expected: T): MatchFn<T> {
  return (actual) => {
    assert(expected === actual, `${expected}`, `${actual}`);
  };
}

// Greater than
export function gt(expected: number): MatchFn<number> {
  return (actual) => {
    assert(actual > expected, `> ${expected}`, `${actual}`);
  };
}

// Greater and equal
export function ge(expected: number): MatchFn<number> {
  return (actual) => {
    assert(actual >= expected, `>= ${expected}`, `${actual}`);
  };
}

// Less than
export function lt(expected: number): MatchFn<number> {
  return (actual) => {
    assert(actual < expected, `< ${expected}`, `${actual}`);
  };
}

// Less and equal
export function le(expected: number): MatchFn<number> {
  return (actual) => {
    assert(actual <= expected, `<= ${expected}`, `${actual}`);
  };
}

// Equal approximately
export function eqAppr(
  expected: number,
  deviation: number = 0.01
): MatchFn<number> {
  return (actual) => {
    assert(
      actual >= expected * (1 - deviation),
      `to equal approximately to ${expected}`,
      `${actual}`
    );
    assert(
      actual <= expected * (1 + deviation),
      `to equal approximately to ${expected}`,
      `${actual}`
    );
  };
}

export function containStr(expected: string): MatchFn<string> {
  return (actual) => {
    assert(Boolean(actual), `to not be null`, `null`);
    assert(actual.indexOf(expected) != -1, `containing ${expected}`, actual);
  };
}

export function isArray<T>(expected?: Array<MatchFn<T>>): MatchFn<Array<T>> {
  return (actual) => {
    if (expected === undefined) {
      assertThat(actual, eq(undefined), "nullity");
      return;
    }
    assert(Boolean(actual), `to not be null`, `null`);
    assertThat(actual.length, eq(expected.length), `array length`);
    for (let i = 0; i < actual.length; i++) {
      assertThat(actual[i], expected[i], `${i}th element`);
    }
  };
}

export function containUnorderedElements<T>(
  expectedMatchers?: Array<MatchFn<T>>
): MatchFn<Array<T>> {
  return (actual) => {
    assert(Boolean(actual), `to not be null`, `null`);
    let matchedIndex = new Set<number>();
    for (let i = 0; i < expectedMatchers.length; i++) {
      let matched = false;
      for (let j = 0; j < actual.length; j++) {
        if (matchedIndex.has(j)) {
          continue;
        }

        try {
          expectedMatchers[i](actual[j]);
          matched = true;
          matchedIndex.add(j);
          break;
        } catch (e) {}
      }
      if (!matched) {
        throw new Error(`Cannot match the ${i}th expected element.`);
      }
    }
  };
}

export function isUnorderedArray<T>(
  expected?: Array<MatchFn<T>>
): MatchFn<Array<T>> {
  return (actual) => {
    assert(Boolean(actual), `to not be null`, `null`);
    assertThat(actual.length, eq(expected.length), `array length`);
    assertThat(
      actual,
      containUnorderedElements(expected),
      `unordered elements`
    );
  };
}

// Match Set in insertion order.
export function isSet<T>(expected?: Array<MatchFn<T>>): MatchFn<Set<T>> {
  return (actual) => {
    if (expected === undefined) {
      assertThat(actual, eq(undefined), "nullity");
      return;
    }
    assert(Boolean(actual), `to not be null`, `null`);
    assertThat(actual.size, eq(expected.length), `set size`);
    let i = 0;
    for (let value of actual) {
      assertThat(value, expected[i], `${i}th element`);
      i++;
    }
  };
}

// Match Map in insertion order.
export function isMap<K, V>(
  expected?: Array<[MatchFn<K>, MatchFn<V>]>
): MatchFn<Map<K, V>> {
  return (actual) => {
    if (expected === undefined) {
      assertThat(actual, eq(undefined), "nullity");
      return;
    }
    assert(Boolean(actual), `to not be null`, `null`);
    assertThat(actual.size, eq(expected.length), `map size`);
    let i = 0;
    for (let [key, value] of actual) {
      assertThat(key, expected[i][0], `${i}th key`);
      assertThat(value, expected[i][1], `${i}th value`);
      i++;
    }
  };
}

export function eqError(expected: Error): MatchFn<any> {
  return (actual) => {
    assert(actual instanceof Error, `to be an Error`, `${actual}`);
    assertThat(actual.name, eq(expected.name), `name of the error`);
    assertThat(actual.message, containStr(expected.message), `${actual.stack}`);
  };
}
