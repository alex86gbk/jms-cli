const chalk = require('chalk');
const opn = require('opn');
const fkill = require('fkill');
const co = require('co');

const consoleBoard = require('../app/console_board/server');
const url = 'http://localhost:3008/console_board';

module.exports = () => {
  co(function * start() {
    try {
      yield fkill(':3008', {
        force: true
      });
      consoleBoard({
        onStart: () => {
          console.log(chalk.green(`\n Console board has running on ${url} !`));
          opn(url);
        }
      });
    } catch (err) {
      consoleBoard({
        onStart: () => {
          console.log(chalk.green(`\n Console board has running on ${url} !`));
          opn(url);
        }
      });
    }
  });
};
