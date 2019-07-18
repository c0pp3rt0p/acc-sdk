var aws = require('aws-sdk');
var cmd = require('./command.js');

//create our objects for doing 'stuff'
var s3 = new aws.S3();
var cloudfront = new aws.CloudFront();

//getbucketwebsite

async function uploadToS3(localPath, targetPath, cacheControl, acl, dryRun) {
    await s3sync(localPath, targetPath, ['*', '!*.md', '!*.json'], '', cacheControl, acl, dryRun);
    await s3sync(localPath, targetPath, ['!*', '*.md'], 'text/plain', cacheControl, acl, dryRun);
    await s3sync(localPath, targetPath, ['!*', '*.json'], 'application/json', cacheControl, acl, dryRun);
}

async function s3sync(sourcePath, targetPath, includes, contentType, cacheControl, acl, dryRun = true) {
    var cmdArgs = ['aws', 's3', 'sync', '--delete'];

    if (contentType) cmdArgs.push('--content-type', `'${contentType}'`);
    cmdArgs.push('--cache-control', cacheControl);
    if (acl) cmdArgs.push('--acl', acl);
    if (dryRun) cmdArgs.push('--dryrun');

    cmdArgs.push(...includes.map(x =>
        x.charAt(0) !== '!' ? `--include '${x}'` : `--exclude '${x.substr(1)}'`
    ));

    //append any additional arguments
    if (arguments.length > 8) {
        cmdArgs.push(arguments.slice(8));
    }

    //Add the source & target
    cmdArgs.push(sourcePath, targetPath);

    var awsCommand = cmdArgs.join(' ');

    console.log('awsCommand: ', awsCommand);
    var res = await cmd.executeCommand(awsCommand);
    console.log(res);
}

// Create a CF invalidation
// returns a promise
function createInvalidation(params) {
    return new Promise((resolve, reject) => {
        cloudfront.createInvalidation(params, function (err, data) {
            if (err) reject(err);
            resolve(data);
        });
    });
}

// Get info about an invalidation
// Returns a promise
function getInvalidation(distributionID, id) {
    return new Promise((resolve, reject) => {
        cloudfront.getInvalidation({ DistributionId: distributionID, Id: id }, (err, data) => {
            if (err) reject(err);
            resolve(data);
        });
    });
}

function getCompletedInvalidation(distributionID, id, interval = 5000, maxAttempts = 720) {
    return new Promise((resolve, reject) => {
        //need to check status on an interval, 
        var attempts = 0;
        var timer = setInterval(() => {
            getInvalidation(distributionID, id).then(data => {
                attempts++;
                //console.log('Last status: ', data.Invalidation.Status, attempts);
                if (data.Invalidation.Status !== 'InProgress') {
                    resolve(data);
                    clearInterval(timer);
                }
                if (attempts > maxAttempts) {
                    reject('Exceeded, the maximum number of attempts while attempting to wait for the Cloudfront invalidation to complete,');
                    clearInterval(timer);
                }

            }, reason => {
                reject(reason);
                clearInterval(timer);
            }
            );
        }, interval);
    });
}

module.exports = {
    uploadToS3,
    s3sync,
    getCompletedInvalidation

}