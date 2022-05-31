import bluebird from 'bluebird';
const fs = bluebird.promisifyAll(require('fs'));
import cryptolib from 'crypto';
import path from 'path';
import { Folder } from './types';

const paths = process.argv.slice(2); // folder you're in, wherever that might be

const hashes: File[] = []; // where the magical hashes will be stored - but wait, that's not all, now also with file info!

// I dub this: promise hell! (or possibly this could just be done eons better, but well, it works...)
function hashDirIn(folder: Folder) {
	const pathPromiseA = fs.readdirAsync(folder).map((fileName: string) => {
		const workPath = path.join(folder.name, fileName);
		const statPromise = fs.statAsync(workPath);
		
		return bluebird.join(statPromise, fileName, (statPromise, fileName) => {
			
			if(statPromise.isFile()) {

				

				function process(stream) {
					const hash = cryptolib.createHash('md5'); 
					return new Promise(function(resolve, reject) {
						stream.on('data', function updateProcess(chunk) {
							hash.update(chunk, 'utf8');
						});
						stream.on('end', resolve);
					}).then(function publish() {
						const digest = hash.digest('hex');
						hashes.push({digest:digest, path:workPath});
					});
				}

				return makeStream(fileName, process);

			} // endif :p

		});

	}).then(function(){
		// sort and display dupes
		if(i==1) {
			hashes.sort(function(a, b) {
				if (a.digest < b.digest) {
					return -1;
				}
				if (a.digest > b.digest) {
					return 1;
				}
				return 0;
			});
			let dupe = 1;
			hashes.map(function(obj, index) {
				// note: currently this won't deal gracefully with more than two equal files at a time, though it will find them all (gotta find them all!)
				if (index-1 >= 0) {
					if(obj.digest == hashes[index-1].digest) {
						console.log("Dupe "+dupe+" found:");
						console.log(obj.path);
						console.log("Equal to:")
						console.log(hashes[index-1].path+"\n");
						dupe++;
					}
				}
			});
		}
		i++; // why do I feel this is cheating?
	});
}
let i = 0;
hashDirIn(paths[0]);
hashDirIn(paths[1]);
// but how to check both concurrently instead of one after the other? Ah well, it's late and my bottle of Ileach is soon empty...