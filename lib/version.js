const execa = require('execa');
const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');

function generateVersionFile(options) {
  console.log('Hey, generating that version file');
}

module.exports = {
  generateVersionFile
}
