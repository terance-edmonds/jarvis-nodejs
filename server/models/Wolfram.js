'use strict';

const WolframClient = require('node-wolfram');

var wolframRequest = new WolframClient('<wolfram_api_id>');

function wolfram(message, callback) {
    var onNoDataList = [
        'Sir! , I found nothing on that.',
        'I found nothing of that Sir.',
        "I've found nothing on that Sir",
        "I couldn't find anthing about that Sir."
    ];
    var onDataList = [
        "Here's some details that I found Sir.",
        "Here's some details that I found.",
        'its all displayed on the screen Sir.',
        "Here's what I found.",
        "Here's what I found Sir."
    ];

    wolframRequest.query(message, (err, result) => {
        if (err) {
            console.log(err);
        }

        let numpod = parseInt(result.queryresult['$'].numpods);
        if (numpod == 0) {
            callback({
                event: 'speech',
                speech: onNoDataList[Math.floor(Math.random() * onNoDataList.length)]
            });
        } else {
            var Data = [];
            result.queryresult.pod.forEach((podData) => {
                podData.subpod.forEach((subpodData) => {
                    subpodData.img.forEach((imgData) => {
                        Data.push({
                            title: podData['$'].title,
                            image: imgData['$'].src,
                            plaintext: imgData['$'].title
                        });
                    });
                });
            });

            callback({
                event: 'wolfram',
                speech: onDataList[Math.floor(Math.random() * onDataList.length)],
                data: Data
            });
        }
    });

    console.log('Wolfram Support complete.');
}

module.exports = wolfram;
