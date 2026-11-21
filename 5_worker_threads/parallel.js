// 5_worker_threads/parallel.js
const { Worker } = require('worker_threads');
const os = require('os');
const { performance } = require('perf_hooks');
const path = require('path');

const N = 300_000;
const arr = Array.from({ length: N }, (_, i) => i + 1);

// число кусков: аргумент командной строки или число ядер
const parts = Number(process.argv[2]) || os.cpus().length;

// --- нарезка на куски, остаток распределяем по первым кускам ---
function splitArray(source, parts) {
	const chunks = [];
	const base = Math.floor(source.length / parts);
	const remainder = source.length % parts;

	let offset = 0;
	for (let i = 0; i < parts; i++) {
		const size = base + (i < remainder ? 1 : 0);
		chunks.push(source.slice(offset, offset + size));
		offset += size;
	}
	return chunks;
}

const chunks = splitArray(arr, parts);

function runWorker(chunk) {
	return new Promise((resolve, reject) => {
		const worker = new Worker(path.join(__dirname, 'worker.js'), {
			workerData: { chunk },
		});
		worker.once('message', resolve);
		worker.once('error', reject);
	});
}

async function main() {
	// --- замер только этапа подсчёта: от запуска воркеров до сбора ответов ---
	const start = performance.now();

	const counts = await Promise.all(chunks.map(runWorker));
	const total = counts.reduce((sum, c) => sum + c, 0);

	const end = performance.now();

	console.log('Многопоточный подход');
	console.log('Ядер (кусков):', parts);
	console.log('Размеры кусков:', chunks.map((c) => c.length).join(', '));
	console.log('Делятся на 3 без остатка:', total);
	console.log(`Время подсчёта: ${(end - start).toFixed(4)} мс`);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
