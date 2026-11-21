const { performance } = require('perf_hooks');

const N = 300_000;
const arr = Array.from({ length: N }, (_, i) => i + 1);

// --- замер только этапа подсчёта ---
const start = performance.now();

let count = 0;
for (let i = 0; i < arr.length; i++) {
	if (arr[i] % 3 === 0) count++;
}

const end = performance.now();

console.log('Линейный подход');
console.log('Элементов в массиве:', arr.length);
console.log('Делятся на 3 без остатка:', count);
console.log(`Время подсчёта: ${(end - start).toFixed(4)} мс`);
