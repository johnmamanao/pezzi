# Design direction

## Shape library refinement, September 2026

The user selected [Shapes Gallery](https://www.shapes.gallery/) as inspiration for the studio's forms. The inspected desktop gallery shows quarter-circle pinwheels, curved ribbons, opposed semicircular bands, and geometric cutouts. Pezzi uses six original canvas paths informed by those relationships: Pinwheels, Ribbons, Hourglasses, Inward stars, Petal rings, and Round crosses. Geometry is owned by `src/galleryShapes.ts` and cached as Path2D objects; the studio chooser renders previews through the same `tileShape` function as playback and exports. No reference SVG assets were copied.

New canvases use a curated mix with a 12% tile gap, replacing the tight 4% default. Existing saved configurations retain their own gaps and enabled shapes. IDs 0–23 and custom upload ID 24 are preserved; the new shapes occupy IDs 25–30. The "Use gallery mix" action applies the curated selection to existing frames through the normal automatic look update. Older shapes remain accessible under "More shapes", keeping the initial chooser compact. The desktop and 390px mobile chooser were visually inspected; preview labels fit and a shape toggle updated its selected state. Typecheck and production build passed. The landing's existing prerendered demo videos retain their original artwork.

Pezzi (formerly Tessloop) is a playful tool for making mosaics that move. The current working identity is in [BRAND.md](BRAND.md). The work began with a request for a mosaic creator, then shifted toward a wholly new identity and studio. The user asked for rounder forms and selected [HeyClicky](https://www.heyclicky.com/) as the strongest landing-page inspiration. The next direction made the entire product dark and brought video import into the studio.

## Visual system

- A deep charcoal canvas with a faint dotted texture. Studio surfaces use layered dark neutrals so the mosaics hold the brightest colors.
- A large centered wordmark above an object-focused moving mosaic on the landing page.
- A related studio workspace with an artboard window, soft controls, and generous spacing.
- Manrope for clear interface text and Fraunces for a few expressive headings.
- Original object studies rendered as mosaics, a four-tile mark, and Pezzi palettes.
- Small hover lifts, responsive transitions, and live canvas previews; reduced-motion preferences are respected.
- Lime marks the primary action and selection. Muted violet supports secondary controls; status and error states use words as well as color.

The reference informed composition and tone. The name, words, artwork, controls, color palettes, and code are original to this project.

## Button and footer reference, September 2026

The inspected desktop reference at 1280px shows a glossy blue primary pill with a dark blue border, a silver secondary pill, and Inter text. Tessloop uses that button treatment across the landing page and studio, including import, timeline, and export actions.

The footer keeps a spacious four-column layout that reflows into two columns on mobile. Following the user's correction, its signature is an original colorful mosaic strip with a large Tessloop wordmark and a studio action. Its content and artwork express the mosaic maker's own identity.

## Studio configuration, September 2026

The studio provides canvas ratios, density, shape inclusion and mix, custom shape upload, layout randomness, size and spacing, weighted colors, background treatment, overlays, finishing adjustments, and project settings in its own dark, rounded sidebar. Each frame stores its own configuration, so changing a control updates the live artboard and can be applied to every frame without replacing imported video pictures. Projects and reusable looks can be saved locally. The mobile version uses the same controls in a slide-in tools panel.

The studio density control supports 6–120 columns. Its renderer clamps loaded values to that range, and custom uploaded shapes reuse a bounded tint cache so dense images do not create thousands of offscreen canvases.

## Landing video study, September 2026

The live HeyClicky landing was inspected at desktop width with its hero film playing. Observed: many small media windows orbit a centered product name; a larger film becomes the main proof immediately below; later sections pair concise copy with video in framed windows. The page feels lively because the media itself shows the product, while the controls remain simple and stationary. Tessloop adopts that relationship with its own eight-frame mosaic loop, brand-specific floating pattern studies, timeline and color notes, and a large player. The film was exported from Tessloop's studio and stored locally as `public/tessloop-showreel.webm`; no HeyClicky footage or artwork is used.

The hero film autoplays muted and loops. Its pause/play button owns playback state and stays in the player corner. Reduced-motion preference pauses it on load; the static mosaic beneath remains a fallback. The new hero keeps the previously requested dark mode and the footer's own mosaic identity.

## Studio playback controls, September 2026

The FPS control is a custom rounded popover with common rates and a 1–30 FPS slider. A live speed strip and milliseconds per frame make rate changes visible even before a second frame exists. With two or more frames, choosing a rate starts playback and the timeline reports loop length. Studio scrollbars use only a slim thumb on a transparent track, with native arrow buttons hidden.

Playback now reuses smaller cached frame previews and advances from `requestAnimationFrame` timing. The still artboard and PNG/video exports continue rendering at their full output resolution. This reduces repeated shape drawing during playback, especially with dense grids and imported clips.

The studio artboard now shows the mosaic directly across the available preview space. The former window header, border, rounded card, shadow, and corner ornaments were removed from the studio preview. Aspect ratios remain intact, so unused space takes the same dark background as the workspace.

The shape styles are visually distinct: Playful keeps the tight mix of crisp geometric pieces, Soft adds spacing and uses rounded tiles, curved triangles, circular quads and dots, and Graphic retains sharp edge-to-edge shapes. The selector gives a short description of the active style.

Imported videos default to **Animate movement only**. The renderer compares each frame's sampled tiles with the first frame and reuses that frame's color and shape pattern where the image stays still. Tiles whose colors change beyond an adjustable sensitivity threshold use the current frame's colors and shape seed. The mode can be turned off in Source; thumbnails, playback, PNG/video export, and saved projects use the same setting. This is tile-level motion detection, so footage with camera movement or broad lighting changes can classify much of the image as moving.

## Media mosaic refinement, September 2026

The user's dark-hand clip exposed a rendering problem: source RGB was copied directly onto randomly selected tiles, so dark areas collapsed into the dark artboard while the bright backdrop became an equally weighted field of shapes. The [asciify-engine](https://github.com/ayangabryl/asciify-engine) reference suggested using sampled image values to drive the composition while keeping sampling separate from drawing. Tessloop keeps its own tile shapes, colors, and controls.

Imported media now defaults to **Tonal mix**. Each sampled cell contributes a normalized brightness value; that value changes palette-ink strength, shape scale, and fill frequency. Shadow regions retain visible tiles, while light regions use fewer tiles. The base video frame supplies the brightness range when movement-only mode is active, limiting frame-to-frame contrast shifts. **Source colors** restores the previous direct pixel-color treatment. The choice applies to the artboard, thumbnails, playback previews, and exports, and persists in project files.

Visual check used a three-frame synthetic clip with a dark hand-like subject against a pale background at 100 columns. The original treatment produced a nearly empty dark silhouette. Tonal mix rendered discernible tile detail inside it and reduced the backdrop's visual weight. The Source controls were checked in the local studio at 1280px; both treatments switched as labeled.

## Playback performance, September 2026

Tessloop uses its own canvas mosaic renderer. Like asciify-engine, it samples media and caches rendered playback frames, but it does not include that engine's ASCII character pipeline or every optimization in its live media API. The studio previously updated its full React tree at every playback frame and drew every timeline thumbnail as soon as a project loaded. Playback now advances the canvas directly on `requestAnimationFrame` and synchronizes editor selection about eight times per second. Timeline thumbnails render when they approach the visible strip, while playback previews are cached at a smaller size. Palette RGB values are parsed once per render rather than once per tile. Imported video frames are stored at up to 360px on their longest side, enough for three source pixels per tile at the maximum 120-column grid and less memory than the previous 480px copies.

Checked a 60-frame, 100-column project at 30 FPS in the local studio: the project loaded, playback advanced through the timeline, the artwork remained visible, and pause returned to a selected frame. This is a functional stress check; actual smoothness still depends on device, browser, clip, and enabled effects.

## Temporal coherence, September 2026

The Asciify editor was inspected after the user asked whether its visual quality comes from avoiding keyframes. Its video source remains an `HTMLVideoElement`; the editor renders the currently decoded image in a `requestAnimationFrame` loop and skips unchanged video frames. Tessloop still imports a bounded sequence of decoded frames for frame-by-frame editing and export. Neither behavior is about compressed-video keyframes.

Tessloop did have an unrelated source of flicker: each imported frame was assigned a different random seed, and movement-only rendering selected that seed for moving tiles. The mosaic pattern could therefore re-roll even when the source picture barely changed. Imported frames now share a persistent `patternSeed`, including palette selection, shape layout, overlays, and grain. Source brightness and motion still vary per frame. Remix on an individual frame intentionally changes that frame's pattern, and Apply look to all can carry it across the timeline. Older saved projects gain a shared pattern seed when loaded.

## Source-color direction, September 2026

The user rejected the resulting static-looking pattern and asked to remove Mosaic treatment. The treatment selector and tonal color mapping are removed. Imported images and videos now always color tiles from the source pixels. Imported video frames again use their own seeds in moving regions, while movement-only mode continues to hold still regions on the base frame. Older project files with tonal-treatment or pattern-seed fields still load; those fields no longer affect rendering. The earlier tonal and stable-pattern notes above document past iterations, not the current design.

## Video playback simplification, September 2026

The user then asked to remove Animate movement only. The checkbox, sensitivity setting, motion comparison, and associated project fields are removed. Each imported video frame now renders its own mosaic from its source pixels and seed. Older saved projects containing the removed fields still load; those fields are ignored. The immediately preceding note describes the prior iteration.

## Sequence-wide editing, September 2026

The user found it unfriendly to change settings on one frame and then search for Apply look to all frames. Appearance controls now update every frame immediately: style, density, palette, configuration sliders and toggles, uploaded shapes/backgrounds/textures, and pasted looks. Remix and Surprise me also refresh the whole loop while retaining each frame's source image and individual seed offset. The Apply look to all frames action is removed, and a short scope note appears in the sidebar when a sequence has multiple frames. Preview cache warming waits briefly after edits so continuous slider input does not repeatedly render the whole sequence. A three-frame project was checked by changing density and Grid lines, selecting another frame, and confirming both settings carried over.

## Studio tool navigation, September 2026

The long studio settings sidebar is now a persistent icon rail with five groups: Pattern (shape, layout, size), Color (palettes, custom colors, background), Media (image and video source), Effects (overlays and finish), and Project (save, load, copy, paste, reset). Selecting a group shows only its controls and returns that panel to the top. Text labels accompany the icons so the categories remain recognizable. The same navigation fits inside the mobile tools drawer; its content scrolls independently from the rail. Desktop and 390px mobile layouts were visually checked, all five groups were opened, and a palette change was confirmed in the mobile drawer. TypeScript typecheck passed.

## Collapsible settings panel, September 2026

The desktop icon rail can now collapse the settings panel to 72px (66px at narrower desktop widths), giving the artboard more horizontal room. The rail's bottom button expands it again, and selecting any category while collapsed opens that category. The mobile drawer always shows its panel, even if the desktop view was collapsed before resizing. Verified the collapsed desktop layout, category reopening, and the 390px mobile drawer; TypeScript typecheck passed.

## Sidebar hierarchy cleanup, September 2026

The screenshot exposed duplicate branding and category naming in the studio sidebar. The second mark and large category heading were removed from the rail and settings panel. Each category now opens directly on its controls, while mobile retains a small Tools row with the close button. The first divider was removed so the panel starts cleanly. Verified at desktop and 390px mobile; TypeScript typecheck passed.

## Icon controlled collapse, September 2026

The separate Collapse/Expand rail button was removed. On desktop, clicking the selected category icon toggles its settings panel; clicking another icon selects and opens that category. On mobile, tapping the selected icon closes the tools drawer. Verified collapsed and expanded desktop states, category switching, mobile close behavior, and TypeScript typecheck.

## Hidden studio scrollbars, September 2026

The settings panel, workspace, and frame strip keep their overflow scrolling but no longer render scrollbar tracks, thumbs, or arrows. The pattern panel was checked in the local browser: its computed scrollbar width is none and scrolling moved the panel 644px to reach lower controls.

## Pezzi working name, September 2026

The user rejected Tessloop as the product name. The proposed working name is Pezzi. The live landing page, studio header, metadata, footer, README, package identity, showreel path, and new export filenames use Pezzi. Existing Tessloop project and look formats remain accepted on import so earlier work can be reopened. The shorter wordmark was visually reviewed in the desktop hero, footer, and studio header. The current identity rules are in BRAND.md; historical entries above retain the former name where they describe prior work.

## Object studies on the landing page, September 2026

The repeated abstract pattern studies were replaced by five distinct moving subjects: sneaker, camera, and teapot in the hero, then poppy and citrus in the sample wall. Each loop uses a transparent original cutout as input to the same `drawMosaic` renderer as the studio. Transparent source cells are skipped, leaving clean dark space around the object. The loops move through translation, rotation, and a slight scale change while keeping a consistent tile pattern, so the subject stays readable. WebM files and still PNG posters are stored in `public/demos`; source cutouts are in `public/objects`. The hero's second button cycles among its three studies. The later section explains the three-step workflow instead of repeating another abstract sample. Asset origin and use are recorded in `ASSETS.md`.

The desktop landing and moving media were visually reviewed in the local browser. The hero played, and the sample videos began playing when scrolled into view. Mobile CSS was updated for stacked sample cards; a 390px browser screenshot could not be captured in the available browser session.

The first object loops were rendered at 960×540 with 72 columns and looked soft in the large hero player. They were rerendered at 1920×1080 with 112 columns and a higher video bitrate. The updated `-hd` videos report a decoded resolution of 1920×1080 in the local browser and use matching high-resolution posters.

## Hero sample windows, September 2026

The earlier cleanup removed the small media windows around the landing wordmark. The user's HeyClicky hero screenshot clarified that these surrounding previews were part of the desired composition. Two small rounded Pezzi sample windows now sit to either side of the wordmark, showing the hero subjects that are not active in the large player. Selecting one brings its full moving mosaic into the player; hovering or focusing briefly plays its preview. The windows stay still for reduced-motion visitors. Mobile keeps the two previews above the title. After the user noted that the windows repeated the lower samples, a new turquoise camera and red teapot were generated and rendered as distinct hero studies. The hero now uses sneaker, camera, and teapot; the lower sample wall uses poppy and citrus. Decorative source cutouts of the lower subjects were removed from the hero.

The surrounding hero previews now autoplay while visible, like the main player and lower samples. The previous hover-only behavior made part of the hero appear static. Reduced-motion visitors continue to see the poster frames.

## Living footer, September 2026

The static mosaic strip and repeated four-column links have been replaced with a single interactive mosaic stage. Its tile field moves gently while visible and responds to pointer movement or a tap; rendering stops offscreen or when the page is hidden. Reduced-motion preference freezes the ambient loop while retaining a still mosaic. The stage has one studio action, and the links and local-media note sit in a compact row beneath it. The separate final call-to-action section was removed because it duplicated the new footer's invitation.

The user rejected that inset stage. Their supplied Volcano screenshot and the live reference show a pixelated edge that lets the section above dissolve into a full-width footer. The current Pezzi footer uses that transition relationship with its own dark palette and occasional colored pixels. It keeps the content centered, removes the enclosing card and oversized bottom wordmark, and animates only the sparse edge accents while visible. The old pointer mosaic field is removed. This is visually reviewed in the desktop browser; user acceptance is pending.

The user then rejected the visible grid lines and asked for varied shapes. The edge no longer draws cell outlines. Its fringe mixes squares, circles, triangles, rings, four-piece clusters, and rounded tiles, while the lower rows remain solid to finish the blend. Colored pieces retain the sparse pulse. The desktop result was checked against the supplied screenshot; user acceptance remains pending.

The next screenshot showed a hard horizontal seam where the former edge became a fully dark row. The edge now spans nine rows with a gradual increase in dark cells, allows light gaps and colored shapes farther down, and fades its background from the preceding section color to the footer color. This targets the visible seam while retaining the geometric Pezzi fringe.

The user found that scattered version messy, so a single stepped boundary was tried. The user then asked to revert it. The nine-row scattered transition described above is restored; no other footer layout changes were undone.

## Privacy and terms, September 2026

The landing footer now links to actual `/privacy` and `/terms` pages. Both use a quiet dark two-column reading layout and share navigation back to the landing and studio. Copy is limited to current verified behavior: browser-side imports, local file downloads, clipboard actions, no account or analytics code, and ordinary hosting requests. The operator name and contact are pending, so the pages explicitly flag that detail for completion before a public launch.
