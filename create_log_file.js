// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

// Copyright (c) 2018 Alexandre Storelli

const decoder = require('child_process').spawn('ffmpeg', [
	'-i', 'pipe:0',
	'-acodec', 'pcm_s16le',
	'-ar', 44100,
	'-ac', 1,
	'-f', 'wav',
	'-v', 'fatal',
	'pipe:1'
], { stdio: ['pipe', 'pipe', process.stderr] });
const fs = require('fs')
const logger = fs.createWriteStream('log.txt', {
  flags: 'a' // 'a' means appending (old data will be preserved)
})


process.stdin.pipe(decoder.stdin); //.write(data);

const Codegen = require("./codegen_landmark.js");
const fingerprinter = new Codegen();
decoder.stdout.pipe(fingerprinter);

function test (){
	fingerprinter.on("data", function(data) {
		for (let i=0; i<data.tcodes.length; i++) {
			// setTimeout(() => {  console.log("World!"); }, 10000);

			console.log("time=" + data.tcodes[i] + " fingerprint=" + data.hcodes[i]);

			logger.write(data.hcodes[i] + "\n")

		}
	});
}


fingerprinter.on("end", function() {
	console.log("fingerprints stream ended");
});


test();