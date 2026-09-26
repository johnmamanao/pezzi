import type { Metadata } from 'next'
import { LegalPage } from '../../src/LegalPage'

export const metadata: Metadata = {
  title: 'Privacy | Pezzi',
  description: 'How Pezzi handles your imported media and browser data.',
}

export default function PrivacyPage() {
  return <LegalPage kind="privacy" title="Privacy Policy" summary="The studio processes the media you choose in your browser. Here is what that means in practice.">
    <section><h2>Media you import</h2><p>When you select an image or video, Pezzi reads it in your browser to make and preview mosaics. The current application does not upload the contents of those files to a Pezzi server. The media and editable frames remain in your browser while the studio is open.</p></section>
    <section><h2>Files you save</h2><p>Exporting a PNG or WebM downloads a file to your device. Saving a project downloads a JSON file that can contain your imported image data and frame images. Keep or delete those files using your device’s normal file controls. Pezzi does not keep a server copy of your exports or saved projects.</p></section>
    <section><h2>Clipboard and browser storage</h2><p>“Copy look” and “Copy palette” write settings to your clipboard when you choose those actions. “Paste look” reads the clipboard when you ask it to. The current app does not create an account or use browser storage to keep your projects between visits. Your browser may cache site files and sample media as part of normal browsing.</p></section>
    <section><h2>Visiting the site</h2><p>Your browser requests the application and its sample media from the site’s host. Like other websites, the hosting provider may receive ordinary connection information such as an IP address, browser details, and request times. The current Pezzi app does not include advertising or analytics scripts and does not set its own tracking cookies.</p></section>
    <section><h2>Changes and questions</h2><p>We will update this page if Pezzi’s data handling changes. For questions, contact the project through <a href="https://github.com/johnmamanao/pezzi/issues/new">GitHub Issues</a>.</p></section>
  </LegalPage>
}
