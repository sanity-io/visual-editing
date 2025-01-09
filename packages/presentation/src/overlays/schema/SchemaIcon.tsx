import {type SchemaType as SanitySchemaType} from '@sanity/types'
import {ThemeProvider, type ThemeContextValue} from '@sanity/ui'
import {isValidElement, type FunctionComponent} from 'react'
import {ServerStyleSheet, StyleSheetManager} from 'styled-components'

export const SchemaIcon: FunctionComponent<{
  schemaType: SanitySchemaType
  theme: ThemeContextValue
}> = function SchemaIcon({schemaType, theme: themeContext}) {
  const {theme, scheme, tone} = themeContext
  const sheet = new ServerStyleSheet()
  const Icon = schemaType.icon

  return Icon ? (
    <StyleSheetManager sheet={sheet.instance}>
      <ThemeProvider theme={theme} scheme={scheme} tone={tone}>
        {isValidElement(Icon) ? Icon : <Icon />}
      </ThemeProvider>
    </StyleSheetManager>
  ) : null
}
