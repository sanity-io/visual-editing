import {type SchemaType as SanitySchemaType} from '@sanity/types'
import {ThemeProvider, type ThemeContextValue} from '@sanity/ui'
import {createElement, type FunctionComponent} from 'react'
import {ServerStyleSheet, StyleSheetManager} from 'styled-components'

export const SchemaIcon: FunctionComponent<{
  schemaType: SanitySchemaType
  theme: ThemeContextValue
}> = function SchemaIcon({schemaType, theme: themeContext}) {
  const {theme, scheme, tone} = themeContext
  const sheet = new ServerStyleSheet()

  return schemaType.icon ? (
    <StyleSheetManager sheet={sheet.instance}>
      <ThemeProvider theme={theme} scheme={scheme} tone={tone}>
        {createElement(schemaType.icon)}
      </ThemeProvider>
    </StyleSheetManager>
  ) : null
}
