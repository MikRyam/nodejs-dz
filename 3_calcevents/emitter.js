const { EventEmitter } = require('events');

// Один экземпляр на всё приложение.
// Модули операций будут его импортировать и вешать свои слушатели.
const emitter = new EventEmitter();

module.exports = emitter;