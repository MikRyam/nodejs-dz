'use strict';

const { EventEmitter } = require('events');

// Максимальная задержка setTimeout: 2^31 − 1 мс (~24,8 дня).
// Для более длинных таймеров ждём частями.
const MAX_TIMEOUT_MS = 2 ** 31 - 1;

/**
 * Таймер обратного отсчёта на EventEmitter.
 *
 * События:
 *   'done' — сработал по истечении заданного времени.
 */
class Timer extends EventEmitter {
  /**
   * @param {number} durationMs длительность в миллисекундах
   */
  constructor(durationMs) {
    super();

    if (!Number.isFinite(durationMs) || durationMs < 0) {
      throw new TypeError('Длительность таймера должна быть неотрицательным числом миллисекунд');
    }

    this.durationMs = durationMs;
    this._deadline = 0;
    this._timerId = null;
    this._running = false;
  }

  get running() {
    return this._running;
  }

  /**
   * Запускает таймер. Повторный вызов во время работы ничего не делает.
   */
  start() {
    if (this._running) {
      return this;
    }

    this._running = true;
    this._deadline = Date.now() + this.durationMs;
    this._schedule();

    return this;
  }

  /**
   * Останавливает таймер. Событие 'done' после этого не возникнет.
   */
  stop() {
    if (this._timerId !== null) {
      clearTimeout(this._timerId);
      this._timerId = null;
    }

    this._running = false;

    return this;
  }

  _schedule() {
    const left = this._deadline - Date.now();
    const delay = Math.min(Math.max(left, 0), MAX_TIMEOUT_MS);

    this._timerId = setTimeout(() => this._tick(), delay);
  }

  _tick() {
    this._timerId = null;

    // Сверяемся с абсолютным дедлайном, а не с длительностью шага:
    // так таймер не «уползает» из-за задержек event loop.
    if (Date.now() < this._deadline) {
      this._schedule();
      return;
    }

    this._running = false;
    this.emit('done', this.durationMs);
  }
}

module.exports = Timer;
