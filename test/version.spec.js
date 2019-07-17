var chai = require('chai');
var chaiFiles = require('chai-files');
const fs = require('fs');
const path = require('path');

var ver = require('../index.js').version;

chai.use(chaiFiles);

var expect = chai.expect;
var file = chaiFiles.file;
var dir = chaiFiles.dir;

let outputPath = './test/output/version.html';

describe('#getVersionFile()', async () => {
  let options;

  // reset the test environment
  beforeEach(async () => {
    // ...some logic before each test is run
    await new Promise((resolve, reject) => {
      options = { outputPath: outputPath };
      resolve();
    });
  })

  afterEach(() => {
    return cleanDir('./test/output');
  });
  
  context('with default options', async () => {
    it('should generate version.html file', async () => {
      // arrange
      
      // act
      await ver.generateVersionFile(options);
      
      // assert
      expect(file(outputPath)).to.exist;
    });
  });
});

function cleanDir(directory) {
  return new Promise((resolve, reject) => {
    fs.readdir(directory, (err, files) => {
      if (err) reject(Error(err));
      
      for (const file of files) {
        fs.unlink(path.join(directory, file), err => {
          if (err) reject(Error(err));
        });
      }
      resolve();
    });
  });
}