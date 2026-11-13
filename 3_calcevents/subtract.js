const emitter = require('./emitter');

emitter.on('subtract', (a, b) => {
  emitter.emit('result', a - b);
});
