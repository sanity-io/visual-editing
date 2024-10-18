import type React from 'react'

export function DebugLayoutShift(): React.JSX.Element {
  return (
    <style>{`
@keyframes debug-layout-shift-fade-in {
  from { background-color: red: opacity: 0; }
}

@keyframes debug-layout-shift-fade-out {
  to { background-color: red; opacity: 0; }
}

::view-transition-old(root) {
  animation-name: debug-layout-shift-fade-out;
}

::view-transition-new(root) {
  animation-name: debug-layout-shift-fade-in;
}
::view-transition-group(*) {
  outline: 2px solid red;
}
`}</style>
  )
}
