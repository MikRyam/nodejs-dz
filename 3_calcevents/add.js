const emitter = require('./emitter');

emitter.on('add', (a, b) => {
  emitter.emit('result', a + b);
});
