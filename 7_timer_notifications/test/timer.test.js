'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const Timer = require('../timer');

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

test('срабатывает через заданное время', async () => {
  const startedAt = Date.now();

  await new Promise((resolve) => {
    const timer = new Timer(30);
    timer.on('done', resolve);
    timer.start();
  });

  assert.ok(Date.now() - startedAt >= 25, 'таймер сработал слишком рано');
});

test('stop отменяет срабатывание', async () => {
  let fired = false;

  const timer = new Timer(20);
  timer.on('done', () => {
    fired = true;
  });

  timer.start();
  timer.stop();

  await wait(60);

  assert.equal(fired, false);
  assert.equal(timer.running, false);
});

test('нулевая длительность срабатывает сразу', async () => {
  await new Promise((resolve) => {
    const timer = new Timer(0);
    timer.on('done', resolve);
    timer.start();
  });
});

test('отрицательная длительность — ошибка', () => {
  assert.throws(() => new Timer(-1), TypeError);
});
