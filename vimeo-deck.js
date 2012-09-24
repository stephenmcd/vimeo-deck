
// vimeo-deck.js by Stephen McDonald (@stephen_mcd)
//
// See https://github.com/stephenmcd/vimeo-deck/ for
// documentation, usage and license.


var VimeoDeck = function(options) {

    var slides = []; // Maps slide numbers to video seconds
    var toc = [];    // A list of title/time objects for the table of contents
    var speakerDeck; // Speakerdeck API object
    var last;        // Stores the last slide set to avoid extra calls

    var self = this;
    options = options || {};
    self.onTocLoaded = options.onTocLoaded || function() {}
    self.onSlideChanged = options.onSlideChanged || function() {}

    // Sets the video time for a slide number. When the video
    // reaches that point in time, the current slide will be
    // set to the corresponding slide.
    //
    // The time arg can either be a string in 'mm:ss' format, or
    // an integer representing total seconds.
    //
    // An optional title arg can also be supplied, which will be
    // used to generate links in the table of contents.
    self.setSlide = function(slide, time, tocTitle) {
        time = String(time).split(':');
        switch (time.length) {
            case 2:
                time = Number(time[0] * 60) + Number(time[1]);
                break;
            case 1:
                time = Number(time[0]);
                break;
        }
        slides[slide] = time;
        if (options.tocID && tocTitle) {
            toc[toc.length] = {time: time, title: tocTitle};
        }
    };

    // Binds the speakerdeck API object to our own variable.
    window.onSpeakerDeckPlayerReady = function(s) {
        speakerDeck = s;
    };

    // Callback handler for progress of the video being played.
    // Looks up the matching slide for the current point in time,
    // and sets it.
    var onPlayProgress = function(seconds) {
        for (var i = 1; i < slides.length; i++) {
            var next = i == slides.length - 1 ? null : slides[i + 1];
            if (seconds > slides[i] && (!next || seconds < next)) {
                if (i != last) {
                    speakerDeck.goToSlide(i);
                    self.onSlideChanged(i);
                }
                last = i;
                break;
            }
        }
    };

    // Generates the table of contents.
    var loadToc = function(playerID) {
        var tocUL = $(options.tocID);
        for (var i = 0; i < toc.length; i++) {
            var id = 'toc' + i;
            tocUL.append($('<li><a id="' + id + '" href="#">' +
                           toc[i].title + '</li>'));
            $('#' + id).click(function() {
                var i = $(this).attr('id').replace('toc', '');
                post('seekTo', toc[i].time, playerID);
                return false;
            });
        }
        self.onTocLoaded();
    };

    // Makes a call to the Vimeo API. Used for subscribing to the
    // playProgress event, and for seeking to points in the video
    // when links in the table of contents are clicked.
    var post = function(method, value, playerID) {
        var frame = $('#' + playerID)[0];
        frame.contentWindow.postMessage(JSON.stringify({
            method: method,
            value: value
        }), frame.src.split('?')[0]);
    };

    // Callback handler for the Vimeo API. When the 'ready' event is
    // triggered, we subscribe to the 'playProgress' event and load
    // the table of contents if configured to do so.
    var onMessageReceived = function(e) {
        var data = JSON.parse(e.data);
        switch (data.event) {
            case 'ready':
                post('addEventListener', 'playProgress', data.player_id);
                if (toc.length > 0) {
                    loadToc(data.player_id);
                }
                break;
            case 'playProgress':
                onPlayProgress(Math.round(data.data.seconds));
                break;
        }
    };

    // Bind the Vimeo API event handler.
    if (window.addEventListener) {
        window.addEventListener('message', onMessageReceived, false);
    } else {
        window.attachEvent('onmessage', onMessageReceived, false);
    }

    return self;

};
