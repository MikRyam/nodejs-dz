'use strict';

const path = require('node:path');
const { spawn } = require('node:child_process');
const notifier = require('node-notifier');

const ICON_PATH = path.join(__dirname, 'assets', 'timer.png');

const SECONDS_PER_MINUTE = 60;
const MINUTES_PER_HOUR = 60;
const SECONDS_PER_HOUR = MINUTES_PER_HOUR * SECONDS_PER_MINUTE;
const MS_PER_SECOND = 1000;

/**
 * Выбирает форму русского слова для числа.
 */
function pluralize(n, one, few, many) {
  const mod10 = n % 10;
  const mod100 = n % 100;

  if (mod10 === 1 && mod100 !== 11) {
    return one;
  }

  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return few;
  }

  return many;
}

/**
 * Превращает длительность в человекочитаемую строку.
 *
 * 0        → «0 секунд»
 * 90_000   → «1 минута 30 секунд»
 * 3_600_000 → «1 час»
 */
function formatDuration(ms) {
  const totalSeconds = Math.max(0, Math.round(ms / MS_PER_SECOND));

  const hours = Math.floor(totalSeconds / SECONDS_PER_HOUR);
  const minutes = Math.floor((totalSeconds % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE);
  const seconds = totalSeconds % SECONDS_PER_MINUTE;

  const parts = [];

  if (hours > 0) {
    parts.push(`${hours} ${pluralize(hours, 'час', 'часа', 'часов')}`);
  }

  if (minutes > 0) {
    parts.push(`${minutes} ${pluralize(minutes, 'минута', 'минуты', 'минут')}`);
  }

  if (seconds > 0 || parts.length === 0) {
    parts.push(`${seconds} ${pluralize(seconds, 'секунда', 'секунды', 'секунд')}`);
  }

  return parts.join(' ');
}

/**
 * На Linux node-notifier не проигрывает звук, поэтому зовём системный
 * проигрыватель. Ошибки намеренно игнорируются: звук — необязательная часть.
 */
function playAlarmSound() {
  if (process.platform !== 'linux') {
    return;
  }

  try {
    const child = spawn('canberra-gtk-play', ['-i', 'alarm-clock-elapsed'], {
      stdio: 'ignore',
      detached: true,
    });

    child.on('error', () => {});
    child.unref();
  } catch {
    // Проигрывателя нет — просто обойдёмся без звука.
  }
}

/**
 * Показывает системное уведомление о завершении таймера.
 *
 * @param {number} durationMs длительность, которую отсчитывал таймер
 * @param {object} [options]
 * @param {Function} [options.send] отправка уведомления (подменяется в тестах)
 * @param {Function} [options.playSound] проигрывание звука (подменяется в тестах)
 * @param {string} [options.icon] путь к иконке
 * @returns {Promise<void>}
 */
function notifyTimerDone(
  durationMs,
  {
    send = (...args) => notifier.notify(...args),
    playSound = playAlarmSound,
    icon = ICON_PATH,
  } = {},
) {
  const message = `Отсчёт на ${formatDuration(durationMs)} завершён`;

  return new Promise((resolve, reject) => {
    send(
      {
        title: '⏰ Таймер сработал',
        message,
        icon, // Linux / Windows
        contentImage: icon, // macOS
        sound: true, // macOS / Windows, где поддерживается
        wait: false,
        timeout: 15,
      },
      (err, response) => {
        if (err) {
          reject(err);
          return;
        }

        playSound();
        resolve(response);
      },
    );
  });
}

module.exports = { notifyTimerDone, formatDuration };
