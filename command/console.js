const { exec } = require('child_process');
const chalk = require('chalk');

module.exports = () => {
  const command = `node ./app/console_board/server`;

  exec(command, (error) => {
    if (error) {
      console.log(error);
    }
    console.log(chalk.green('\n Start console board!'));
  });
};
