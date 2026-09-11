let instance = null;

export function setLenis(value) {
  instance = value;
}

export function stopLenis() {
  instance?.stop();
}

export function startLenis() {
  instance?.start();
}
