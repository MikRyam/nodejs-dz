'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const { parseTime } = require('../parse-time');

test('одно число без единицы — это секунды', () => {
  assert.equal(parseTime(['5']), 5000);
});

test('составной русский формат', () => {
  assert.equal(parseTime(['1', 'час', '5', 'минут', '10', 'секунд']), 3_600_000 + 300_000 + 10_000);
});

test('слитная запись и десятичная запятая', () => {
  assert.equal(parseTime(['1ч', '2м', '3,5с']), 3_600_000 + 120_000 + 3500);
});

test('формат часов ч:м:с', () => {
  assert.equal(parseTime(['01:05:10']), 3_600_000 + 300_000 + 10_000);
});

test('формат часов м:с', () => {
  assert.equal(parseTime(['05:10']), 310_000);
});

test('английские единицы', () => {
  assert.equal(parseTime(['1hour', '2minutes', '3seconds']), 3_600_000 + 120_000 + 3000);
});

test('пустой ввод — ошибка', () => {
  assert.throws(() => parseTime([]), /не задано время/);
});

test('неизвестная единица — ошибка', () => {
  assert.throws(() => parseTime(['5', 'парашютов']), /неизвестная единица/);
});

test('пропущенная единица — ошибка', () => {
  assert.throws(() => parseTime(['1', 'час', '5']), /не удалось разобрать время/);
});

test('отрицательное время — ошибка', () => {
  assert.throws(() => parseTime(['-5']), /не может быть отрицательным/);
});

test('слишком много секунд в формате часов — ошибка', () => {
  assert.throws(() => parseTime(['01:05:99']), /секунд не может быть больше 59/);
});
