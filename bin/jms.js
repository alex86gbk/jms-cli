#!/usr/bin/env node --harmony

const program = require('commander');

process.env.NODE_PATH = `${__dirname}/../node_modules/`;
program.version(require('../package').version);
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
  .alias('ls')
  .action(() => {
    require('../command/list')();
  });

// 移除项目
program
  .command('remove')
  .description('Remove a project, Not delete from hard disk')
  .alias('rm')
  .action(() => {
    require('../command/remove')();
  });

// 更新项目基本信息
program
  .command('refresh')
  .description('Refresh a project to update project base information')
  .alias('re')
  .action(() => {
    require('../command/refresh')();
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
