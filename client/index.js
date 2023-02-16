console.log(`

 __   __  ___     _______    ___         ______      ______     ___      ___     _______  
|"  |/  \|  "|   /"     "|  |"  |       /" _  "\    /    " \   |"  \    /"  |   /"     "| 
|'  /    \:  |  (: ______)  ||  |      (: ( \___)  // ____  \   \   \  //   |  (: ______) 
|: /'        |   \/    |    |:  |       \/ \      /  /    ) :)  /\\  \/.    |   \/    |   
 \//  /\'    |   // ___)_    \  |___    //  \ _  (: (____/ //  |: \.        |   // ___)_  
 /   /  \\   |  (:      "|  ( \_|:  \  (:   _) \  \        /   |.  \    /:  |  (:      "| 
|___/    \___|   \_______)   \_______)  \_______)  \"_____/    |___|\__/|___|   \_______) 
                                                                              

`);

//global variables
var mute = false;
var LastInteractTime;

window.addEventListener('keydown', keyCode);

//text mode
function keyCode(event) {
    let keyCode = event.keyCode;

    if (keyCode == 33) {
        document.getElementById('textbox').style.display = 'initial';
        document.getElementById('textbox').value = '';
        document.getElementById('textbox').select();
    } else if (keyCode == 34) {
        document.getElementById('textbox').style.display = 'none';
    } else if (
        keyCode == 13 &&
        document.getElementById('textbox').style.display == 'initial' &&
        document.getElementById('textbox').value != ''
    ) {
        postVoice(document.getElementById('textbox').value.toLowerCase());
    }
}

//connection status update
function updateConnectionStatus() {
    if (navigator.onLine) {
        document.getElementById('connection_status').style.display = 'initial';
        document.getElementById('connection_status').style.color = 'green';
        document.getElementById('connection_status').innerText = 'systems are online';
        document.getElementById('overlay_button').style.pointerEvents = 'all';
        setTimeout(() => {
            document.getElementById('connection_status').style.display = 'none';
            document.getElementById('think').style.display = 'initial';
        }, 2000);
    }
    if (navigator.onLine == false) {
        document.getElementById('think').style.display = 'none';
        document.getElementById('connection_status').style.display = 'initial';
        document.getElementById('connection_status').style.color = 'red';
        document.getElementById('connection_status').innerText = 'systems are offline';
        document.getElementById('overlay_button').style.pointerEvents = 'none';
    }
}

window.addEventListener('online', updateConnectionStatus);
window.addEventListener('offline', updateConnectionStatus);
updateConnectionStatus();

//check lastinteract time and now time difference
setInterval(() => {
    let minutes = 1000 * 60;
    let d = new Date();
    let nowTime = d.getTime();

    let nowTimeRounded = Math.round(nowTime / minutes);

    if (nowTimeRounded - LastInteractTime == 5) {
        handleMute(true);
    }
}, 7000);

//overlay control
function SystemInitialize() {
    document.getElementById('overlay_button').style.transform = 'translateY(30vh)';
    setTimeout(() => {
        document.getElementById('overlay_button').style.transform = 'translateY(-100vh)';
    }, 150);
    setTimeout(() => {
        document.getElementById('container_overlay').style.transform = 'translateX(100vw)';
        document.getElementById('container_overlay').style.background = 'transparent';
    }, 1000);
    setTimeout(() => {
        document.getElementById('container_overlay').style.display = 'none';
    }, 2000);
    say('welcome Sir!');
}

function handleMute(event) {
    if (event) {
        mute = true;
        document.getElementById('mute').style.display = 'initial';
    } else {
        mute = false;
        document.getElementById('mute').style.display = 'none';
    }
}

//youtube player
var currentPlaylistNumber;
var youtubePlaylist;

var tag = document.createElement('script');

tag.src = 'https://www.youtube.com/iframe_api';
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var player;
function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        height: '0',
        width: '0',
        videoId: '',
        events: {
            onReady: onPlayerReady,
            onStateChange: onPlayerStateChange
        }
    });
}

function onPlayerReady(event) {
    event.target.playVideo();
}

var YTFilterList = ['lyrics', 'official', 'music', 'video', '(', ')', 'lyric', '[', ']'];
function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.ENDED) {
        document.getElementById('youtubePlayerInfo').style.display = 'none';
        window.currentPlaylistNumber += 1;
        loadPlaylist();
    }

    if (player.getPlayerState() == YT.PlayerState.PLAYING) {
        document.getElementById('playerStatus').innerText = 'Now Playing ...';
        //filter the video title
        let NowVideoTitle = player.getVideoData().title.toLowerCase();
        for (videoTitleData of YTFilterList) {
            if (NowVideoTitle.includes(videoTitleData)) {
                NowVideoTitle = NowVideoTitle.replace(videoTitleData, '');
            }
        }
        document.getElementById('playerTitle').innerText = NowVideoTitle;

        document.getElementById('youtubePlayerInfo').style.display = 'initial';
    }

    if (player.getPlayerState() == YT.PlayerState.PAUSED) {
        document.getElementById('playerState').innerText = 'Paused';
    }
}

function loadVideo(videoId) {
    player.cueVideoById(videoId);
    player.playVideo();
}

function loadPlaylist() {
    player.cueVideoById(window.youtubePlaylist[window.currentPlaylistNumber]);
    player.playVideo();
}

function playerPlay() {
    player.playVideo();
}

function playerPause() {
    player.pauseVideo();
}

function playerStop() {
    player.stopVideo();
}

//speech recognition
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

recognition.addEventListener('result', handleRecognition);

function handleRecognition(event) {
    var transcript = Array.from(event.results)
        .map((result) => result[0])
        .map((result) => result.transcript)
        .join('');

    transcript = transcript.toLowerCase();

    if (event.results[0].isFinal) {
        if (mute) {
            console.log('Muted');
            if (transcript.includes('jarvis')) {
                handleMute(false);
                postVoice(transcript);
            }
        } else {
            postVoice(transcript);
        }
    }
}

recognition.addEventListener('end', recognition.start);
recognition.start();

//speech synthesis (https://responsivevoice.org/)
function say(response) {
    responsiveVoice.speak(response, 'UK English Male', {
        onstart: function () {
            mute = true;
        },
        onend: onSpeechEnd,
        rate: 1.05
    });
}

function onSpeechEnd() {
    if (player.getPlayerState() == YT.PlayerState.PLAYING) {
        handleMute(true);
    } else {
        setTimeout(() => {
            mute = false;
        }, 2000);
    }
}

//system initializing
function init() {
    //192.168.1.9:9000
    fetch('http://localhost:9000/initial', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            message: {
                event: 'initial calendar',
                date: new Date().toISOString().split('T')[0]
            }
        })
    })
        .then((response) => response.json())
        .then((ResponseData) => {
            let storage = window.localStorage;
            let data = ResponseData.data.data;

            storage.setItem('today', JSON.stringify(data));
        });
}

//timer
function timer() {
    let event = JSON.parse(window.localStorage.getItem('today'));

    let time = new Date();

    let hour = time.getHours();
    hour = hour > 9 ? hour : '0' + hour;
    let minutes = time.getMinutes();
    minutes = minutes > 9 ? minutes : '0' + minutes;
    let seconds = time.getSeconds();
    seconds = seconds > 9 ? seconds : '0' + seconds;

    if (hour == 00 && minutes == 00) {
        init();
    }

    if (event != null) {
        event.forEach((data) => {
            if (
                data.time != null &&
                data.time.start.split(':')[0] == hour &&
                data.time.start.split(':')[1] == minutes
            ) {
                console.log(data.name);
            }
        });
    }
}

init();

setInterval(() => {
    timer();
}, 1000);

//send a request to server
function postVoice(message) {
    console.log('message: ' + message);
    //192.168.1.9:9000
    fetch('http://localhost:9000/server', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            message: message
        })
    })
        .then((response) => response.json())
        .then((ResponseData) => {
            let event = ResponseData.data.event;
            let speech = ResponseData.data.speech;

            let minutes = 1000 * 60;
            let d = new Date();
            let nowTime = d.getTime();

            if (event != '') {
                //update the last interact time
                LastInteractTime = Math.round(nowTime / minutes);

                if (event == 'mute') {
                    handleMute(true);
                    responsiveVoice.cancel();
                } else if (event == 'wolfram') {
                    InfoLayout(true, ResponseData.data.data);
                } else if (event == 'clearInfoScreen') {
                    InfoLayout(false, null);
                } else if (event == 'music video player') {
                    loadVideo(ResponseData.data.videoId);
                    handleMute(true);
                } else if (event == 'music playlist player') {
                    window.currentPlaylistNumber = 0;
                    window.youtubePlaylist = ResponseData.data.playlist;
                    loadPlaylist();
                    handleMute(true);
                } else if (event.includes('player.')) {
                    if (event == 'player.play') {
                        playerPlay();
                    } else if (event == 'player.pause') {
                        playerPause();
                    } else if (event == 'player.stop') {
                        document.getElementById('youtubePlayerInfo').style.display = 'none';
                        playerStop();
                    } else if (event == 'player.next') {
                        window.currentPlaylistNumber += 1;
                        loadPlaylist();
                    } else if (event == 'player.previous') {
                        window.currentPlaylistNumber -= 1;
                        loadPlaylist();
                    } else if (event == 'player.askevent') {
                        if (
                            player.getPlayerState() == YT.PlayerState.PLAYING ||
                            player.getPlayerState() == YT.PlayerState.PAUSED
                        ) {
                            if (document.getElementById('playerTitle').innerHTML.includes('-')) {
                                let titleFilter = document
                                    .getElementById('playerTitle')
                                    .innerHTML.split('-');
                                let titleFilter_artist = titleFilter[0].replace(',', ' and ');
                                let filterdTitle =
                                    speech + ' ' + titleFilter[1] + ' by ' + titleFilter_artist;
                                speech = filterdTitle;
                            } else if (
                                document.getElementById('playerTitle').innerHTML.includes('|')
                            ) {
                                let titleFilter = document
                                    .getElementById('playerTitle')
                                    .innerHTML.split('|');
                                let filterdTitle =
                                    speech + ' ' + titleFilter[1] + ' by ' + titleFilter[0];
                                speech = filterdTitle;
                            } else {
                                speech =
                                    speech + ' ' + document.getElementById('playerTitle').innerHTML;
                            }

                            handleMute(true);
                        } else if (
                            player.getPlayerState() != YT.PlayerState.PLAYING ||
                            player.getPlayerState() != YT.PlayerState.PAUSED
                        ) {
                            speech = 'Right now no songs or musics are playing Sir!';
                        }
                    } else if (
                        event == 'player.volumeup' &&
                        (player.getPlayerState() == YT.PlayerState.PLAYING ||
                            player.getPlayerState() == YT.PlayerState.PAUSED)
                    ) {
                        let changeValue = ResponseData.data.changeValue;
                        let finalValue = ResponseData.data.finalValue;

                        if (changeValue != undefined) {
                            player.setVolume(player.getVolume() + changeValue);
                        } else if (finalValue != undefined) {
                            player.setVolume(finalValue);
                        }
                    } else if (
                        event == 'player.volumedown' &&
                        (player.getPlayerState() == YT.PlayerState.PLAYING ||
                            player.getPlayerState() == YT.PlayerState.PAUSED)
                    ) {
                        let changeValue = ResponseData.data.changeValue;
                        let finalValue = ResponseData.data.finalValue;

                        if (changeValue != undefined) {
                            player.setVolume(player.getVolume() - changeValue);
                        } else if (finalValue != undefined) {
                            player.setVolume(finalValue);
                        }
                    }
                }

                //if speech is not null do the talk
                if (speech != '') {
                    say(speech);
                }
            }
        });
}

//information layout
function InfoLayout(event, data) {
    let CenterContent = document.getElementById('center-content');
    let SideContent = document.getElementById('side-content');
    let MuteContent = document.getElementById('mute');
    let ThinkText = document.getElementById('think');
    let ConenctionText = document.getElementById('connection_status');

    SideContent.innerHTML = '';

    if (event) {
        CenterContent.style.marginLeft = '-45vw';
        MuteContent.style.right = '45vw';
        SideContent.style.marginRight = '0vw';

        if (window.innerWidth < 1024) {
            SideContent.style.display = 'initial';
            ThinkText.style.fontSize = '0.7rem';
            ConenctionText.style.fontSize = '0.7rem';
            ThinkText.style.marginLeft = '71vw';
            ConenctionText.style.fontSize = '71vw';
        }

        for (num in data) {
            let dataIn = data[parseInt(num)];

            if (dataIn.plaintext == '') {
                SideContent.innerHTML += `
                <p class="sideContentTitle">${dataIn.title} </p>
                <img class="sideContentImage" src="${dataIn.image}"/> `;
            } else {
                SideContent.innerHTML += `
                <p class="sideContentTitle">${dataIn.title} </p>
                <p class="sideContentPara"">${dataIn.plaintext}</p> `;
            }
        }
    } else {
        CenterContent.style.marginLeft = '0vw';
        SideContent.style.marginRight = '-50vw';
        MuteContent.style.right = '5vw';

        if (window.innerWidth < 1024) {
            SideContent.style.display = 'none';
            ThinkText.style.fontSize = '1rem';
            ConenctionText.style.fontSize = '1rem';
            ThinkText.style.marginLeft = '75vw';
            ConenctionText.style.fontSize = '75vw';
        }
    }
}
