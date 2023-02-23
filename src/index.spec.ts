import test from 'ava';
import { Interval } from '.';
import { fake } from 'sinon';

async function sleep(t = 1000) {
  return new Promise((resolve) => setTimeout(resolve, t));
}

test('start and stop', async (t) => {
  const f = fake();
  const startFake = fake();
  const stopFake = fake();

  const interval = new Interval(f, {
    onStart: startFake,
    onStop: stopFake,
  });

  t.false(startFake.called);
  interval.start();
  t.true(startFake.called);

  await sleep(2500);

  t.is(f.callCount, 3);

  t.false(stopFake.called);
  interval.stop();
  t.true(stopFake.called);

  await sleep();

  // stop之后不能从新start
  interval.start();
  t.is(startFake.callCount, 1);
});

test('restart', async (t) => {
  const f = fake();
  const restartFake = fake();
  const interval = new Interval(f, {
    onRestart: restartFake,
  });

  interval.start();

  await sleep(2500);

  t.is(interval.execNum, 3);

  interval.restart();

  t.is(interval.execNum, 0);
  t.is(restartFake.callCount, 1);

  await sleep(2500);
  interval.stop();
  await sleep();

  // stop之后可以重新restart
  interval.restart();
  await sleep(1500);
  t.true(interval.execNum > 0);
  t.is(restartFake.callCount, 2);
});

test('pause', async (t) => {
  const f = fake();
  const pauseFake = fake();

  const interval = new Interval(f, {
    onPause: pauseFake,
  });

  interval.start();

  await sleep(2500);

  interval.pause();

  await sleep(1500);

  t.is(interval.execNum, 3);
  t.is(pauseFake.callCount, 1);

  // 重新启动
  interval.start();

  await sleep(1500);

  t.true(interval.execNum > 3);
});

test('debounceInterval 和 maxLoopTimes 执行参数', async (t) => {
  const f = fake();
  const loopMaxTimeFake = fake();

  const interval = new Interval(f, {
    debounceInterval: 100,
    maxLoopTimes: 5,
    onLoopMaxTimes: loopMaxTimeFake,
  });

  interval.start();

  await sleep(250);

  // 证实debounceInterval
  t.is(f.callCount, 3);

  await sleep(1000);

  // 最大执行次数是5
  t.is(interval.execNum, 5);
  t.is(loopMaxTimeFake.callCount, 1);
});

// TODO 怎么处理 unhandled rejections？
test.skip('测试参数', async (t) => {
  const f = fake(() => {
    throw new Error('哈哈');
  });
  const errorFake = fake();

  // await t.throwsAsync(async () => {

  // });

  const interval = new Interval(f, {
    retry: true,
    onError: errorFake,
  });

  interval.start();

  await sleep(2500);
  console.log(errorFake.callCount, 3);

  t.is(1, 1);
});

test('测试所有回调', async (t) => {
  const f = fake();
  const onLoop = fake();
  const onLooped = fake();
  const onLoopMaxTimes = fake();
  const onPause = fake();
  const onRestart = fake();
  const onStart = fake();
  const onStop = fake();

  const interval = new Interval(f, {
    // onError()
    maxLoopTimes: 5,
    debounceInterval: 100,
    onLoop,
    onLooped,
    onLoopMaxTimes,
    onPause,
    onRestart,
    onStart,
    onStop,
  });

  interval.start();

  await sleep(250);

  interval.pause();

  t.is(onLoop.callCount, 3);
  t.is(onLooped.callCount, 3);
  t.is(onPause.callCount, 1);
  t.is(onStart.callCount, 1);

  interval.start();

  await sleep(300);
  t.is(onStart.callCount, 2);
  t.is(onLoopMaxTimes.callCount, 1);

  interval.restart();

  await sleep(250);
  t.is(onRestart.callCount, 1);

  interval.stop();
  t.is(onStop.callCount, 1);

  interval.start();
  t.is(onStart.callCount, 2);
});
