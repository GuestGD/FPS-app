export function isMobile() {
  return "ontouchstart" in window || navigator.maxTouchPoints > 0;
}
