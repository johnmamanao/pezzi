import type { Metadata } from 'next'
import '@fontsource-variable/manrope'
import '@fontsource-variable/fraunces'
import '@fontsource-variable/inter'
import '../src/styles.css'

export const metadata: Metadata = {
  title: 'Pezzi — Make something of every piece',
  description: 'An independent mosaic playground for turning images and video into moving art.',
  icons: { icon: '/favicon.svg' },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>
}
