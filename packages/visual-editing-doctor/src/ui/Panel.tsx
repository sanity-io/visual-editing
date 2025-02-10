import {BugIcon, InfoOutlineIcon, MenuIcon, PlugIcon, SparklesIcon} from '@sanity/icons'
import {Button, Card, Flex, Text} from '@sanity/ui'
import {AnimatePresence, motion} from 'motion/react'
import {useRef, useState, type FunctionComponent} from 'react'
import {Connections} from './Connections'
import {Mappings} from './Mappings'
import {Overview} from './Overview'
import {Problems} from './Problems'

const indexMap: Record<number, string> = {
  0: 'Visual Editing Overview',
  1: 'Connections',
  2: 'Mappings',
  3: 'Problems',
}

const menuItems = [
  {icon: InfoOutlineIcon, index: 0},
  {icon: PlugIcon, index: 1},
  {icon: SparklesIcon, index: 2},
  {icon: BugIcon, index: 3},
]

export const Panel: FunctionComponent<{
  toggleIncorrectStegaAttributes: () => void
}> = (props) => {
  const {toggleIncorrectStegaAttributes} = props
  const [status, setStatus] = useState<'inactive' | 'active' | 'complete'>('inactive')
  const [index, setIndex] = useState(0)
  // Use a ref here because <AnimatePresence> doesn't seem to pass its custom
  // prop value to initial variants
  const directionRef = useRef(1)

  const changePanel = (newIndex: number) => () => {
    directionRef.current = newIndex > index ? 1 : -1
    setIndex(newIndex)
  }

  const headingVariants = {
    enter: () => ({
      y: directionRef.current > 0 ? '-50%' : '50%',
      opacity: 0,
    }),
    center: {y: 0, opacity: 1},
    exit: () => ({
      y: directionRef.current > 0 ? '50%' : '-50%',
      opacity: 0,
    }),
  }
  const contentVariants = {
    enter: () => ({
      x: directionRef.current > 0 ? '50%' : '-50%',
      opacity: 0,
    }),
    center: {x: 0, opacity: 1},
    exit: () => ({
      x: directionRef.current > 0 ? '-50%' : '50%',
      opacity: 0,
    }),
  }

  return (
    <div
      style={{
        zIndex: 99999999,
        position: 'fixed',
        top: '1rem',
        bottom: '1rem',
        width: '100vw',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-end',
        pointerEvents: status === 'active' ? 'auto' : 'none',
      }}
      onClick={() => setStatus('inactive')}
    >
      <motion.div
        animate={status}
        initial={false}
        transition={{
          borderRadius: {type: 'spring', bounce: 0.25, duration: 0.5},
          width: {type: 'spring', bounce: 0.25, duration: 0.5},
          height: {type: 'spring', bounce: 0.25, duration: 0.5},
        }}
        variants={{
          inactive: {
            borderRadius: '2rem',
            height: '2.5rem',
            width: '2.5rem',
          },
          active: {
            borderRadius: '0.5rem',
            height: '50%',
            width: '20rem',
          },
        }}
        style={{
          border: '1px solid rgba(0, 0, 0, 0.2)',
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(8px)',
          // borderRadius: '1rem',
          boxShadow: '0 0 1rem rgba(0, 0, 0, 0.2)',
          overflow: 'hidden',
          pointerEvents: 'auto',
          position: 'relative',
        }}
        onClick={(e) => {
          e.stopPropagation()
          setStatus('active')
        }}
      >
        <Card height={'fill'} style={{background: 'none'}}>
          <AnimatePresence>
            {status === 'inactive' && (
              <motion.div
                key="menu"
                initial={{opacity: 0, y: '100%'}}
                animate={{opacity: 1, y: '0'}}
                exit={{opacity: 0, y: '100%'}}
                style={{
                  alignItems: 'center',
                  bottom: 0,
                  display: 'flex',
                  gap: '0.5rem',
                  height: '2.5rem',
                  justifyContent: 'center',
                  position: 'absolute',
                  width: '100%',
                }}
              >
                <Text size={1}>
                  <MenuIcon />
                </Text>
                {/* <div>Icon</div>
              <div>Icon</div> */}
              </motion.div>
            )}
            {status === 'active' && (
              <motion.div
                key="panel"
                initial={{opacity: 0}}
                animate={{opacity: 1}}
                exit={{opacity: 0}}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                }}
              >
                <Card
                  overflow={'hidden'}
                  padding={3}
                  style={{borderBottom: '1px solid rgba(0, 0, 0, 0.2)'}}
                >
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.div
                      key={index}
                      variants={headingVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{duration: 0.5, type: 'spring'}}
                    >
                      <Text size={1} weight={'medium'} align={'center'}>
                        {indexMap[index]}
                      </Text>
                    </motion.div>
                  </AnimatePresence>
                </Card>
                <Flex flex={1} direction={'column'}>
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.div
                      key={index}
                      variants={contentVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{duration: 0.5, type: 'spring'}}
                      style={{overflowY: 'auto', height: '100%', display: 'flex'}}
                    >
                      {index === 0 && <Overview />}
                      {index === 1 && <Connections />}
                      {index === 2 && (
                        <Mappings toggleIncorrectStegaAttributes={toggleIncorrectStegaAttributes} />
                      )}
                      {index === 3 && <Problems />}
                    </motion.div>
                  </AnimatePresence>
                </Flex>
                <Card>
                  <Flex
                    justify={'center'}
                    gap={1}
                    padding={1}
                    style={{borderTop: '1px solid rgba(0, 0, 0, 0.2)'}}
                  >
                    {menuItems.map(({index: i, icon}) => (
                      <Button
                        key={i}
                        fontSize={2}
                        icon={icon}
                        mode="bleed"
                        onClick={changePanel(i)}
                        padding={2}
                        selected={index === i}
                        width="fill"
                      />
                    ))}
                  </Flex>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>
    </div>
  )
}
