'use strict';
var Stream = require('./stream.js');

// function binaryIndexOf(histack, needle) {
//     var minIndex = 0;
//     var maxIndex = histack.length - 1;
//     var currentIndex;
//     var currentElement;
 
//     while (minIndex <= maxIndex) {
//         currentIndex = (minIndex + maxIndex) / 2 | 0;
//         currentElement = histack[currentIndex];
 
//         if (currentElement < needle) {
//             minIndex = currentIndex + 1;
//         }
//         else if (currentElement > needle) {
//             maxIndex = currentIndex - 1;
//         }
//         else {
//             return currentIndex;
//         }
//     }
// 	return currentIndex;
// }

function SliceStream(options, transmuxer) {
	SliceStream.prototype.init.call(this);
	var keepTrack = tracksToKeep.bind(null, options.skipTracks || []);

	this.segNo = options.startSegment || 0;
	this.started = true;

	this.reset = function() {
		this.endAt = options.keyFrames[this.segNo];
	};

	this.reset();

	this.push = function(output) {
		if(output.type === 'video') {
			var videoTime = output.dts;
			if(videoTime >= this.endAt) {
				// Simple test if we count the segments correct
				// var segNo = binaryIndexOf(options.keyFrames, videoTime);
				// if(segNo !== this.segNo) throw new Error('Expected segment '+this.segNo+' got '+segNo);
				transmuxer.flush();
			}
		}
		if( ! keepTrack(output)) return;
		if(output.tracks) {
			output.tracks = output.tracks.filter(keepTrack);
		}

		this.trigger('data', output);
	};
}

SliceStream.prototype = new Stream();

function tracksToKeep(types, track) {
	return types.indexOf(track.type) < 0;
}

SliceStream.prototype.flush = function(flushSource) {
	this.trigger('done', flushSource);
	this.segNo++;
	this.reset();
};

module.exports = SliceStream;
