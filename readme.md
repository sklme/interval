## 更加实用的 interval

```ts
const interval = new Interval(f, {
  debounceInterval: 2000,
  onStart: () => {
    console.log('onStart');
  },
  onStop: () => {
    console.log('onStop');
  },
});

interval.start();
```
