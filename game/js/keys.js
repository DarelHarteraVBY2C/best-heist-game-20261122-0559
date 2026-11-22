// Midnight Vault — keyboard and mouse. The loop polls this module's
// state each tick; edge-triggered actions (gadgets, pause, start) are
// consumed once by boot, so a held key never fires twice.

export function makeInput(canvas) {
  const input = {
    keys: new Set(),
    click: null, // { x, y } in canvas pixels, consumed by boot
    pressed: new Set(), // keys pressed since the last tick
  };

  window.addEventListener('keydown', (ev) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(ev.code)) {
      ev.preventDefault();
    }
    if (!ev.repeat) input.pressed.add(ev.code);
    input.keys.add(ev.code);
  });
  window.addEventListener('keyup', (ev) => {
    input.keys.delete(ev.code);
  });
  window.addEventListener('blur', () => input.keys.clear());

  canvas.addEventListener('mousedown', (ev) => {
    const rect = canvas.getBoundingClientRect();
    const x = ((ev.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((ev.clientY - rect.top) / rect.height) * canvas.height;
    input.click = { x, y };
  });

  return input;
}

// Pull the edge-triggered keys out of the set, so boot sees each press once.
export function takePressed(input, code) {
  if (input.pressed.has(code)) {
    input.pressed.delete(code);
    return true;
  }
  return false;
}

export function clearPressed(input) {
  input.pressed.clear();
}
