export class CancellablePromise<ReturnType = unknown> extends Promise<ReturnType> {
  #controller: AbortController;

  constructor(
    executor: (
      resolve: (value: ReturnType | PromiseLike<ReturnType>) => void,
      reject: (reason?: unknown) => void,
    ) => void,
  ) {
    const controller = new AbortController();
    let isCancelled: boolean = false;
    let isResolved: boolean = false;

    super((resolve: (value: ReturnType | PromiseLike<ReturnType>) => void, reject: (reason?: unknown) => void) => {
      const resolver = (value: ReturnType | PromiseLike<ReturnType>) => {
        if (!isCancelled) {
          isResolved = true;
          resolve(value);
        }
      };

      executor(resolver, reject);

      controller.signal.addEventListener("abort", () => {
        if (!isResolved) {
          isCancelled = true;
          resolve(undefined as ReturnType);
        }
      });
    });

    this.#controller = controller;
  }

  cancel() {
    this.#controller.abort();
  }

  static resolve<ResolveType = unknown>(value?: ResolveType | PromiseLike<ResolveType>) {
    return new CancellablePromise<ResolveType | undefined>((resolve) => resolve(value));
  }

  static reject<ResolveType = unknown>(value?: unknown) {
    return new CancellablePromise<ResolveType>((_, reject) => reject(value));
  }

  static wait(delay: number) {
    return new CancellablePromise<void>((resolve) => setTimeout(resolve, delay));
  }

  static defer<Args extends unknown[], ReturnType>(
    callback: (...args: Args) => ReturnType | PromiseLike<ReturnType>,
  ): (...args: Args) => CancellablePromise<ReturnType> {
    return (...args: Args) => {
      const caller = () => callback(...args);
      return new CancellablePromise<ReturnType>(async (resolve, reject) => {
        try {
          const response = await caller();
          resolve(response);
        } catch (error) {
          reject(error);
        }
      });
    };
  }
}
