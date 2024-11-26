import clsx from 'clsx'
import {HTMLProps} from 'react'

const variants: Record<'default' | 'inverted', string> = {
  default: 'bg-white text-black dark:bg-black dark:text-white',
  inverted: 'bg-[#364c35] text-white dark:bg-[#b5cbb4] dark:text-black',
}

export function PageSection(props: {variant?: 'default' | 'inverted'} & HTMLProps<HTMLDivElement>) {
  const {children, className, variant = 'default', ...restProps} = props

  return (
    <div {...restProps} className={clsx(className, variants[variant])}>
      {children}
    </div>
  )
}
