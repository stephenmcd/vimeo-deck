Created by [Stephen McDonald](http://twitter.com/stephen_mcd)

`vimeo-deck` is a mashup of the [Speaker Deck](http://speakerdeck.com)
and [Vimeo](http://vimeo.com) APIs. It allows you to synchronize
presentations with videos, by exposing an API for defining which
slides should be shown at which points in time throughout the video.

As an added bonus, `vimeo-deck` can also optionally generate a
Table of Contents for you.

Check out my [SyDjango talk on django-forms-builder
](http://blog.jupo.org/2012/09/21/sydjango-talk-django-forms-builder/)
to see an example of `vimeo-deck` in action.

#### Setup

Here's a minimal setup. We include jQuery and vimeo-deck.js, and
the embed code for our video and presentation. You'll need to replace
`VIDEO_ID` and `PRESENTATION_ID`. The `<ol>` tag is optional, and
is used for populating the Table of Contents.

    <html>
        <head>
            <script src="jquery.js">
            <script src="vimeo-deck.js">
        </head>
        <body>
            <ol id="toc"></ol>
            <iframe id="vimeo" src="http://player.vimeo.com/video/VIDEO_ID?api=1&player_id=vimeo"></iframe>
            <script async class="speakerdeck-embed" data-id="PRESENTATION_ID" data-ratio="1.3333333333333333" src="//speakerdeck.com/assets/embed.js"></script>
        </body>
    </html>

Note that the Vimeo embed code contains a `player_id` argument - this
should contain the `id` attribute of the `iframe` tag, as required by
[Vimeo's API](http://developer.vimeo.com/player/js-api).

#### Usage

With the above setup, we can now create a `VimeoDeck` instance, and
define which slides should be shown after which points in time
throughout the video.

    <script>

        var options = {
            tocID: '#toc',
            onTocLoaded: function() {
                console.log('Table of contents is loaded');
            },
            onSlideChanged: function(slideNumber) {
                console.log('Video playback changed to slide #' + slideNumber);
            }
        };

        var vd = VimeoDeck(options); // Options are optional

        vd.setSlide(1, '0:00', 'Welcome');
        vd.setSlide(2, '0:10');
        vd.setSlide(3, '0:15');
        vd.setSlide(4, '0:22', 'First section');
        vd.setSlide(5, 94); // time can also be an integer for total seconds

    </script>

Here you can see the `setSlide` method used for defining the point in
time when each slide should be loaded. It accepts three arguments:

* `slide`: The slide number to define the time point for
* `time`: The point in time for the slide - can be a string in the
  format `minutes:seconds`, or an integer representing the time in
  total seconds
* `tocTitle`: Optional title used to create an entry in the table of
  contents - when defined, the link in the table of contents will
  move to the corresponding point in the video and presentation when
  clicked

You can also pass an object to the `setSlide` method if preferred:

    vd.setSlide({slide: 1, time: '00:12', tocTitle: 'My title'});

Finally, you can use the `setSlides` method which accepts an array of
slide objects, allowing all slide data to be stored in a single
variable if preferred:

    var slides = [
        {slide: 1, time: '00:12', tocTitle: 'My title'},
        {slide: 2, time: '00:17'},
        {slide: 3, time: '00:22'}
    ];
    vd.setSlides(slides);

#### Options

The `VimeoDeck` function accepts an optional object with various
named options.

* `tocID`: jQuery selector for the element that will contain the table
  of contents
* `onTocLoaded`: function that will be called when the table of contents
  is populated
* `onSlideChanged`: function that will be called when video playback
  causes the next slide to be loaded, and will be passed a single
  integer argument representing the slide that was loaded
