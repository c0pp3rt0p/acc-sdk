var chai = require('chai');
var cmd = require('../index.js').command;
var chaiAsPromised = require('chai-as-promised');

var expect = chai.expect;
chai.use(chaiAsPromised);

describe('#executeCommand()', async () => {
  let options;


  it('should execute a shell command', async () => {
    // arrange
    // act
    var result = await cmd.executeCommand('echo HELLO');

    // assert
    expect(result).to.not.be.undefined;
    expect(result).to.have.string('HELLO');
  });

  it('to fail for an unknown command', () => {
    // arrange
    // act
    return expect(cmd.executeCommand('notACommand')).to.be.rejectedWith(Error);
  });

});

describe('#executeCommands()', async () => {
  let options;


  it('should execute a collection of command objects', async () => {
    // arrange
    var commands = [{ command: "echo 1" }, { command: "echo 2" }, { command: "echo 3" }];

    // act
    var result = await cmd.executeCommands(commands);

    // assert
    expect(result).to.be.an('array');
    expect(result).to.include('1\n');
  });

});