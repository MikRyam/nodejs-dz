const { parentPort, workerData } = require('worker_threads');

const { chunk } = workerData;

let count = 0;
for (let i = 0; i < chunk.length; i++) {
	if (chunk[i] % 3 === 0) count++;
}

parentPort.postMessage(count);
