export function nextTick(fn: () => void | Promise<void>): void {
  const timeout = setTimeout(function () {
    fn();
    clearTimeout(timeout);
  }, 0);
}
