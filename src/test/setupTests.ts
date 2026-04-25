import '@testing-library/jest-dom';
import { TextDecoder, TextEncoder } from 'util';

globalThis.TextEncoder = TextEncoder;
globalThis.TextDecoder = TextDecoder as typeof globalThis.TextDecoder;

class ResizeObserverMock {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}

globalThis.ResizeObserver = ResizeObserverMock;
