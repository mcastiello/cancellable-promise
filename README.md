# Cancellable Promise
As the name suggests, this promise can be cancelled while still running.

### Install
`yarn add @mcastiello/cancellable-promise`

`npm install @mcastiello/cancellable-promise`

### How to use

```ts
import { CancellablePromise } from "@mcastiello/cancellable-promise";

const promise = new CancellablePromise((resolve) => resolve("Hello World"));

promise.cancel();

console.log(await promise); // undefined
```

## Static methods
It also provides a few static methods to simplify the use of promises:

### `defer`
Make functions asynchronous by deferring them. Once the deferred function will be executed, it will return a cancellable promise that will be resolved with the value returned by the original function.
```ts
import { CancellablePromise } from "@mcastiello/cancellable-promise";

const callback = () => true;

// This will make the above callback asynchronous
const deferred = CancellablePromise.defer(callback);

// The function will return a function that, once executed, it will resolve the cancellable promise
const result = await deferred();
// As the returned value is a cancellable promise, the execution can be cancelled at any point
```

### `wait`
Wait for a fixed amount of time before resolving the promise.
```ts
import { CancellablePromise } from "@mcastiello/cancellable-promise";

const waiting = async () => {
  console.log("Hello World1");
  
  await CancellablePromise.wait(1000);
  
  console.log("One second is passed!");
}
```
