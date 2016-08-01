// Load the SDK and UUID

if(process.env.NODE_ENV === 'develop'){
  var AWS = require('aws-sdk'),
      uuid = require('node-uuid'),
      fs = require('fs'),
      request = require('request');
      AWS.config.loadFromPath('./config.json');
}

if(process.env.NODE_ENV === 'staging'){
  var AWS = require('aws-sdk'),
      uuid = require('node-uuid'),
      fs = require('fs'),
      request = require('request');
      AWS.config.loadFromPath('/root/web/config.json');
}

if(process.env.NODE_ENV === 'production')
{
  var AWS = require('aws-sdk'),
      uuid = require('node-uuid'),
      fs = require('fs'),
      request = require('request');
      AWS.config.loadFromPath('/root/web/config.json');
}

var s3 = new AWS.S3(),
    Boom = require('boom'),
    async = require('async');

exports.uploads = function(data, callback) {
    var bucketName = data.instagramId;
    createBucketFun(bucketName, data.allPhotoList, function(error, result) {
        callback(null, result);
    });
};

var createBucketFun = function(bucketName, allPhotoList, callback) {
    request(s3.createBucket({
        Bucket: bucketName
    }, function() {
        var urlArray = [];
        async.each(allPhotoList, function(data, callback1) {
            var keyName = data.thumbnail;
            var keyNameFile = keyName.split('/');
            keyNameFile = keyNameFile.reverse()[0];
            if(keyNameFile.indexOf('images%2F') != -1){
              keyNameFile = keyNameFile.slice(9);
            }
            download(keyName, keyNameFile, bucketName, 'images', function(error, url) {
                if (error) {
                    console.log(error);
                } else {
                    urlArray.push(url);
                    callback1();
                }
            });
        }, function(err) {
            if (err) {
                // One of the iterations produced an error.
                // All processing will now stop.
                console.log('A file failed to process');
            } else {
                callback(null, urlArray);
            }
        });
    })).on('success', function(response) {

    });
};

var download = function(uri, filename, bucketName, images, callback) {
    request.head(uri, function(err, res, body) {
        request(uri).pipe(fs.createWriteStream(filename)).on('close', function(response) {
            var readStream = fs.createReadStream(filename).on('close', function(response) {});
            var bucket = bucketName;
            var filePath = require('path').dirname(require.main.filename) + '/' + readStream.path;
            var fileName = readStream.path;
            var fileKey = images+'/' + fileName;
            var buffer = fs.readFileSync(filePath);
            // deleteBucketObjectS3s(bucketName, 'images', function(error, result) {
            //     if (error) {
            //         return callback(error, "error")
            //     }
            // });
            var startTime = new Date();
            var partNum = 0;
            var partSize = 1024 * 1024 * 5; // Minimum 5MB per chunk (except the last part) http://docs.aws.amazon.com/AmazonS3/latest/API/mpUploadComplete.html
            var numPartsLeft = Math.ceil(buffer.length / partSize);
            var maxUploadTries = 3;
            var multiPartParams = {
                Bucket: bucket,
                Key: fileKey,
                ContentType: 'application/jpeg',
                ACL: 'public-read'
            };
            var multipartMap = {
                Parts: []
            };


            var localdata;

            function completeMultipartUpload(s3, doneParams) {
                request(s3.completeMultipartUpload(doneParams, function(err, data) {
                    if (err) {
                        console.log("An error occurred while completing the multipart upload");
                        console.log(err);
                    } else {
                        var delta = (new Date() - startTime) / 1000;
                        console.log('Completed upload in', delta, 'seconds');
                        console.log('Final upload data:', data);
                        // callback(null, data);
                    }
                })).on('success', function(response) {
                    localData = response.data.Location;
                    callback(null, localData);
                });
            }

            function uploadPart(s3, multipart, partParams, tryNum) {
                tryNum = tryNum || 1;
                request(s3.uploadPart(partParams, function(multiErr, mData) {
                    if (multiErr) {
                        console.log('multiErr, upload part error:', multiErr);
                        if (tryNum < maxUploadTries) {
                            console.log('Retrying upload of part: #', partParams.PartNumber);
                            uploadPart(s3, multipart, partParams, tryNum + 1);
                        } else {
                            console.log('Failed uploading part: #', partParams.PartNumber);
                        }
                        return;
                    }
                    multipartMap.Parts[this.request.params.PartNumber - 1] = {
                        ETag: mData.ETag,
                        PartNumber: Number(this.request.params.PartNumber)
                    };
                    console.log("Completed part", this.request.params.PartNumber);
                    console.log('mData', mData);
                    if (--numPartsLeft > 0) return; // complete only when all parts uploaded

                    var doneParams = {
                        Bucket: bucket,
                        Key: fileKey,
                        MultipartUpload: multipartMap,
                        UploadId: multipart.UploadId,
                    };

                    console.log("Completing upload...");
                    completeMultipartUpload(s3, doneParams);
                })).on('complete', function(response) {

                });
            }

            console.log("Creating multipart upload for:", fileKey);
            request(s3.createMultipartUpload(multiPartParams, function(mpErr, multipart) {
                if (mpErr) {
                    console.log('Error!', mpErr);
                    return;
                }
                console.log("Got upload ID", multipart.UploadId);

                for (var rangeStart = 0; rangeStart < buffer.length; rangeStart += partSize) {
                    partNum++;
                    var end = Math.min(rangeStart + partSize, buffer.length),
                        partParams = {
                            Body: buffer.slice(rangeStart, end),
                            Bucket: bucket,
                            Key: fileKey,
                            PartNumber: String(partNum),
                            UploadId: multipart.UploadId
                        };

                    console.log('Uploading part: #', partParams.PartNumber, ', Range start:', rangeStart);
                    var finalData = uploadPart(s3, multipart, partParams);
                    fs.unlinkSync(filePath);
                    console.log("Delete local file ");
                }
            })).on('complete', function(response) {});
        });
    });
};


var deleteBucketObjectS3s = function(bucketName, keyName, callback) {
    var params = {
        Bucket: bucketName
    };
    s3.listObjects(params, function(err, data) {
        if (err) return console.log(err);

        var deleteParam = {
            Bucket: bucketName,
            Key: keyName+'/'
        };
        params.Delete = {};
        params.Delete.Objects = [];

        data.Contents.forEach(function(content) {
            params.Delete.Objects.push({
                Key: content.Key
            });
        });

        s3.deleteObjects(params, function(err, data) {
            if (err) return console.log(err);

            return console.log(data.Deleted.length);
        });
    });
};
exports.uploadProfilePhoto = function(data, callback) {
    var bucketName = data.instagramId;
    createProfileBucketFun(bucketName, data.profilePhoto, function(error, result) {
        callback(null, result);
    });
};
var createProfileBucketFun = function(bucketName, photo, callback) {
  request(s3.createBucket({
        Bucket: bucketName
    }, function() {
        var urlArray = [];
        var keyName = photo;
        var keyNameFile = keyName.split('/');
        keyNameFile = keyNameFile.reverse()[0];
        if(keyNameFile.indexOf('profile%2F') != -1){
          keyNameFile = keyNameFile.slice(9);
        }
        download(keyName, keyNameFile, bucketName, 'profile', function(error, url) {
            if (error) {
                console.log(error);
            } else {
                callback(null, url);
            }
        });
    })).on('success', function(response) {

    });
};
