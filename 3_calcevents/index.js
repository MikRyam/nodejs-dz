const emitter = require('./emitter');

// Подписываемся на события ДО подгрузки операций,
// чтобы гарантированно поймать их ответы.
emitter.on('result', (result) => {
  console.log(result);
});

emitter.on('calc:error', (message) => {
  console.error(message);
  process.exit(1);
});

// Загружаем модули операций — они вешают слушатели на 'add', 'subtract', …
require('./add');
require('./subtract');
require('./multiply');
require('./divide');

const VALID_OPERATIONS = ['add', 'subtract', 'multiply', 'divide'];

/**
 * Приводит строку к числу или бросает исключение, если это не число.
 * Закрывает дыру: Number('') === 0, Number('   ') === 0.
 */
function parseNumber(str, label) {
  if (str.trim() === '') {
    throw new Error(`Ошибка: ${label} ("${str}") не является числом`);
  }
  const n = Number(str);
  if (Number.isNaN(n)) {
    throw new Error(`Ошибка: ${label} ("${str}") не является числом`);
  }
  return n;
}

function main() {
  const args = process.argv.slice(2);

  if (args.length !== 3) {
    console.error('Использование: node index.js <число1> <число2> <операция>');
    console.error('Доступные операции: ' + VALID_OPERATIONS.join(', '));
    process.exit(1);
  }

  const [aStr, bStr, op] = args;

  let a, b;
  try {
    a = parseNumber(aStr, 'первое число');
    b = parseNumber(bStr, 'второе число');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }

  if (!VALID_OPERATIONS.includes(op)) {
    console.error(`Ошибка: неизвестная операция "${op}"`);
    console.error('Доступные операции: ' + VALID_OPERATIONS.join(', '));
    process.exit(1);
  }

  // Публикуем событие. Ответ придёт асинхронно (в смысле — через другой emit)
  // в обработчики 'result' / 'calc:error', которые повесили выше.
  const hasListeners = emitter.emit(op, a, b);
  if (!hasListeners) {
    console.error(`Ошибка: обработчик для "${op}" не найден`);
    process.exit(1);
  }
}

main();
