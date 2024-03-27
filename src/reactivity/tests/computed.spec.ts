import { computed } from "../computed";
import { reactive } from "../reactive";


describe("computed", () => {
  it("happy path", () => {
    const value = reactive({
      foo: 1,
    });

    const getter = computed(() => {
      return value.foo;
    });
    //todo,有问题，需要初始手动让getter执行一次
    getter.value
         value.foo = 2;
     expect(getter.value).toBe(2);
    //expect(getter.value).toBe(1);

  });

  it("should compute lazily", () => {
    const value = reactive({
      foo: 1,
    });
    const value2 = reactive({
      foo2: 1,
    });
    const getter = jest.fn(() => {
      return value.foo;
    });
    const cValue = computed(getter);

    // lazy,方法不会主动调用,PS：toHaveBeenCalledTimes方法是累加的
    expect(getter).not.toHaveBeenCalled();

    expect(cValue.value).toBe(1);
    expect(getter).toHaveBeenCalledTimes(1);

    // should not compute again
    cValue.value;
    expect(getter).toHaveBeenCalledTimes(1);

    // should not compute until needed
    value.foo = 2;
    expect(getter).toHaveBeenCalledTimes(1);

    // // now it should compute
    expect(cValue.value).toBe(2);
    expect(getter).toHaveBeenCalledTimes(2);

    // // should not compute again
    cValue.value;
    expect(getter).toHaveBeenCalledTimes(2);
  });
});
