import type {FunctionComponent} from 'react'
import {styled} from 'styled-components'

const Root = styled.div`
  --overlay-minimap-prompt-color-text: #727892;
  --overlay-minimap-prompt-color-bg: color-mix(in srgb, #fff 90%, transparent);
  --overlay-minimap-prompt-color-border: #f6f6f8;

  @media (prefers-color-scheme: dark) {
    --overlay-minimap-prompt-color-text: #bbbdc9;
    --overlay-minimap-prompt-color-bg: color-mix(in srgb, #1b1d27 90%, transparent);
    --overlay-minimap-prompt-color-border: #252837;
  }

  position: fixed;
  bottom: 2rem;
  left: 2rem;
  padding: 0.5rem;
  display: flex;
  gap: 0.625rem;
  font-size: 0.75rem;
  -webkit-font-smoothing: antialiased;
  color: var(--overlay-minimap-prompt-color-text);
  background: var(--overlay-minimap-prompt-color-bg);
  backdrop-filter: blur(4px);
  align-items: center;
  border-radius: 0.25rem;
  border: 1px solid var(--overlay-minimap-prompt-color-border);

  .overlay-minimap-icon-shift {
    width: 2.75rem;
    height: auto;
  }

  .overlay-minimap-icon-expand {
    width: 0.75rem;
  }
`

export const OverlayMinimapPrompt: FunctionComponent = () => {
  return (
    <Root>
      <svg viewBox="0 0 32 16" fill="none" className="overlay-minimap-icon-shift">
        <rect width="31" height="15" x=".5" y=".5" fill="currentColor" opacity=".15" rx="1.5" />
        <path
          fill="currentColor"
          d="m17.983 9.592-.703.077a.565.565 0 0 0-.105-.2.518.518 0 0 0-.196-.152.714.714 0 0 0-.302-.057.74.74 0 0 0-.405.104c-.108.07-.161.16-.16.27a.283.283 0 0 0 .105.233c.072.06.191.109.358.147l.558.12c.31.066.54.172.69.317a.757.757 0 0 1 .23.569.89.89 0 0 1-.18.545 1.162 1.162 0 0 1-.493.367c-.21.088-.452.132-.724.132-.401 0-.723-.084-.968-.252a1.01 1.01 0 0 1-.437-.705l.753-.072a.53.53 0 0 0 .217.334c.11.076.255.113.432.113.184 0 .33-.037.442-.113.112-.075.168-.168.168-.279a.29.29 0 0 0-.109-.232.758.758 0 0 0-.332-.14l-.558-.118c-.314-.065-.547-.175-.697-.33a.812.812 0 0 1-.224-.592.839.839 0 0 1 .164-.525c.112-.149.268-.264.467-.345.2-.082.43-.123.692-.123.384 0 .686.081.906.245.221.163.358.384.411.662Zm1.478.49V12h-.772V7.636h.755v1.647h.038a.947.947 0 0 1 .356-.436c.162-.108.368-.162.618-.162.227 0 .425.047.594.142.17.096.3.235.392.418.094.183.14.407.14.671V12h-.77v-1.964c0-.22-.057-.392-.171-.514-.112-.124-.27-.185-.473-.185a.745.745 0 0 0-.366.09.627.627 0 0 0-.252.253.839.839 0 0 0-.09.402ZM22.369 12V8.727h.771V12h-.771Zm.388-3.737a.45.45 0 0 1-.316-.122.391.391 0 0 1-.132-.296c0-.116.044-.215.132-.296a.446.446 0 0 1 .316-.124c.123 0 .228.042.315.124.088.081.132.18.132.296a.391.391 0 0 1-.132.296.445.445 0 0 1-.315.122Zm2.834.464v.597h-1.935v-.597h1.935ZM24.141 12V8.418c0-.22.045-.403.136-.55a.863.863 0 0 1 .37-.328c.155-.072.327-.108.516-.108.133 0 .252.01.356.032.103.021.18.04.23.057l-.154.597a1.325 1.325 0 0 0-.123-.03.747.747 0 0 0-.166-.017c-.144 0-.245.035-.305.104-.058.069-.088.167-.088.294V12h-.773Zm3.688-3.273v.597h-1.881v-.597h1.881Zm-1.416-.784h.77v3.073c0 .103.016.183.048.238.032.054.075.091.127.111.053.02.111.03.175.03a.754.754 0 0 0 .132-.01c.041-.008.073-.014.094-.02l.13.603a1.44 1.44 0 0 1-.454.077 1.258 1.258 0 0 1-.522-.088.812.812 0 0 1-.368-.302.9.9 0 0 1-.133-.511v-3.2Z"
        />
        <path
          stroke="currentColor"
          strokeWidth=".625"
          d="M4 6.778 6.5 4 9 6.778H7.889v1.389H5.11v-1.39H4Z"
        />
      </svg>
      <span>Zoom Out</span>
      <svg
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        className="overlay-minimap-icon-expand"
      >
        <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
      </svg>
    </Root>
  )
}
