/**
 * 传入一个数值，返回乘以2之后的结果（这也是一个完整的TypeDoc的示例）。
 *
 * ### es module
 * ```js
 * import { double } from 'typescript-starter'
 * console.log(double(4))
 * // => 8
 * ```
 *
 * ### commonjs
 * ```js
 * var double = require('typescript-starter').double;
 * console.log(double(4))
 * // => 8
 * ```
 *
 * @param value 传入的数值
 * @returns 乘以2的数值
 * @anotherNote 我最厉害
 * @as 123
 */
export const double = (value: number) => {
  const double = 2;
  return value * double;
};

/**
 * Raise the value of the first parameter to the power of the second using the
 * es7 exponentiation operator (`**`).
 *
 * ### Example (es module)
 * ```js
 * import { power } from 'typescript-starter'
 * console.log(power(2,3))
 * // => 8
 * ```
 *
 * ### Example (commonjs)
 * ```js
 * var power = require('typescript-starter').power;
 * console.log(power(2,3))
 * // => 8
 * ```
 * @param base - the base to exponentiate
 * @param exponent - the power to which to raise the base
 */
export const power = (base: number, exponent: number) => {
  /**
   * This es7 exponentiation operator is transpiled by TypeScript
   */
  return base ** exponent;
};
