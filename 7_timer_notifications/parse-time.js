'use strict';

// Сколько миллисекунд содержится в одной единице времени.
// Ключи — в нижнем регистре; поддерживаются русские и английские варианты.
const UNIT_MS = new Map([
  // Миллисекунды
  ['мс', 1],
  ['миллисекунда', 1],
  ['миллисекунды', 1],
  ['миллисекунд', 1],
  ['ms', 1],
  ['millisecond', 1],
  ['milliseconds', 1],

  // Секунды
  ['с', 1000],
  ['сек', 1000],
  ['секунда', 1000],
  ['секунды', 1000],
  ['секунд', 1000],
  ['s', 1000],
  ['sec', 1000],
  ['second', 1000],
  ['seconds', 1000],

  // Минуты
  ['м', 60_000],
  ['мин', 60_000],
  ['минута', 60_000],
  ['минуты', 60_000],
  ['минут', 60_000],
  ['m', 60_000],
  ['min', 60_000],
  ['minute', 60_000],
  ['minutes', 60_000],

  // Часы
  ['ч', 3_600_000],
  ['час', 3_600_000],
  ['часа', 3_600_000],
  ['часов', 3_600_000],
  ['h', 3_600_000],
  ['hour', 3_600_000],
  ['hours', 3_600_000],

  // Дни
  ['д', 86_400_000],
  ['день', 86_400_000],
  ['дня', 86_400_000],
  ['дней', 86_400_000],
  ['d', 86_400_000],
  ['day', 86_400_000],
  ['days', 86_400_000],
]);

const NUMBER_RE = /^\d+(?:\.\d+)?$/;
const TOKEN_RE = /\d+(?:\.\d+)?|[a-zа-яё]+/gi;
const CLOCK_RE = /^\d+:\d{1,2}(?::\d{1,2})?$/;

/**
 * Переводит число в миллисекунды и проверяет результат.
 */
function toMilliseconds(value, factor) {
  const ms = Math.round(value * factor);

  if (!Number.isFinite(ms) || ms < 0) {
    throw new Error(`Ошибка: некорректное значение времени "${value}"`);
  }

  return ms;
}

function parseNumber(token) {
  return Number(token);
}

/**
 * Разбирает формат часов: "1:05:10" (ч:м:с) или "05:10" (м:с).
 * Возвращает миллисекунды либо null, если строка не похожа на часы.
 */
function parseClock(input) {
  if (!CLOCK_RE.test(input)) {
    return null;
  }

  const parts = input.split(':').map(Number);

  let hours = 0;
  let minutes = 0;
  let seconds = 0;

  if (parts.length === 3) {
    [hours, minutes, seconds] = parts;
    if (minutes > 59) {
      throw new Error(`Ошибка: в формате "${input}" минут не может быть больше 59`);
    }
  } else {
    [minutes, seconds] = parts;
  }

  if (seconds > 59) {
    throw new Error(`Ошибка: в формате "${input}" секунд не может быть больше 59`);
  }

  return ((hours * 60 + minutes) * 60 + seconds) * 1000;
}

/**
 * Разбирает аргументы командной строки и возвращает длительность в миллисекундах.
 *
 * Поддерживаемые варианты:
 *   ['5']                                    → 5 секунд
 *   ['1', 'час', '5', 'минут', '10', 'секунд'] → 1 ч 5 мин 10 с
 *   ['10м', '30с']                           → 10 минут 30 секунд
 *   ['01:05:10']                             → 1 ч 5 мин 10 с
 *   ['05:10']                                → 5 минут 10 секунд
 */
function parseTime(args) {
  const input = (Array.isArray(args) ? args.join(' ') : String(args))
    .trim()
    .toLowerCase()
    .replace(/,/g, '.');

  if (input === '') {
    throw new Error('Ошибка: не задано время таймера');
  }

  if (/-\d/.test(input)) {
    throw new Error('Ошибка: время не может быть отрицательным');
  }

  const clockMs = parseClock(input);
  if (clockMs !== null) {
    return clockMs;
  }

  const tokens = input.match(TOKEN_RE);

  if (!tokens) {
    throw new Error(`Ошибка: не удалось разобрать время "${input}"`);
  }

  // Простой вариант: одно число без единицы измерения — это секунды.
  if (tokens.length === 1 && NUMBER_RE.test(tokens[0])) {
    return toMilliseconds(parseNumber(tokens[0]), 1000);
  }

  if (tokens.length % 2 !== 0) {
    throw new Error(
      `Ошибка: не удалось разобрать время "${input}". ` +
        'Ожидается формат вида «1 час 5 минут 10 секунд»',
    );
  }

  let totalMs = 0;

  for (let i = 0; i < tokens.length; i += 2) {
    const numberToken = tokens[i];
    const unitToken = tokens[i + 1];

    if (!NUMBER_RE.test(numberToken)) {
      throw new Error(`Ошибка: "${numberToken}" не является числом`);
    }

    if (NUMBER_RE.test(unitToken)) {
      throw new Error(`Ошибка: после числа "${numberToken}" не указана единица времени`);
    }

    const factor = UNIT_MS.get(unitToken);

    if (factor === undefined) {
      throw new Error(`Ошибка: неизвестная единица времени "${unitToken}"`);
    }

    totalMs += toMilliseconds(parseNumber(numberToken), factor);
  }

  return totalMs;
}

module.exports = { parseTime };
