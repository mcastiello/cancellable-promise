import { CancellablePromise } from "./cancellable-promise";

describe("CancellablePromise", () => {
  test("It should be able to cancel a promise", async () => {
    const promise = new CancellablePromise((resolve) => {
      setTimeout(() => resolve(true), 10);
    });

    promise.cancel();

    expect(await promise).toEqual(undefined);
  });
  test("Wait for a specific amount of time", async () => {
    jest.useFakeTimers();

    const callback = jest.fn();
    const promise = CancellablePromise.wait(1000).then(callback);

    expect(callback).not.toHaveBeenCalled();

    jest.advanceTimersByTime(500);

    expect(callback).not.toHaveBeenCalled();

    jest.advanceTimersByTime(500);

    await promise;

    expect(callback).toHaveBeenCalled();

    jest.useRealTimers();
  });
  test("Cancel the wait while still running", async () => {
    jest.useFakeTimers();

    const callback = jest.fn();
    const promise = CancellablePromise.wait(1000);

    promise.then(callback);

    expect(callback).not.toHaveBeenCalled();

    jest.advanceTimersByTime(500);

    expect(callback).not.toHaveBeenCalled();

    promise.cancel();

    await promise;

    expect(callback).toHaveBeenCalled();

    jest.useRealTimers();
  });
  test("It should convert a function to a deferred callback", async () => {
    const callback = jest.fn().mockReturnValue(true);
    const deferred = CancellablePromise.defer(callback);
    const promise = deferred();

    expect(await promise).toEqual(true);
  });
  test("It should cancel a deferred callback", async () => {
    const callback = jest.fn().mockReturnValue(true);
    const deferred = CancellablePromise.defer(callback);
    const promise = deferred();

    promise.cancel();

    expect(await promise).toEqual(undefined);
  });
  test("It should intercept an error", async () => {
    const error = "Error";
    const callback = jest.fn().mockImplementation(() => {
      throw error;
    });
    const deferred = CancellablePromise.defer(callback);
    const promise = deferred();

    try {
      await promise;
    } catch (e) {
      expect(e).toEqual(error);
    }
  });
  test("It should generate a resolved promise", async () => {
    const promise = CancellablePromise.resolve(true);

    expect(await promise).toEqual(true);
  });
  test("It should generate a rejected promise", async () => {
    const error = "Error";
    const promise = CancellablePromise.reject(error);

    try {
      await promise;
    } catch (e) {
      expect(e).toEqual(error);
    }
  });
});
