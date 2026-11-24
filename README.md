# 🎓 Node.js — домашние задания

Учебные задания по курсу Node.js. Каждое задание — отдельная папка
со своим `README.md` и запуском. Большинству заданий хватает
установленного Node.js; в задании 7 зависимости ставятся через `npm`.

## 📁 Задания

| № | Задание | Папка | Что внутри |
|---|---------|-------|------------|
| 3.1 | Калькулятор, модульная версия | [`3_calc/`](3_calc/) | `index.js` разбирает аргументы, операции вынесены в `add.js`, `subtract.js`, `multiply.js`, `divide.js` |
| 3.2 | Калькулятор на событиях | [`3_calcevents/`](3_calcevents/) | То же плюс `emitter.js`: операции вызываются через `EventEmitter`, события идут в обе стороны |
| 4 | Таймер обратного отсчёта | [`4_dfiz_timer/`](4_dfiz_timer/) | `setTimeout` + разбор времени вида `1 час 5 минут 10 секунд`, `1ч5м` и `1h 5m 10s` |
| 7 | Таймер с системными уведомлениями | [`7_timer_notifications/`](7_timer_notifications/) | `package.json`, зависимость `node-notifier`, модуль `notify.js` с текстом, иконкой и звуком |

## 🚀 Как запускать

```bash
cd 3_calc
node index.js 5 6 add

cd ../4_dfiz_timer
node index.js 1 минута 30 секунд

cd ../7_timer_notifications
npm install
npm start -- 5
```

Подробности по каждому заданию — в `README.md` внутри его папки.

## 🗂️ История

Задания 3.x изначально велись отдельными репозиториями, теперь они
перенесены сюда и заархивированы:

- [MikRyam/3_calc](https://github.com/MikRyam/3_calc)
- [MikRyam/3_calcevents](https://github.com/MikRyam/3_calcevents)

## 🧠 Пройденные темы

- модули CommonJS (`require` / `module.exports`);
- `process.argv` — аргументы командной строки;
- `EventEmitter` — события и подписки;
- таймеры `setTimeout` и event loop;
- инициализация NPM-проекта и управление зависимостями;
- системные уведомления через `node-notifier`;
- валидация входных данных и коды возврата (`process.exit`).
