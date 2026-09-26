import '@testing-library/jest-dom'

// Mock matchMedia for jsdom
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock scrollIntoView for jsdom
window.HTMLElement.prototype.scrollIntoView = jest.fn()

// Mock PointerEvent for jsdom
if (typeof window.PointerEvent === 'undefined') {
  class PointerEvent extends MouseEvent {
    pointerId: number;
    pointerType: string;
    isPrimary: boolean;

    constructor(type: string, params: PointerEventInit = {}) {
      super(type, params);
      this.pointerId = params.pointerId || 0;
      this.pointerType = params.pointerType || 'mouse';
      this.isPrimary = params.isPrimary || false;
    }
  }
  window.PointerEvent = PointerEvent as any;
}
