#!/usr/bin/env node --harmony

const program = require('commander');

// 定义脚手架的文件路径
process.env.NODE_PATH = `${__dirname}/../node_modules/`;
// 定义当前版本
program.version(require('../package').version);
// 定义使用方法
program.usage('<command>');

program
  .command('create')
  .description('Generate a new project')
  .alias('c')
  .action(() => {
    require('../command/create')(require('../package').jmsGithubUrl);
  });

program.parse(process.argv);

if (!program.args.length) {
  program.help();
}
