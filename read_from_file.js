// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

// Copyright (c) 2018 Alexandre Storelli
const net = require('net');
const client = new net.Socket();
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


const lineReader = require('readline').createInterface({
	input: require('fs').createReadStream('log.txt')
});
const Codegen = require("./codegen_landmark.js");
const { timeStamp } = require("console");
const fingerprinter = new Codegen();
let FingerPrintsPairs = 5;
let fingerprintArray = [];
let TCPwasSend = true;

process.stdin.pipe(decoder.stdin); //.write(data);
decoder.stdout.pipe(fingerprinter);

function pushToArray() {
	lineReader.on('line', function (line) {
		fingerprintArray.push(line)
		// console.log(fingerprintArray)
	});
}

function main() {

	pushToArray();
	FingerPrintsPairs = 0
	fingerprinter.on("data", function (data) {
		for (let i = 0; i < data.tcodes.length; i++) {

			if (fingerprintArray.indexOf(data.hcodes[i].toString()) > -1) {

				console.log(data.hcodes[i]);
				FingerPrintsPairs++
				console.log(FingerPrintsPairs);

				setTimeout(function () {
					FingerPrintsPairs = 0;
				}, 5000);

				if (FingerPrintsPairs === 10 && TCPwasSend) {

					console.log(TCPwasSend);
					
					setTimeout(function () {
						client.connect(PORT, 'IP', function () {
							console.log('Connected');
							client.write('API\r\n');

						client.on('data', function (data) {
							console.log('Received: ' + data);
							client.destroy();
						});
						
						client.on('close', function () {
							console.log('Connection closed');
						});

						FingerPrintsPairs = 0;
						TCPwasSend = false;
						console.log('onclose: ' + FingerPrintsPairs + ' ' + TCPwasSend);

						setTimeout(function () {
							TCPwasSend = true;
							console.log(TCPwasSend);
						}, 40000);

					}, 33200);

				}

			}

		}

	})
}

fingerprinter.on("end", function () {
	console.log("fingerprints stream ended");
});

main();







