'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { notifyTimerDone, formatDuration } = require('../notify');

const ICON_PATH = path.join(__dirname, '..', 'assets', 'timer.png');

test('formatDuration: ноль секунд', () => {
  assert.equal(formatDuration(0), '0 секунд');
});

test('formatDuration: секунды', () => {
  assert.equal(formatDuration(5_000), '5 секунд');
  assert.equal(formatDuration(1_000), '1 секунда');
  assert.equal(formatDuration(22_000), '22 секунды');
});

test('formatDuration: минуты и секунды', () => {
  assert.equal(formatDuration(90_000), '1 минута 30 секунд');
  assert.equal(formatDuration(150_000), '2 минуты 30 секунд');
  assert.equal(formatDuration(300_000), '5 минут');
});

test('formatDuration: часы', () => {
  assert.equal(formatDuration(3_600_000), '1 час');
  assert.equal(formatDuration(7_200_000), '2 часа');
  assert.equal(formatDuration(18_000_000), '5 часов');
  assert.equal(formatDuration(5_400_000), '1 час 30 минут');
  assert.equal(formatDuration(3_665_000), '1 час 1 минута 5 секунд');
});

test('formatDuration: отрицательное значение не ломает вывод', () => {
  assert.equal(formatDuration(-1000), '0 секунд');
});

test('notifyTimerDone отправляет системное уведомление', async () => {
  let options;
  let soundPlayed = false;

  const result = await notifyTimerDone(90_000, {
    send: (opts, callback) => {
      options = opts;
      callback(null, 'shown');
    },
    playSound: () => {
      soundPlayed = true;
    },
  });

  assert.equal(result, 'shown');
  assert.equal(options.title, '⏰ Таймер сработал');
  assert.equal(options.message, 'Отсчёт на 1 минута 30 секунд завершён');
  assert.equal(options.icon, ICON_PATH);
  assert.equal(options.contentImage, ICON_PATH);
  assert.equal(options.sound, true);
  assert.equal(soundPlayed, true);
});

test('notifyTimerDone передаёт ошибку демона уведомлений', async () => {
  await assert.rejects(
    notifyTimerDone(1_000, {
      send: (opts, callback) => callback(new Error('нет демона уведомлений')),
      playSound: () => {},
    }),
    /нет демона уведомлений/,
  );
});

test('иконка уведомления существует', () => {
  assert.equal(fs.existsSync(ICON_PATH), true);
});
