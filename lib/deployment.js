var aws = require('aws-sdk');

//create our objects for doing 'stuff'
var s3 = new AWS.S3();
var cloudfront = new AWS.CloudFront();

//getbucketwebsite

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