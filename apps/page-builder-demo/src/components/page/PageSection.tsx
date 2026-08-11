import clsx from 'clsx'
import {type StegaBranded, stegaClean} from 'next-sanity'
import {HTMLProps} from 'react'

const variants: Record<'default' | 'inverted', string> = {
  default: 'bg-white text-black dark:bg-black dark:text-white',
  inverted: 'bg-[#364c35] text-white dark:bg-[#b5cbb4] dark:text-black',
}

export function PageSection(
  props: {variant?: StegaBranded<'default' | 'inverted'>} & HTMLProps<HTMLDivElement>,
) {
  const {children, className, variant = 'default', ...restProps} = props

  return (
    <div {...restProps} className={clsx(className, variants[stegaClean(variant)])}>
      {children}
    </div>
  )
}
