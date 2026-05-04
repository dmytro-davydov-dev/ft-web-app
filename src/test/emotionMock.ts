// Minimal Emotion stub for Jest — the app uses MUI's ThemeProvider which handles
// Emotion internally; tests don't need real Emotion.
export const css = (..._args: unknown[]) => '';
export const keyframes = (..._args: unknown[]) => '';
export const Global = () => null;
export const ThemeContext = { Consumer: ({ children }: { children: (v: unknown) => unknown }) => children({}) };
export default {};
