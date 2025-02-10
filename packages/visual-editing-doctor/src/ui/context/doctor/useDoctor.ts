import {useContext} from 'react'
import {DoctorContext, type DoctorContextValue} from './DoctorContext'

export function useDoctor(): DoctorContextValue {
  const context = useContext(DoctorContext)

  if (!context) {
    throw new Error('Doctor context is missing')
  }

  return context
}
