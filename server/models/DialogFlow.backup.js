'use strict';

const apiai = require('apiai');
const dateFormat = require('dateformat');
const youtube = require('./Youtube');
const wolfram = require('./Wolfram');

const app = apiai('<dialogflow_api_key>'); //apiai client token

const options = {
    sessionId: '<UNIQUE SESSION ID>'
};

function DialogFlow(message, callback) {
    try {
        var request = app.textRequest(message, options);
        request.on('response', function (response) {
            let speech = response.result.fulfillment.speech; //speech response
            let intentName = response.result.metadata.intentName; //intent name

            console.log(response);

            if (intentName == 'Default Fallback Intent') {
                console.log('Default Fallback Intent');
            } else if (intentName == 'Time') {
                let time = dateFormat(new Date(), 'h:MM TT');
                callback({
                    event: 'speech',
                    speech: speech + ' ' + time + ' ' + 'Sir'
                });
            } else if (intentName.includes('date')) {
                let day = dateFormat(new Date(), 'dS mmmm , yyyy');
                callback({
                    event: 'speech',
                    speech: speech + ' ' + day + ' ' + 'Sir'
                });
            } else if (intentName == 'DayofWeek') {
                let WeekOfTheDay = dateFormat(new Date(), 'dddd');
                callback({
                    event: 'speech',
                    speech: speech + ' ' + WeekOfTheDay + ' ' + 'Sir'
                });
                console.log('Api.ai support completed');
            } else if (
                intentName == 'smalltalk.greetings.goodmorning' ||
                intentName == 'smalltalk.greetings.goodafternoon' ||
                intentName == 'smalltalk.greetings.goodevening'
            ) {
                let date = new Date();
                let current_hour = date.getHours();

                if (intentName.includes('goodmorning') && current_hour >= 0 && current_hour < 12) {
                    callback({
                        event: 'speech',
                        speech: speech
                    });
                } else if (
                    intentName.includes('goodafternoon') &&
                    current_hour >= 12 &&
                    current_hour < 15
                ) {
                    callback({
                        event: 'speech',
                        speech: speech
                    });
                } else if (intentName.includes('goodevening') && current_hour >= 15) {
                    callback({
                        event: 'speech',
                        speech: speech
                    });
                } else {
                    let time = dateFormat(new Date(), 'h:MM TT');
                    callback({
                        event: 'speech',
                        speech: 'Sir? the time is ' + time
                    });
                }
            } else if (intentName == 'Mute Event') {
                callback({
                    event: 'mute',
                    speech: speech
                });
            } else if (intentName == 'music.play') {
                let song = response.result.parameters.song;
                let artist = response.result.parameters.artist;
                let genre = response.result.parameters.genre;

                if (song != '' && artist == '') {
                    youtube.youtubeVideo(song, speech, callback);
                } else if (song != '' && artist != '') {
                    let serach = song + ' by ' + artist;
                    youtube.youtubeVideo(serach, speech, callback);
                } else if (song == '' && artist != '') {
                    let serach = 'songs by' + artist;
                    youtube.youtubePlaylists(serach, speech, callback);
                } else if (song == '' && artist == '' && genre != '') {
                    youtube.youtubePlaylists(genre, speech, callback);
                } else {
                    youtube.youtubePlaylists('top english songs', speech, callback);
                }
            } else if (
                intentName == 'music_player_control.resume' ||
                intentName == 'music_player_control.play'
            ) {
                callback({
                    event: 'player.play',
                    speech: ''
                });
            } else if (intentName == 'music_player_control.pause') {
                callback({
                    event: 'player.pause',
                    speech: ''
                });
            } else if (intentName == 'music_player_control.stop') {
                callback({
                    event: 'player.stop',
                    speech: ''
                });
            } else if (intentName == 'music_player_control.skip_forward') {
                callback({
                    event: 'player.next',
                    speech: ''
                });
            } else if (intentName == 'music_player_control.skip_backward') {
                callback({
                    event: 'player.previous',
                    speech: ''
                });
            } else if (intentName == 'music.askname') {
                callback({
                    event: 'player.askevent',
                    speech: speech
                });
            } else if (intentName == 'volume.set') {
                let finalvalue = response.result.parameters.number;
                callback({
                    event: 'player.volumeup',
                    finalValue: parseInt(finalvalue)
                });
            } else if (intentName == 'volume.up') {
                let changevalue = response.result.parameters.changevalue;
                let finalvalue = response.result.parameters.finalvalue;

                if (changevalue != '') {
                    callback({
                        event: 'player.volumeup',
                        changeValue: parseInt(changevalue)
                    });
                } else if (finalvalue != '') {
                    if (finalvalue.includes('max')) {
                        callback({
                            event: 'player.volumeup',
                            finalValue: 100
                        });
                    } else {
                        callback({
                            event: 'player.volumeup',
                            finalValue: parseInt(finalvalue)
                        });
                    }
                } else {
                    callback({
                        event: 'player.volumeup',
                        changeValue: 5
                    });
                }
            } else if (intentName == 'volume.down') {
                let changevalue = response.result.parameters.changevalue;
                let finalvalue = response.result.parameters.finalvalue;

                if (changevalue != '') {
                    callback({
                        event: 'player.volumedown',
                        changeValue: parseInt(changevalue)
                    });
                } else if (finalvalue != '') {
                    callback({
                        event: 'player.volumedown',
                        finalValue: parseInt(finalvalue)
                    });
                } else {
                    callback({
                        event: 'player.volumedown',
                        changeValue: 5
                    });
                }
            } else if (intentName == 'smalltalk.appraisal.thank_you') {
                callback({
                    event: 'mute',
                    speech: speech
                });
            } else if (intentName.includes('wolfram')) {
                wolfram(response.result.resolvedQuery, callback);
            } else if (intentName == 'ClearInfoScreen') {
                callback({
                    event: 'clearInfoScreen',
                    speech: ''
                });
            } else {
                callback({
                    event: 'speech',
                    speech: speech
                });
            }

            console.log('Api.ai support completed');
        });

        request.on('error', function (error) {
            console.log(error);
        });

        request.end();
    } catch (error) {
        console.log(error);
    }
}

module.exports = DialogFlow;
