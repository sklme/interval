/**
 * @file 在提交commit信息的时候，校验commit信息是否符合conventional-changelog的规范
 * 如果不符合就报错。
 *
 * TODO: 看一下是否有必要替换到commitlint（https://github.com/conventional-changelog/commitlint）
 */

import { readFileSync } from 'node:fs';
import colors from 'picocolors';

// get $1 from commit-msg script
const msgPath = process.argv[2];
const msg = readFileSync(msgPath, 'utf-8').trim();

const releaseRE = /^v\d/;
const commitRE =
  /^(revert: )?(feat|fix|docs|dx|refactor|perf|test|workflow|build|ci|chore|types|wip|release|deps)(\(.+\))?: .{1,50}/;

if (!releaseRE.test(msg) && !commitRE.test(msg)) {
  console.log();
  console.error(
    `  ${colors.bgRed(colors.white(' ERROR '))} ${colors.red(
      `invalid commit message format.`,
    )}\n\n` +
      colors.red(
        `  Proper commit message format is required for automated changelog generation. Examples:\n\n`,
      ) +
      `    ${colors.green(`feat: 增加一个非常厉害的功能`)}\n` +
      `    ${colors.green(`fix: 解决一个用户提出的bug (close #222)`)}\n\n` +
      `  ${colors.blue(
        'refer to https://www.conventionalcommits.org/en/v1.0.0/ for more infos',
      )}`,
  );
  process.exit(1);
}
