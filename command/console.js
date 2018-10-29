const chalk = require('chalk');
const opn = require('opn');

const consoleBoard = require('../app/console_board/server');
const url = 'http://localhost:3008/console_board/index';

module.exports = () => {
  consoleBoard({
    onStart: () => {
      console.log(chalk.green(`\n Console board has running on ${url} !`));
      opn(url);
    }
  });
};
