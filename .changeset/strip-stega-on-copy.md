---
'@sanity/visual-editing': minor
---

feat: strip stega from clipboard on copy, and report suspicious stega placements

While Visual Editing is enabled, `copy` events are now intercepted and stega-encoded metadata (invisible characters) is stripped from the clipboard, so content copied from a preview can be pasted into other tools without the hidden characters tagging along. Copies without stega are left untouched, and the behavior can be disabled with the new `keepStegaOnCopy` option.

Also adds an opt-in `onSuspiciousStega` callback that reports stega payloads found in places where they always cause bugs or bloat, such as `class`, `href`, `src`, `id` and other attributes, inside `<head>` (e.g. `<title>`), `<script>` or `<style>` contents, form values, or the page URL. Reports are deduped, batched, and include the decoded edit info when available so the source field can be tracked down.
