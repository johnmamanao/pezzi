import { Studio } from '../../src/App'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Pezzi Studio — Make a moving mosaic' }

export default function StudioPage() {
  return <Studio />
}
