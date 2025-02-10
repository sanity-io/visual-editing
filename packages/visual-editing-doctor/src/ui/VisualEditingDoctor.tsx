import {LayerProvider, ThemeProvider, usePrefersDark} from '@sanity/ui'
import {buildTheme} from '@sanity/ui/theme'
import {useState, type FunctionComponent} from 'react'
import {DoctorProvider} from './context/doctor/DoctorProvider'
import {IncorrectStegaOverlays} from './IncorrectStegaOverlays'
import {Panel} from './Panel'

export const VisualEditingDoctor: FunctionComponent = () => {
  const prefersDark = usePrefersDark()

  const [showIncorrectStegaAttributes, setShowIncorrectStegaAttributes] = useState(false)

  return (
    <ThemeProvider scheme={prefersDark ? 'dark' : 'light'} theme={buildTheme()} tone="transparent">
      <LayerProvider>
        <DoctorProvider>
          <IncorrectStegaOverlays showIncorrectStegaAttributes={showIncorrectStegaAttributes} />
          <Panel
            toggleIncorrectStegaAttributes={() =>
              setShowIncorrectStegaAttributes((value) => !value)
            }
          />
        </DoctorProvider>
      </LayerProvider>
    </ThemeProvider>
  )
}
