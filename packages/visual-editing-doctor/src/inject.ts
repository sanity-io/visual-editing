import {createActor} from 'xstate'
import {createDoctorMachine} from './machines/doctorMachine'
import {mount} from './ui'

declare global {
  interface Window {
    __doctorToolInjected?: boolean
  }
}

export function inject(): void {
  if (typeof window === 'undefined') return // Prevent SSR execution

  if (window.__doctorToolInjected) return // Prevent duplicate injection
  window.__doctorToolInjected = true

  const doctorMachine = createDoctorMachine()
  const doctor = createActor(doctorMachine)
  doctor.start()
  mount()
}
