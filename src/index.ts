export interface EventOptions {
  loopNum: number;
  loopMaxTimes?: number;

  loopStartTime?: number;
  loopEndTime?: number;
}

/** 执行间距函数的参数 */
export interface intervalOptions {
  /** 如果遇到错误，是重新执行还是直接跳出循环，默认不跳出熏染 */
  retry?: boolean;
  /** 重新请求的时间间隔 */
  retryDefer?: number;
  /** 防抖，在给定时间内只会执行一次。
   * 如果小于函数的执行时间，会等待异步函数执行完毕才执行下一次，保证同时只有一个函数调用，这个特性使之适合长轮询。
   */
  debounceInterval?: number;
  /**
   * 最大执行次数，执行函数超过这个次数，就不再执行。
   */
  maxLoopTimes?: number;

  // 事件
  // 开始执行
  onStart?(option: EventOptions): void;
  // 暂停
  onPause?(option: EventOptions): void;
  // 重新执行
  onRestart?(options: EventOptions): void;
  // 每次开始loop
  onLoop?(options: EventOptions): void;
  // 每次loop之后的结果
  onLooped?(result: unknown, options: EventOptions): void;
  // 停止执行
  onStop?(options: EventOptions): void;
  // 到达最大执行数，然后退出
  onLoopMaxTimes?(options: EventOptions): void;
  // 遇到错误
  onError?(error: Error, options: EventOptions): void;
}

/**
 * 最厉害的类
 */
export class Interval {
  // 计时器
  #timeoutTimer: number | NodeJS.Timeout | null = null;
  // 记录执行的次数
  #loopNum = 0;
  // 是否已经停止
  #stopFlag = false;

  // 遇到报错是否继续执行
  retry: boolean;
  // 遇到错误之后，需要延迟多久之后继续执行
  retryDefer: number;

  // 防抖
  debounceInterval: number;

  // 最大执行次数
  maxLoopTimes: number;

  /**
   * 函数的执行次数
   */
  get execNum() {
    return this.#loopNum;
  }

  /**
   * 执行的类
   *
   * @param action 间隔执行的函数，可以是一个异步函数，每次回等待函数执行完毕，才接着执行下一次
   * @param options 间隔执行的参数
   */
  constructor(
    public action: (...args: unknown[]) => unknown,
    public options: intervalOptions = {},
  ) {
    this.debounceInterval = options.debounceInterval || 1000;

    this.retry = options.retry === undefined ? true : options.retry;
    this.retryDefer = options.retryDefer || this.debounceInterval;

    this.maxLoopTimes = options.maxLoopTimes || Infinity;
  }

  async loopFunc() {
    // 如果有正在执行的定时器，就去掉
    this.#timeoutTimer && clearTimeout(this.#timeoutTimer);

    // 如果到达执行最大次数，就不继续执行了
    if (this.maxLoopTimes !== 0 && this.#loopNum >= this.maxLoopTimes) {
      console.warn(`已经达成最大请求次数：${this.maxLoopTimes}。退出loop`);
      this.options.onLoopMaxTimes?.({
        loopNum: this.#loopNum,
        loopMaxTimes: this.maxLoopTimes,
      });
      return;
    }

    // 如果有stop flag，就不要继续执行了
    if (this.#stopFlag) {
      return;
    }

    try {
      // 记录最近一次的执行时间戳
      const execTs = +new Date();

      // 每次loop
      this.options.onLoop?.({
        loopNum: this.#loopNum,
        loopStartTime: execTs,
      });
      // 执行函数
      const result = await this.action.apply(null);
      const execEndTs = +new Date();
      // 每次loop后的结果
      this.options.onLooped?.(result, {
        loopNum: this.#loopNum,
        loopStartTime: execTs,
        loopEndTime: execEndTs,
      });
      // loop次数增加1
      this.#loopNum++;

      // console.log('当前函数执行次数', this.#loopNum);

      // 执行的耗时（有可能是异步的，所以会有耗时）
      const dur = execEndTs - execTs;

      // 计算出下一次执行的时间，如果有防抖的话，可能中间会有间隔时间
      const execGap =
        this.debounceInterval - dur > 0 ? this.debounceInterval - dur : 0;

      this.#timeoutTimer = setTimeout(() => {
        void this.loopFunc();
      }, execGap);
    } catch (err) {
      //
      this.options.onError?.(err as Error, {
        loopNum: this.#loopNum,
      });

      // 如果有retry为真，就继续请求
      if (this.retry) {
        console.error(`loop遇到错误，${this.retryDefer}ms后重试`);

        this.#timeoutTimer = setTimeout(() => {
          void this.loopFunc();
        }, this.retryDefer);
      }

      // 向上抛出错误
      throw err;
    }
  }

  #reset() {
    this.#loopNum = 0;

    this.#timeoutTimer && clearTimeout(this.#timeoutTimer);
    this.#timeoutTimer = null;
  }

  /**
   * 开始loop
   */
  start() {
    if (this.#stopFlag) return;

    void this.loopFunc();
    // 事件
    this.options.onStart?.({
      loopNum: this.#loopNum,
    });
  }

  /**
   * 暂停
   */
  pause() {
    this.#timeoutTimer && clearTimeout(this.#timeoutTimer);
    // 事件
    this.options.onPause?.({
      loopNum: this.#loopNum,
    });
  }

  /**
   * 结束，状态会被重置
   */
  stop() {
    this.#reset();

    this.#stopFlag = true;

    // 事件
    this.options.onStop?.({
      loopNum: this.#loopNum,
    });
  }

  /**
   * 重新开始执行，状态会被重置
   */
  restart() {
    // 重置
    this.#reset();
    // 将stopFlag重置
    this.#stopFlag = false;

    void this.loopFunc();

    this.options.onRestart?.({
      loopNum: this.#loopNum,
    });
  }
}
