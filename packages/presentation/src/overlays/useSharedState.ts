import type {Serializable} from '@repo/visual-editing-helpers'
import {useContext, useEffect} from 'react'
import {SharedStateContext} from './SharedStateContext'

export const useSharedState = (key: string, value: Serializable): undefined => {
  const context = useContext(SharedStateContext)

  if (!context) {
    throw new Error('Preview Snapshots context is missing')
  }

  const {setValue} = context

  useEffect(() => {
    setValue(key, value)
  }, [key, value, setValue])

  return undefined
}
