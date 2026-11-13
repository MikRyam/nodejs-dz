'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const { parseTime, MAX_DELAY } = require('./parse-time');

const HOUR = 3_600_000;
const MINUTE = 60_000;
const SECOND = 1000;

// ---------- успешные разборы ----------

test('одно число — это секунды', () => {
  assert.equal(parseTime(['5']), 5 * SECOND);
  assert.equal(parseTime(['0']), 0);
});

test('формат из задания: 1h 5m 10s', () => {
  assert.equal(parseTime(['1h', '5m', '10s']), HOUR + 5 * MINUTE + 10 * SECOND);
});

test('слитный формат: 1ч5м', () => {
  assert.equal(parseTime(['1ч5м']), HOUR + 5 * MINUTE);
  assert.equal(parseTime(['10м30с']), 10 * MINUTE + 30 * SECOND);
});

test('формат с пробелами: 1 час 5 минут 10 секунд', () => {
  assert.equal(
    parseTime(['1', 'час', '5', 'минут', '10', 'секунд']),
    HOUR + 5 * MINUTE + 10 * SECOND
  );
});

test('регистр не важен', () => {
  assert.equal(parseTime(['1', 'ЧАС']), HOUR);
  assert.equal(parseTime(['1H']), HOUR);
});

test('дробные значения и запятая', () => {
  assert.equal(parseTime(['1.5ч']), 90 * MINUTE);
  assert.equal(parseTime(['1,5', 'часа']), 90 * MINUTE);
  assert.equal(parseTime(['0.5с']), 500);
});

test('несколько пар суммируются', () => {
  assert.equal(parseTime(['2ч', '3м', '4с']), 2 * HOUR + 3 * MINUTE + 4 * SECOND);
});

// ---------- ошибки ----------

test('пустой ввод', () => {
  assert.throws(() => parseTime([]), /не задано время/);
});

test('число без единицы', () => {
  assert.throws(() => parseTime(['5', '6']), /не указана единица измерения/);
});

test('единица без числа', () => {
  assert.throws(() => parseTime(['час']), /не указано число/);
});

test('хвост без единицы', () => {
  assert.throws(() => parseTime(['1', 'час', '5']), /не удалось разобрать "5"/);
});

test('неизвестная единица', () => {
  assert.throws(() => parseTime(['1', 'неделя']), /неизвестная единица измерения "неделя"/);
});

test('отрицательное значение', () => {
  assert.throws(() => parseTime(['-5']), /не может быть отрицательным/);
});

test('не число', () => {
  assert.throws(() => parseTime(['abc']), /не удалось разобрать/);
  assert.throws(() => parseTime(['Infinity']), /не удалось разобрать/);
});

test('превышение предела setTimeout', () => {
  assert.throws(() => parseTime(['9999999']), /превышает максимум setTimeout/);
  assert.equal(MAX_DELAY, 2_147_483_647);
});
