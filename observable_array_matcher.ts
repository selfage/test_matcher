import { ObservableArray } from "@selfage/observable_array";
import { MatchFn, assertThat, eq } from "@selfage/test_base/matcher";

export function eqObservableArray<T>(
  expected?: Array<MatchFn<T>>
): MatchFn<ObservableArray<T>> {
  return (actual) => {
    if (expected === undefined) {
      assertThat(actual, eq(undefined), "nullity");
      return;
    }
    assertThat(actual.length, eq(expected.length), `array length`);
    for (let i = 0; i < actual.length; i++) {
      assertThat(actual.get(i), expected[i], `${i}th element`);
    }
  };
}
