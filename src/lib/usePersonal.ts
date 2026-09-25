import { useEffect, useState } from 'react'
import { loadPersonal, PERSONAL_CHANGED_EVENT, type PersonalProfile } from './personal'

/** The tailoring answers, kept in step across screens. */
export function usePersonal(): PersonalProfile | null {
  const [personal, setPersonal] = useState<PersonalProfile | null>(loadPersonal)

  useEffect(() => {
    const onChange = () => setPersonal(loadPersonal())
    window.addEventListener(PERSONAL_CHANGED_EVENT, onChange)
    return () => window.removeEventListener(PERSONAL_CHANGED_EVENT, onChange)
  }, [])

  return personal
}
