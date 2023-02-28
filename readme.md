## 更加实用的 interval

```ts
function pollingFn() {
  console.log('执行了polling函数');
}

const interval = new Interval(pollingFn, {
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

接口参考：https://sklme.github.io/interval/classes/Interval.html
