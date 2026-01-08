'use client'

import {AnimatePresence, motion} from 'motion/react'
import {stegaClean} from 'next-sanity'



export function AnimatedH1({text: stegaText, className}: {text: string; className: string}) {
  const text = stegaClean(stegaText)
  const transformChars = (text: string) => {
    const incs = new Map<string, number>()
    return text.split('').map((char) => {
      let n = incs.get(char) || 0
      const key = `${char}-${n++}`
      incs.set(char, n)
      return (
        <motion.span
          key={key}
          style={{display: 'inline-block', position: 'relative'}}
          variants={{
            hidden: {
              opacity: 0,
              scale: 0,
              width: 0,
              transition: {type: 'spring', bounce: 0},
            },
            visible: {
              opacity: 1,
              y: 0,
              scale: 1,
              width: 'auto',
              transition: {type: 'spring', bounce: 0},
            },
            exit: {
              opacity: 0,
              scale: 0,
              width: 0,
              transition: {type: 'spring', bounce: 0},
            },
          }}
          initial="hidden"
          animate="visible"
          exit="exit"
          layout
          aria-hidden="true"
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      )
    })
  }
  const characters = transformChars(text)

  return (
    <>
      <motion.h1
        className={className}
        variants={{
          hidden: {},
          visible: (i = 1) => ({
            transition: {
              staggerChildren: 0.3 * i,
              delayChildren: 0.4 * i,
            },
          }),
          exit: (i = 1) => ({
            transition: {
              staggerChildren: 0.3 * i,
              staggerDirection: -1,
              delayChildren: 0.4 * i,
            },
          }),
        }}
        initial="hidden"
        animate="visible"
        exit="exit"
        data-sanity-edit-target
      >
        <span className="sr-only">{stegaText}</span>
        <AnimatePresence initial={false}>
          {characters.map((character) => character)}
        </AnimatePresence>
      </motion.h1>
    </>
  )
}
AnimatedH1.displayName = 'AnimatedH1'
