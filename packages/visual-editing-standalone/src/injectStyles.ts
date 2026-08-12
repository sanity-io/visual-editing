import '@sanity/ui/styles.css'
import styles from '@sanity/ui/styles.css?inline'

/**
 * Marks the `<style>` element this module injects, so the stylesheet is applied at most once
 * per document even if several copies of the chunk are evaluated (for example the same
 * version loaded through two different CDN URLs).
 */
const attribute = 'data-sanity-visual-editing-standalone'

/**
 * The self-contained dist cannot rely on `import './style.css'` statements: they only work
 * behind bundlers, and throw in native ESM environments — `<script type="module">`, import
 * maps, and CDNs like esm.sh (which rewrites the specifier to a `.css.mjs` URL that redirects
 * to the raw `text/css` file, a MIME type browsers refuse to execute as a module). Instead
 * the build swaps this module in for the `@sanity/ui/styles.css` import of the bundled
 * overlays (see `tsdown.config.ts`), so the stylesheet text ships inside the lazy overlay
 * chunk and is applied to the document at the same moment the replaced import statement
 * would have loaded it.
 *
 * `document` is missing in workers and server runtimes; the overlays cannot render there, so
 * the stylesheet is not needed either.
 */
if (typeof document !== 'undefined' && !document.querySelector(`style[${attribute}]`)) {
  const element = document.createElement('style')
  element.setAttribute(attribute, '')
  document.head.appendChild(element)
  try {
    /**
     * Prefer inserting the rules through the CSSOM: `insertRule` is exempt from `style-src`
     * Content Security Policy, while assigning stylesheet text to a `<style>` element
     * requires `'unsafe-inline'`. The bundled `styled-components` runtime injects the dynamic
     * overlay styles the same way, so pages with a strict CSP lose neither.
     */
    const parsed = new CSSStyleSheet()
    parsed.replaceSync(styles)
    const sheet = element.sheet
    if (!sheet) throw new Error('<style> element has no CSSStyleSheet')
    for (const rule of Array.from(parsed.cssRules)) {
      sheet.insertRule(rule.cssText, sheet.cssRules.length)
    }
  } catch {
    // No constructable stylesheet support — fall back to plain stylesheet text.
    element.textContent = styles
  }
}
