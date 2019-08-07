const execa = require('execa');
const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');

let defaultOptions = {
  templatePath: path.join(__dirname, '../resources/version_template.html'),
  outputPath: path.join(process.cwd(), 'version.html'),
  verbose: false,
  silent: true,
  force: true,
  data: {}
};

async function generateVersionFile(options) {
  options = Object.assign(defaultOptions, options);


  if (options.verbose) {
    log('Displaying verbose output', options.silent);
    log('Template path: ' + options.templatePath, options.silent);
    log('Output path: ' + options.outputPath, options.silent);
    log('Overwrite output: ' + options.force, options.silent);
  }

  var depMgr = fs.existsSync('yarn.lock') === true ? 'yarn' : 'npm';
  options.data.componentVersions = await getNpmComponentVersions(depMgr);
  await parseTemplate(options);
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

          log(`Version file successfully written to ${options.outputPath}.`, options.silent);
          resolve(options.outputPath);
        });
      }
      else {
        reject('File exists and will not be overwritten.');
      }
    });
  });
}

async function getNpmComponentVersions(manager) {
  var cmd = await execa(manager, ['list', '--depth=0']);
  if (cmd.failed)
    reject(cmd.stderr.toString());

  var lines = cmd.stdout.toString().split('\n');
  var componentVersions = [];
  for (const line of lines) {
    let expr = /[└├]─{1,2} (.*)[@](.*)$/;
    let match = line.match(expr);
    if (match) {
      componentVersions.push({ name: match[1], version: match[2] });
    }
  }
  return componentVersions;
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
