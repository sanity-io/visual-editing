/**
 * `?inline` is a Vite-compatible import query implemented by `@tsdown/css`: the stylesheet
 * runs through the CSS pipeline (Lightning CSS lowering and minification), and its final text
 * becomes the default export instead of being collected into the emitted `.css` asset. Only
 * `src/injectStyles.ts` uses it; this declaration keeps the type checker in sync.
 */
declare module '@sanity/ui/styles.css?inline' {
  /** The processed stylesheet text. */
  const styles: string
  export default styles
}
