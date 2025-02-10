import {createContext} from 'react'
import {useDoctorMachine} from '../../../machines/doctorMachine'

export type DoctorContextValue = ReturnType<typeof useDoctorMachine>

export const DoctorContext = createContext<DoctorContextValue | null>(null)
