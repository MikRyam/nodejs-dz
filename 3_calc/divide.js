function divide(a, b) {
  if (b === 0) {
    throw new Error('Деление на ноль невозможно');
  }
  return a / b;
}

module.exports = divide;
