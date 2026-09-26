import type { Metadata } from 'next'
import { LegalPage } from '../../src/LegalPage'

export const metadata: Metadata = {
  title: 'Terms | Pezzi',
  description: 'The terms for using Pezzi, a browser-based mosaic studio.',
}

export default function TermsPage() {
  return <LegalPage kind="terms" title="Terms of Use" summary="A few straightforward terms for using the Pezzi mosaic studio.">
    <section><h2>Your media and creations</h2><p>You keep the rights you have in the images, videos, projects, and mosaics you make. Pezzi does not claim ownership of your imported media or exported work. You are responsible for having permission to use the media you bring into the studio and for how you use or share the results.</p></section>
    <section><h2>Using the studio</h2><p>Use Pezzi lawfully and do not interfere with the site or other people’s ability to use it. The studio runs in your browser; available import, playback, clipboard, and export features depend on browser and device support. Save copies of work you want to keep, because unsaved editing state may be lost when you leave or reload the page.</p></section>
    <section><h2>Availability</h2><p>Pezzi is an evolving creative tool. Features, examples, and availability may change. The service is provided as available, without a promise that every file or browser will work perfectly. Nothing on this page limits rights that cannot be limited under applicable law.</p></section>
    <section><h2>Updates and questions</h2><p>If these terms change, the updated version and date will appear here. For questions, contact the project through <a href="https://github.com/johnmamanao/pezzi/issues/new">GitHub Issues</a>.</p></section>
  </LegalPage>
}
