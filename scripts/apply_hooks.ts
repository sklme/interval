import { exec } from 'child_process';
import colors from 'picocolors';

console.log(colors.green('安装git hooks...'));

exec('npx simple-git-hooks', (err) => {
  if (!err) {
    console.log(colors.green('Done✅'));
  }
});
