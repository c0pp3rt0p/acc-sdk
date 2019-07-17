const execa = require('execa');
const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');

let defaultOptions = {
  templatePath: 'resources/version_template.html',
  outputPath: 'version.html',
  verbose: false,
  silent: true,
  force: true,
  data: {}
};

function generateVersionFile(options) {
  options = Object.assign(defaultOptions, options);

  if (options.verbose) {
    log('Displaying verbose output');
    log('Template path: ' + options.templatePath);
    log('Output path: ' + options.outputPath);
    log('Overwrite output: ' + options.force);
  }

  return getNpmComponentVersions().then(versions => {
    options.data.componentVersions = versions;

    return parseTemplate(options);
  }, reason => {
    log('Failed to retrieve component versions.');
  });

}

function jsonSafeParse(jsonString) {
  try {
    if (jsonString) {
      return JSON.parse(jsonString);
    }
    return {};
  }
  catch (ex) {
    if (ex instanceof SyntaxError) {
      let msg = `The value '${jsonString}' is not valid JSON.`;
      throw msg;
    }
    else {
      log(`Error: ${e.message}`);
      throw (ex);
    }
  }
}

function mergeData(data, filepath) {
  data = Object.assign({}, jsonSafeParse(data));

  if (filepath && fs.existsSync(filepath)) {
    fs.readFile(filepath, 'utf-8', function (error, source) {
      let tmpData = jsonSafeParse(source);
      data = Object.assign(data, tmpData);
    });
  }

  return data;
}

const parseTemplate = function (options) {
  // Read the tmeplate and generate the output
  return new Promise((resolve, reject) => {
    fs.readFile(options.templatePath, 'utf-8', function (error, source) {
      var template = handlebars.compile(source);
      var html = template(options.data);
      let fileExists = fs.existsSync(options.outputPath);
      if (!fileExists || (fileExists && options.force)) {
        ensureDirectoryExistence(options.outputPath);
        fs.writeFile(options.outputPath, html, function (err) {
          if (err) reject(Error(err));

          log(`File successfully written to ${options.outputPath}.`);
          resolve(options.outputPath);
        });
      }
      else {
        reject('File exists and will not be overwritten.');
      }
    });
  });
}

function getNpmComponentVersions() {
  return execa('yarn', ['list', '--depth=0'])
    .then(result => {
      var lines = result.stdout.toString().split('\n');
      var componentVersions = [];
      lines.forEach(function (line) {
        let expr = /[└├]─ (.*)[@](.*)$/;
        let match = line.match(expr);
        if (match) {
          componentVersions.push({ name: match[1], version: match[2] });
        }
      });
      return componentVersions;
    }, reason => {
      log(`Failed to retrieve component versions: ${reason}`);
      return undefined;
    });
}

function getYarnComponentVersions() {
  return execa('yarn', ['list', '--depth=0'])
    .then(result => {
      var lines = result.stdout.toString().split('\n');
      var componentVersions = [];
      lines.forEach(function (line) {
        let expr = /[└├]─ (.*)[@](.*)$/;
        let match = line.match(expr);
        if (match) {
          componentVersions.push({ name: match[1], version: match[2] });
        }
      });
      return componentVersions;
    }, reason => {
      log(`Failed to retrieve component versions: ${reason}`);
      return undefined;
    });
}

function ensureDirectoryExistence(filePath) {
  var dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  ensureDirectoryExistence(dirname);
  fs.mkdirSync(dirname);
}

function log(msg, silent = true) {
  if (!silent) {
    console.log(msg);
  }
}

module.exports = {
  generateVersionFile
}
