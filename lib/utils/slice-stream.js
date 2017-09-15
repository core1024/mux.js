const Stream = require('./stream.js');

SliceStream = function(options, transmuxer) {
	this.segNo = options.startSegment || 0;
	this.started = true;

	SliceStream.prototype.init.call(this);

	this.reset = function() {
		this.startAt = 0;
		this.endAt = options.keyFrames[this.segNo];
	};

	this.reset();
	
	
	this.push = function(output) {
		if(output.type === 'video') {
			var videoTime = output.dts;
			if(videoTime >= this.endAt) {
				console.log('Sliced segment', output.type, videoTime, this.endAt);
				transmuxer.flush();
			}
		}
		this.trigger('data', output);
	};
}

SliceStream.prototype = new Stream();

SliceStream.prototype.flush = function(flushSource) {
	this.trigger('done', flushSource);
	this.segNo++;
	this.reset();
};

module.exports = SliceStream;