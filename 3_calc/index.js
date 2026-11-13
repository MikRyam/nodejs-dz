// Импортируем все операции
const add = require('./add');
const subtract = require('./subtract');
const multiply = require('./multiply');
const divide = require('./divide');

// Карта операций: имя → функция
const operations = {
  add,
  subtract,
  multiply,
  divide,
};

function main() {
  // 1. Получаем аргументы, отбрасывая первые два служебных
  const args = process.argv.slice(2);

  // 2. Проверяем, что передано ровно 3 аргумента
  if (args.length !== 3) {
    console.error('Использование: node index.js <число1> <число2> <операция>');
    console.error('Доступные операции: ' + Object.keys(operations).join(', '));
    process.exit(1);
  }

  const [aStr, bStr, op] = args;

  // 3. Преобразуем строки в числа
  const a = Number(aStr);
  const b = Number(bStr);

  if (Number.isNaN(a) || Number.isNaN(b)) {
    console.error(`Ошибка: "${aStr}" или "${bStr}" не является числом`);
    process.exit(1);
  }

  // 4. Ищем нужную операцию
  const operation = operations[op];

  if (!operation) {
    console.error(`Ошибка: неизвестная операция "${op}"`);
    console.error('Доступные операции: ' + Object.keys(operations).join(', '));
    process.exit(1);
  }

  // 5. Выполняем и выводим результат
  try {
    const result = operation(a, b);
    console.log(result);
  } catch (err) {
    console.error('Ошибка:', err.message);
    process.exit(1);
  }
}

main();
