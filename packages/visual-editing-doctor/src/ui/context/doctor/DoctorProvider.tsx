import type {FunctionComponent, PropsWithChildren} from 'react'
import {useDoctorMachine} from '../../../machines/doctorMachine'
import {DoctorContext} from './DoctorContext'

export const DoctorProvider: FunctionComponent<PropsWithChildren> = function (props) {
  const doctor = useDoctorMachine()

  return <DoctorContext.Provider value={doctor}>{props.children}</DoctorContext.Provider>
}
