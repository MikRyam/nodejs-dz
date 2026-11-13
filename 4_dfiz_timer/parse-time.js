'use strict';

// ---------- единицы измерения ----------

// Ключи — в нижнем регистре; русские и латинские варианты.
const UNIT_TO_MS = new Map([
  // секунды
  ['секунда', 1000], ['секунды', 1000], ['секунд', 1000],
  ['с', 1000], ['сек', 1000],
  ['s', 1000], ['sec', 1000], ['second', 1000], ['seconds', 1000],
  // минуты
  ['минута', 60_000], ['минуты', 60_000], ['минут', 60_000],
  ['м', 60_000], ['мин', 60_000],
  ['m', 60_000], ['min', 60_000], ['minute', 60_000], ['minutes', 60_000],
  // часы
  ['час', 3_600_000], ['часа', 3_600_000], ['часов', 3_600_000],
  ['ч', 3_600_000],
  ['h', 3_600_000], ['hr', 3_600_000], ['hour', 3_600_000], ['hours', 3_600_000],
]);

const MAX_DELAY = 2_147_483_647; // предел setTimeout в Node (~24,8 дня)

// Пара «число + единица» — слитно (`1ч`) или через пробел (`1 час`).
const PAIR_RE = /(\d+(?:\.\d+)?)\s*([a-zа-яё]+)/g;

// Число целиком — например, «5» или «1.5».
const NUMBER_RE = /^\d+(?:\.\d+)?$/;

// ---------- проверка числа ----------

function parseNumber(str, label) {
  const trimmed = str.trim();
  if (trimmed === '') {
    throw new Error(`Ошибка: ${label} ("${str}") не является числом`);
  }
  const n = Number(trimmed);
  if (!Number.isFinite(n)) {          // NaN, Infinity, -Infinity
    throw new Error(`Ошибка: ${label} ("${str}") не является числом`);
  }
  if (n < 0) {                        // -5, -0.1, ...
    throw new Error(`Ошибка: ${label} ("${str}") не может быть отрицательным`);
  }
  return n;
}

function checkMaxDelay(totalMs) {
  if (totalMs > MAX_DELAY) {
    throw new Error(
      `Ошибка: итоговое время ${totalMs} мс превышает максимум setTimeout (${MAX_DELAY} мс)`
    );
  }
  return totalMs;
}

// ---------- разбор времени ----------

/**
 * Разбирает аргументы командной строки и возвращает длительность в миллисекундах.
 *
 * Поддерживаемые варианты:
 *   ['5']                      → 5 секунд
 *   ['1', 'час', '5', 'минут'] → 1 час 5 минут
 *   ['1ч5м']                   → 1 час 5 минут
 *   ['1h', '5m', '10s']        → 1 час 5 минут 10 секунд
 *   ['1,5ч']                   → 1.5 часа
 */
function parseTime(args) {
  const input = (Array.isArray(args) ? args : [args])
    .join(' ')
    .toLowerCase()
    .replace(/,/g, '.')
    .trim();

  if (input === '') {
    throw new Error('Ошибка: не задано время таймера');
  }

  if (input.includes('-')) {
    throw new Error(`Ошибка: время не может быть отрицательным ("${input}")`);
  }

  // Одно число без единицы — это секунды.
  if (NUMBER_RE.test(input)) {
    return checkMaxDelay(parseNumber(input, 'время в секундах') * 1000);
  }

  const pairs = [...input.matchAll(PAIR_RE)];

  if (pairs.length === 0) {
    // Строка из одних единиц, без числа: «час».
    if (UNIT_TO_MS.has(input)) {
      throw new Error(`Ошибка: для "${input}" не указано число`);
    }
    // Числа без единиц: «5 6».
    if (input.replace(/[\d.\s]/g, '') === '') {
      throw new Error(`Ошибка: для "${input}" не указана единица измерения`);
    }
    throw new Error(`Ошибка: не удалось разобрать время "${input}"`);
  }

  let totalMs = 0;

  for (const [, numStr, unitStr] of pairs) {
    const multiplier = UNIT_TO_MS.get(unitStr);

    if (multiplier === undefined) {
      throw new Error(`Ошибка: неизвестная единица измерения "${unitStr}"`);
    }

    totalMs += parseNumber(numStr, `количество "${unitStr}"`) * multiplier;
  }

  // Всё, что не попало в пары, — нераспознанный хвост вроде «1 час 5».
  const rest = input.replace(PAIR_RE, ' ').trim();

  if (rest !== '') {
    throw new Error(`Ошибка: не удалось разобрать "${rest}"`);
  }

  return checkMaxDelay(totalMs);
}

module.exports = { parseTime, UNIT_TO_MS, MAX_DELAY };
