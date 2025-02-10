import {useSelector} from '@xstate/react'
import {AnimatePresence, motion} from 'motion/react'
import type {FunctionComponent} from 'react'
import {useDoctor} from './context/doctor/useDoctor'

export const IncorrectStegaOverlays: FunctionComponent<{
  showIncorrectStegaAttributes: boolean
}> = (props) => {
  const {showIncorrectStegaAttributes} = props

  const doctor = useDoctor()

  const incorrectStegaAttribute = useSelector(
    doctor.actorRef,
    (state) => state.context.incorrectStegaAttributes,
  )

  return (
    <AnimatePresence>
      {showIncorrectStegaAttributes &&
        incorrectStegaAttribute.map((node) => (
          <motion.div
            initial={{opacity: 0, scale: 0.75}}
            animate={{opacity: 1, scale: 1}}
            exit={{opacity: 0, scale: 0.75}}
            style={{
              background: 'rgba(255, 0, 0, 0.25)',
              borderRadius: '3px',
              border: '1px solid rgba(255, 0, 0, 0.75)',
              height: node.getBoundingClientRect().height + 'px',
              left: node.getBoundingClientRect().left + 'px',
              pointerEvents: 'none',
              position: 'absolute',
              top: node.getBoundingClientRect().top + window.scrollY + 'px',
              width: node.getBoundingClientRect().width + 'px',
              zIndex: 99999,
            }}
          />
        ))}
    </AnimatePresence>
  )
}
