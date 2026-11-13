# 🧮 Консольный калькулятор (модульная версия)

Простой калькулятор для командной строки, реализованный на Node.js.
Каждая математическая операция вынесена в отдельный модуль, а `index.js`
выступает как точка входа: разбирает аргументы и вызывает нужную функцию.

## 📁 Структура проекта

```
calculator/
├── index.js        # точка входа, разбор аргументов и вызов операции
├── add.js          # сложение
├── subtract.js     # вычитание
├── multiply.js     # умножение
└── divide.js       # деление
```

## 🚀 Использование

```bash
node index.js <число1> <число2> <операция>
```

### Примеры

```bash
$ node index.js 5 6 add
11

$ node index.js 10 3 subtract
7

$ node index.js 4 5 multiply
20

$ node index.js 10 2 divide
5
```

## 📋 Доступные операции

| Операция   | Описание       | Пример                          |
|------------|----------------|---------------------------------|
| `add`      | Сложение       | `node index.js 5 6 add` → `11`  |
| `subtract` | Вычитание      | `node index.js 10 3 subtract` → `7` |
| `multiply` | Умножение      | `node index.js 4 5 multiply` → `20` |
| `divide`   | Деление        | `node index.js 10 2 divide` → `5` |

## ⚙️ Как это работает

1. `process.argv.slice(2)` отбрасывает служебные элементы массива
   (путь к Node.js и путь к скрипту), оставляя три аргумента:
   `[число1, число2, операция]`.
2. Аргументы-числа приводятся через `Number(...)`, проверяется
   `Number.isNaN(...)`.
3. По имени операции из объекта-роутера `operations` берётся нужная функция.
4. Результат выводится через `console.log`.

### Фрагмент `index.js`

```javascript
const add = require('./add');
const subtract = require('./subtract');
const multiply = require('./multiply');
const divide = require('./divide');

const operations = { add, subtract, multiply, divide };

const [aStr, bStr, op] = process.argv.slice(2);
const a = Number(aStr);
const b = Number(bStr);

const result = operations[op](a, b);
console.log(result);
```

## 🛡️ Обработка ошибок

Калькулятор сообщает об ошибке и завершается с кодом `1`, если:

- передано не три аргумента;
- одно из чисел не приводится к числу (`NaN`);
- указана неизвестная операция;
- происходит деление на ноль.

Пример:

```bash
$ node index.js 10 0 divide
Ошибка: деление на ноль невозможно

$ node index.js 5 abc add
Ошибка: "abc" не является числом

$ node index.js 5 6 pow
Ошибка: неизвестная операция "pow"
Доступные операции: add, subtract, multiply, divide
```

## 🔌 Как добавить новую операцию

1. Создайте файл, например `power.js`:

   ```javascript
   module.exports = (a, b) => Math.pow(a, b);
   ```

2. Подключите его в `index.js`:

   ```javascript
   const power = require('./power');
   const operations = { add, subtract, multiply, divide, power };
   ```

3. Готово: `node index.js 2 10 power` → `1024`.

## 🧠 Используемые концепции

- **Модули Node.js** (`require` / `module.exports`).
- **`process.argv`** — массив аргументов командной строки.
- **Объект-роутер** — вместо длинной цепочки `if/else`.
- **Строгое преобразование типов** — `Number()` + `Number.isNaN()`.
- **`process.exit(code)`** — корректный код возврата для shell и CI.

## ✅ Требования

- Node.js 14+ (достаточно любого LTS).
- Внешних зависимостей нет.

## 📄 Лицензия

MIT — используйте свободно в учебных целях.