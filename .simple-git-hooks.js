/**
 * @file 对simple-git-hooks的配置
 * @reference https://github.com/toplenboren/simple-git-hooks
 */

module.exports = {
  // 'prepare-commit-msg': 'exec < /dev/tty && npx cz --hook || true',
  'pre-push': 'npm run test && npm run cov:check',

  'pre-commit': 'npx lint-staged',
  'commit-msg': 'npx tsx scripts/verify_commit_msg.ts $1',
  // 设置为true，表示在重新运行npx simple-git-hooks的时候，不要移除的hook
  // preserveUnused: ['pre-commit'],
};
