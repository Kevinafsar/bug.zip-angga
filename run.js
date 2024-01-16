import {
    spawn
} from 'child_process';
import cp from 'child_process';
import {
    promisify
} from 'util';
import chalk from 'chalk';

const exec = promisify(cp.exec).bind(cp);

const start = (cmd) => spawn(cmd, [], {
    stdio: ['inherit', 'inherit', 'inherit', 'ipc']
});

const displayTable = () => {
    const data = [{
        Message: chalk.red('Terminal ready to use!')
    }];
    console.table(data);
};

start('clear');
start('screenfetch');
start('bash');
displayTable();