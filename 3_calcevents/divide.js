const emitter = require('./emitter');

emitter.on('divide', (a, b) => {
  if (b === 0) {
    emitter.emit('calc:error', 'Ошибка: деление на ноль невозможно');
    return;
  }
  emitter.emit('result', a / b);
});
