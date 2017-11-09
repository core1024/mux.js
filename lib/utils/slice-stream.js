'use strict';
var Stream = require('./stream.js');

function binaryIndexOf(histack, needle) {
    var minIndex = 0;
    var maxIndex = histack.length - 1;
    var currentIndex;
    var currentElement;
 
    while (minIndex <= maxIndex) {
        currentIndex = (minIndex + maxIndex) / 2 | 0;
        currentElement = histack[currentIndex];
 
        if (currentElement < needle) {
            minIndex = currentIndex + 1;
        }
        else if (currentElement > needle) {
            maxIndex = currentIndex - 1;
        }
        else {
            return currentIndex;
        }
    }
	return currentIndex;
}

function SliceStream(options, transmuxer) {
	SliceStream.prototype.init.call(this);
	var keepTrack = tracksToKeep.bind(null, options.skipTracks || []);

	this.segNo = options.startSegment || 0;
	this.startTime = options.keyFrames[this.segNo - 1] || 0;
	this.started = true;

	this.reset = function() {
		this.endAt = options.keyFrames[this.segNo];
	};

	this.reset();

	this.push = function(output) {
		// if(output.type === 'video') {
		if(typeof output.dts !== 'undefined') {
			var currentTime = output.dts;
			if(currentTime < this.startTime) {
				return;
			}
			if(currentTime >= this.endAt && output.type === 'video') {
				// Simple test if we count the segments correct
				//if(segNo !== this.segNo) throw new Error('Expected segment '+this.segNo+' got '+segNo);
				transmuxer.flush();
			}


			// var segNo = binaryIndexOf(options.keyFrames, videoTime);
			// if(lastSeg < 0) lastSeg = segNo;
			// console.log(output.type, videoTime, segNo)
			// if(segNo > lastSeg) {
			// 	lastSeg = segNo;
			// 	transmuxer.flush();
			// }
		}
		if( ! keepTrack(output)) return;
		if(output.tracks) {
			output.tracks = output.tracks.filter(keepTrack);
		}

		this.trigger('data', output);
	};
	this.flush = function(flushSource) {
		this.trigger('done', flushSource);
		this.segNo++;
		this.reset();
	};
}

SliceStream.prototype = new Stream();

function tracksToKeep(types, track) {
	return types.indexOf(track.type) < 0;
}


module.exports = SliceStream;
