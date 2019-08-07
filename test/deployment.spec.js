var chai = require('chai');

var deploy = require('../index.js').deploy;

describe('#getVersionFile()', async () => {
  let options;

  it('should generate version.html file', async () => {
    // arrange

    // act
    await ver.generateVersionFile(options);

    // assert
    expect(file(outputPath)).to.exist;
  });
});