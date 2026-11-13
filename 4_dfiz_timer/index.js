// index.js

const { parseTime } = require('./parse-time');

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('Использование:');
    console.error('  node index.js <секунды>');
    console.error('  node index.js <число> <единица> [<число> <единица> ...]');
    console.error('  node index.js 1ч 5м 10с');
    console.error('Единицы: с/сек/секунда/секунды/секунд, м/мин/минута/минуты/минут, ч/час/часа/часов');
    console.error('Латинские: s/sec, m/min, h/hr');
    process.exit(1);
  }

  let totalMs;

  try {
    totalMs = parseTime(args);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }

  setTimeout(() => {
    console.log('Таймер прозвонил');
  }, totalMs);
}

main();
