import { createRoot } from 'react-dom/client';

const mockRender = jest.fn();

jest.mock('react-dom/client', () => ({
  createRoot: jest.fn(() => ({ render: mockRender })),
}));

jest.mock('./App', () => ({
  __esModule: true,
  default: () => <div>Mock App</div>,
}));

describe('main entrypoint', () => {
  test('mounts the app into #root', async () => {
    const rootEl = document.createElement('div');
    rootEl.id = 'root';
    document.body.innerHTML = '';
    document.body.appendChild(rootEl);

    await import('./main');

    expect(createRoot).toHaveBeenCalledWith(rootEl);
    expect(mockRender).toHaveBeenCalledTimes(1);
  });
});
