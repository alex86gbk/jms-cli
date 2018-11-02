#!/usr/bin/env node --harmony

const program = require('commander');

// 定义脚手架的文件路径
process.env.NODE_PATH = `${__dirname}/../node_modules/`;
// 定义当前版本
program.version(require('../package').version);
// 定义使用方法
program.usage('<command>');

// 添加项目
program
  .command('add')
  .description('Add an existed project')
  .alias('a')
  .action(() => {
    require('../command/add')();
  });

// 创建项目
program
  .command('create')
  .description('Generate a new project')
  .alias('c')
  .action(() => {
    require('../command/create')(require('../package').githubUrl);
  });

// 项目控制台
program
  .command('console')
  .description('Project console board')
  .alias('cb')
  .action(() => {
    require('../command/console')();
  });

// 列出项目
program
  .command('list')
  .description('List all the project')
  .alias('l')
  .action(() => {
    require('../command/list')();
  });

// 切换源
program
  .command('source')
  .description('Change the npm source')
  .alias('s')
  .action(() => {
    require('../command/source')();
  });

program.parse(process.argv);

if (!program.args.length) {
  program.help();
}
