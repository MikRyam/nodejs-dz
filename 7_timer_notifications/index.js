'use strict';

const Timer = require('./timer');
const { parseTime } = require('./parse-time');
const { notifyTimerDone } = require('./notify');

const USAGE = [
  'Использование:',
  '  node index.js <секунды>',
  '  node index.js <часы> <минуты> <секунды> с единицами измерения',
  '',
  'Примеры:',
  '  node index.js 5',
  '  node index.js 1 час 5 минут 10 секунд',
  '  node index.js 10м 30с',
  '  node index.js 01:05:10',
].join('\n');

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error(USAGE);
    process.exit(1);
  }

  let durationMs;

  try {
    durationMs = parseTime(args);
  } catch (err) {
    console.error(err.message);
    console.error();
    console.error(USAGE);
    process.exit(1);
  }

  const timer = new Timer(durationMs);

  // По завершении сообщаем в консоль и показываем системное уведомление.
  timer.on('done', async (duration) => {
    console.log('Таймер прозвонил');

    // Терминальный bell — простой звуковой сигнал, который работает везде.
    process.stdout.write('\x07');

    try {
      await notifyTimerDone(duration);
    } catch (err) {
      // Без графической сессии или демона уведомлений приложение
      // всё равно должно корректно завершиться.
      console.error('Не удалось показать системное уведомление:', err.message);
    }
  });

  // Во время ожидания приложение ничего не печатает.
  timer.start();
}

main();
