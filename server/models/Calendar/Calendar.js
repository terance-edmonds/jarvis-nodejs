const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = './models/Calendar/token.json';

function Calendar(message, callback) {
    // Load client secrets from a local file.
    fs.readFile('./models/Calendar/credentials.json', (err, content) => {
        if (err) return console.log('Error loading client secret file:', err);
        // Authorize a client with credentials, then call the Google Calendar API.
        authorize(JSON.parse(content), listEvents);
    });

    function authorize(credentials, callback) {
        const { client_secret, client_id, redirect_uris } = credentials.web;
        const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

        // Check if we have previously stored a token.
        fs.readFile(TOKEN_PATH, (err, token) => {
            if (err) return getAccessToken(oAuth2Client, callback);
            oAuth2Client.setCredentials(JSON.parse(token));
            callback(oAuth2Client);
        });
    }

    function getAccessToken(oAuth2Client, callback) {
        const authUrl = oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: SCOPES
        });
        console.log('Authorize this app by visiting this url:', authUrl);
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        rl.question('Enter the code from that page here: ', (code) => {
            rl.close();
            oAuth2Client.getToken(code, (err, token) => {
                if (err) return console.error('Error retrieving access token', err);
                oAuth2Client.setCredentials(token);
                // Store the token to disk for later program executions
                fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                    if (err) return console.error(err);
                    console.log('Token stored to', TOKEN_PATH);
                });
                callback(oAuth2Client);
            });
        });
    }

    function listEvents(auth) {
        const calendar = google.calendar({ version: 'v3', auth });
        calendar.events.list(
            {
                calendarId: 'primary',
                timeMin: new Date().toISOString(),
                maxResults: 250,
                singleEvents: true,
                orderBy: 'startTime'
            },
            (err, res) => {
                if (err) return console.log('The API returned an error: ' + err);
                const events = res.data.items;

                if (events.length) {
                    var eventList = [];

                    if (message.event == 'initial calendar') {
                        events.forEach((event, i) => {
                            if (
                                event.start.dateTime != undefined &&
                                event.start.dateTime.split('T')[0] == message.date
                            ) {
                                let startDateTime = event.start.dateTime.split('T');
                                let endDateTime = event.end.dateTime.split('T');
                                eventList.push({
                                    name: event.summary,
                                    date: {
                                        start: startDateTime[0],
                                        end: endDateTime[0]
                                    },
                                    time: {
                                        start: startDateTime[1].split('+')[0],
                                        end: endDateTime[1].split('+')[0]
                                    }
                                });
                            } else if (event.start.date == message.date) {
                                eventList.push({
                                    name: event.summary,
                                    date: {
                                        start: event.start.date,
                                        end: event.end.date
                                    },
                                    time: null
                                });
                            }
                        });
                    }

                    callback({
                        event: message.event,
                        data: eventList
                    });

                    //write all events to event.json
                    /*           fs.writeFile('events.json', JSON.stringify(eventList), (err) => {
            if (err) return console.error(err);
            console.log('events stored to events.txt');
          }); */
                } else {
                    callback({
                        event: message.event,
                        data: null
                    });
                    /*           fs.writeFile('events.json', JSON.stringify(null), (err) => {
            if (err) return console.error(err);
            console.log('No upcoming events found.');
          }); */
                }
            }
        );
    }
}

module.exports = Calendar;
