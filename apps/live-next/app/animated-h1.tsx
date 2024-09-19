'use client'

import {stegaClean} from '@sanity/client/stega'
import {AnimatePresence, motion, Variants} from 'framer-motion'
import {useEffect, useState} from 'react'

interface CharacterData {
  char: string
  key: string
}

export function AnimatedH1({children, className}: {children: string; className: string}) {
  const text = stegaClean(children)
  const [characters, setCharacters] = useState<CharacterData[]>([])

  useEffect(() => {
    const incs = new Map<string, number>()
    setCharacters(
      text.split('').map((char) => {
        let n = incs.get(char) || 0
        const key = `${char}-${n++}`
        incs.set(char, n)
        return {
          char,
          key,
        } satisfies CharacterData
      }),
    )
  }, [text])

  const containerVariants: Variants = {
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
  }

  const characterVariants: Variants = {
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
  }

  return (
    <>
      <motion.h1
        className={className}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        data-sanity-edit-target
      >
        <span className="sr-only">{children}</span>
        <AnimatePresence initial={false}>
          {characters.map((charData) => (
            <motion.span
              key={charData.key}
              style={{display: 'inline-block', position: 'relative'}}
              variants={characterVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              layout
              aria-hidden="true"
            >
              {charData.char === ' ' ? '\u00A0' : charData.char}
            </motion.span>
          ))}
        </AnimatePresence>
      </motion.h1>
    </>
  )
}
