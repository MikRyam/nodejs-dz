const emitter = require('./emitter');

emitter.on('multiply', (a, b) => {
  emitter.emit('result', a * b);
});
