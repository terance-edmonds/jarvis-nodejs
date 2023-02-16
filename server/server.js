'use strict';

`
 __       __  ________  __         ______    ______   __       __  ________        ________  ________  _______    ______   __    __   ______   ________ 
/  |  _  /  |/        |/  |       /      \  /      \ /  \     /  |/        |      /        |/        |/       \  /      \ /  \  /  | /      \ /        |
$$ | / \ $$ |$$$$$$$$/ $$ |      /$$$$$$  |/$$$$$$  |$$  \   /$$ |$$$$$$$$/       $$$$$$$$/ $$$$$$$$/ $$$$$$$  |/$$$$$$  |$$  \ $$ |/$$$$$$  |$$$$$$$$/ 
$$ |/$  \$$ |$$ |__    $$ |      $$ |  $$/ $$ |  $$ |$$$  \ /$$$ |$$ |__             $$ |   $$ |__    $$ |__$$ |$$ |__$$ |$$$  \$$ |$$ |  $$/ $$ |__    
$$ /$$$  $$ |$$    |   $$ |      $$ |      $$ |  $$ |$$$$  /$$$$ |$$    |            $$ |   $$    |   $$    $$< $$    $$ |$$$$  $$ |$$ |      $$    |   
$$ $$/$$ $$ |$$$$$/    $$ |      $$ |   __ $$ |  $$ |$$ $$ $$/$$ |$$$$$/             $$ |   $$$$$/    $$$$$$$  |$$$$$$$$ |$$ $$ $$ |$$ |   __ $$$$$/    
$$$$/  $$$$ |$$ |_____ $$ |_____ $$ \__/  |$$ \__$$ |$$ |$$$/ $$ |$$ |_____          $$ |   $$ |_____ $$ |  $$ |$$ |  $$ |$$ |$$$$ |$$ \__/  |$$ |_____ 
$$$/    $$$ |$$       |$$       |$$    $$/ $$    $$/ $$ | $/  $$ |$$       |         $$ |   $$       |$$ |  $$ |$$ |  $$ |$$ | $$$ |$$    $$/ $$       |
$$/      $$/ $$$$$$$$/ $$$$$$$$/  $$$$$$/   $$$$$$/  $$/      $$/ $$$$$$$$/          $$/    $$$$$$$$/ $$/   $$/ $$/   $$/ $$/   $$/  $$$$$$/  $$$$$$$$/ 
                                                                                                                                                        
`;

require('dotenv');
const express = require('express');
const app = express();
const bodyparser = require('body-parser');
const DialogFlow = require('./models/DialogFlow');
const Calender = require('./models/Calendar/Calendar');

app.use(express.static('../client'));
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());
app.use(bodyparser.text());

app.post('/server', (req, res) => {
    getResponse(req.body.message, (response) => {
        res.json({
            data: response
        });
    });
});

app.post('/initial', (req, res) => {
    Calender(req.body.message, (response) => {
        res.json({
            data: response
        });
    });
});

var JarvisResponse = ['yes Sir?', 'Sir?'];

function getResponse(message, callback) {
    try {
        if (message == 'jarvis') {
            callback({
                event: 'speech',
                speech: JarvisResponse[Math.floor(Math.random() * JarvisResponse.length)]
            });
        } else if (message.includes('jarvis')) {
            let filteredMessage = message.replace('jarvis', '');
            DialogFlow(filteredMessage, callback);
        } else {
            //send the request to  dialogflow
            DialogFlow(message, callback);
        }
    } catch (error) {
        console.log(error);
    }
}

//Listen to the localhost
app.listen(9000, function () {
    console.log('Systems Online');
});
