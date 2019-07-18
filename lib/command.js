const exec = require('child_process').exec;

//meant to perform simple git status type commands... describe, etc
async function executeGitCommand(cmd) {
  try {
    return await executeCommand(`git ${cmd}`);
  } catch (error) {
    return "n/a";
  };
}

// accepts a string to execute
function executeCommand(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, (err, stdout, stderr) => {
      if (err) {
        console.log('Error executing');
        reject(err);
      }
      resolve(stdout);
    });
  });
}

// accepts a list of command objects
async function executeCommands(cmds) {
  var results = [];
  if (Array.isArray(cmds)) {
    for (const cmd of cmds) {
      if (!cmd.command || cmd.command === '')
        throw new Error(`The property 'command' is required for the command ${cmd.name}.`);
      let cmdStr = `${cmd.command}`
      var output = await executeCommand(cmdStr);
      results.push(output);
    }
  }
  return results;
}

module.exports = {
  executeCommands,
  executeCommand,
  executeGitCommand
}