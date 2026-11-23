'use strict';

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawn } = require('node:child_process');
const notifier = require('node-notifier');

const ICON_PATH = path.join(__dirname, 'assets', 'timer.png');

const SOUND_EVENT = 'alarm-clock-elapsed';
const SOUND_EXTENSIONS = ['oga', 'ogg', 'wav'];
const DEFAULT_SOUND_FILES = [
  '/usr/share/sounds/freedesktop/stereo/alarm-clock-elapsed.oga',
  '/usr/share/sounds/freedesktop/stereo/alarm-clock-elapsed.ogg',
  '/usr/share/sounds/ubuntu/stereo/alarm-clock-elapsed.oga',
  '/usr/share/sounds/Yaru/stereo/alarm-clock-elapsed.oga',
];

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
 * Ищет исполняемый файл в PATH.
 */
function findExecutable(name) {
  const dirs = (process.env.PATH || '').split(path.delimiter);

  for (const dir of dirs) {
    if (!dir) {
      continue;
    }

    const candidate = path.join(dir, name);

    try {
      fs.accessSync(candidate, fs.constants.X_OK);
      return candidate;
    } catch {
      // Нет файла или нет прав на запуск — пробуем следующий каталог.
    }
  }

  return null;
}

/**
 * Ищет звук alarm-clock-elapsed в системных звуковых темах.
 */
function findSoundFile() {
  for (const file of DEFAULT_SOUND_FILES) {
    if (fs.existsSync(file)) {
      return file;
    }
  }

  const dataDirs = (process.env.XDG_DATA_DIRS || '/usr/local/share:/usr/share').split(path.delimiter);
  const roots = [
    path.join(os.homedir(), '.local', 'share', 'sounds'),
    ...dataDirs.map((dir) => path.join(dir, 'sounds')),
  ];

  for (const root of roots) {
    let themes;

    try {
      themes = fs.readdirSync(root, { withFileTypes: true });
    } catch {
      continue;
    }

    for (const theme of themes) {
      if (!theme.isDirectory()) {
        continue;
      }

      for (const ext of SOUND_EXTENSIONS) {
        const file = path.join(root, theme.name, 'stereo', `${SOUND_EVENT}.${ext}`);

        if (fs.existsSync(file)) {
          return file;
        }
      }
    }
  }

  return null;
}

/**
 * Выбирает, чем проиграть звук на Linux.
 *
 * canberra-gtk-play умеет играть события звуковой темы, но это GTK-программа:
 * без DISPLAY/WAYLAND_DISPLAY она завершается с «Cannot open display».
 * Поэтому в headless-окружении используем paplay или pw-play с файлом звука.
 */
function selectPlayer({
  hasDisplay = Boolean(process.env.DISPLAY || process.env.WAYLAND_DISPLAY),
  canberra = findExecutable('canberra-gtk-play'),
  paplay = findExecutable('paplay'),
  pwPlay = findExecutable('pw-play'),
  soundFile = findSoundFile(),
} = {}) {
  if (hasDisplay && canberra) {
    return { command: canberra, args: ['-i', SOUND_EVENT] };
  }

  if (soundFile && paplay) {
    return { command: paplay, args: [soundFile] };
  }

  if (soundFile && pwPlay) {
    return { command: pwPlay, args: [soundFile] };
  }

  if (canberra) {
    return { command: canberra, args: ['-i', SOUND_EVENT] };
  }

  return null;
}

/**
 * На Linux node-notifier не проигрывает звук, поэтому зовём системный
 * проигрыватель. Ошибки намеренно игнорируются: звук — необязательная часть.
 */
function playAlarmSound() {
  if (process.platform !== 'linux') {
    return;
  }

  const player = selectPlayer();

  if (!player) {
    console.warn('Звук недоступен: не найден системный аудиоплеер.');
    return;
  }

  try {
    const child = spawn(player.command, player.args, {
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

module.exports = { notifyTimerDone, formatDuration, selectPlayer };
