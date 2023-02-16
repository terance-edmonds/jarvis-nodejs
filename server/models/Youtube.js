'use strict';

const youtubeScrapper = require('scrape-youtube').default;
const { scrapePlaylist } = require('youtube-playlist-scraper');

function youtubeVideo(message, speech, callback) {
    console.log(message);
    youtubeScrapper.search(message, { type: 'video' }).then((results) => {
        callback({
            event: 'music video player',
            speech: speech,
            videoId: results.videos[0].id
        });
    });

    console.log('youtube player started.');
}

function youtubePlaylists(message, speech, callback) {
    youtubeScrapper.search(message + ' playlist', { type: 'playlist' }).then((results) => {
        let playlist = results.playlists[Math.floor(Math.random() * results.playlists.length)];

        async function getPlaylist(id) {
            var videoList = [];
            const data = await scrapePlaylist(id);
            data.playlist.forEach((playlistData) => {
                videoList.push(playlistData.id);
            });
            callback({
                event: 'music playlist player',
                speech: speech,
                playlist: videoList
            });
        }

        getPlaylist(playlist.id);
    });

    console.log('youtube playlist player started.');
}

module.exports = {
    youtubeVideo,
    youtubePlaylists
};
