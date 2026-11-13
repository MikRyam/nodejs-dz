// index.js

// ---------- единицы измерения ----------

const UNIT_TO_MS = new Map([
  // секунды
  ['секунда', 1000], ['секунды', 1000], ['секунд', 1000],
  ['с', 1000], ['сек', 1000],
  // минуты
  ['минута', 60_000], ['минуты', 60_000], ['минут', 60_000],
  ['м', 60_000], ['мин', 60_000],
  // часы
  ['час', 3_600_000], ['часа', 3_600_000], ['часов', 3_600_000],
  ['ч', 3_600_000],
]);

const MAX_DELAY = 2_147_483_647; // предел setTimeout в Node

// ---------- парсинг числа ----------

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

// «похоже ли на число» — предикат, не бросает
function looksLikeNumber(str) {
  const t = str.trim();
  return t !== '' && Number.isFinite(Number(t));
}

// ---------- разбор пар «число единица» ----------

function parseDurationPairs(args) {
  if (args.length % 2 !== 0) {
    const last = args[args.length - 1];
    throw new Error(`Ошибка: для "${last}" не указана единица измерения`);
  }

  let totalMs = 0;

  for (let i = 0; i < args.length; i += 2) {
    const numStr = args[i];
    const unitStr = args[i + 1];

    // 1) сначала число — оно первично
    const value = parseNumber(numStr, `количество "${unitStr}"`);

    // 2) потом проверяем, что на месте единицы не число
    if (looksLikeNumber(unitStr)) {
      throw new Error(
        `Ошибка: после числа "${numStr}" ожидается единица измерения, а получено "${unitStr}"`
      );
    }

    // 3) и что единица вообще известна
    const unitKey = unitStr.toLowerCase();
    const multiplier = UNIT_TO_MS.get(unitKey);
    if (multiplier === undefined) {
      throw new Error(`Ошибка: неизвестная единица измерения "${unitStr}"`);
    }

    totalMs += value * multiplier;
  }

  return totalMs;
}

// ---------- точка входа ----------

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('Использование:');
    console.error('  node index.js <секунды>');
    console.error('  node index.js <число> <единица> [<число> <единица> ...]');
    console.error('Единицы: секунда/секунды/секунд, минута/минуты/минут, час/часа/часов');
    process.exit(1);
  }

  let totalMs;

  try {
    if (args.length === 1) {
      const [aStr] = args;

      // подсказка, если вместо числа передали единицу
      if (!looksLikeNumber(aStr) && UNIT_TO_MS.has(aStr.toLowerCase())) {
        throw new Error(`Ошибка: для "${aStr}" не указано число`);
      }

      const a = parseNumber(aStr, 'время в секундах');
      totalMs = a * 1000;
    } else {
      totalMs = parseDurationPairs(args);
    }

    if (totalMs > MAX_DELAY) {
      throw new Error(
        `Ошибка: итоговое время ${totalMs} мс превышает максимум setTimeout (${MAX_DELAY} мс)`
      );
    }
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }

  setTimeout(() => {
    console.log('Таймер прозвонил');
  }, totalMs);
}

main();
