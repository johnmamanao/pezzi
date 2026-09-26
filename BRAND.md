# Pezzi brand notes

Working identity, September 2026. Pezzi replaces Tessloop after the user rejected the earlier name. The product remains a browser based tool for turning images and clips into editable, moving mosaics. The name is a proposal implemented for review, not a claim of final user approval.

## Voice and positioning

Speak to curious makers who want to experiment quickly with their own media. Use short, warm language tied to visible actions: “open the studio,” “see another object,” “import video,” and “make a mosaic.” The landing page shows actual rendered loops; the studio explains what a control changes. Avoid technical language in primary calls to action.

## Identity in use

- The four piece mark is implemented by `Mark` in `src/App.tsx`, with its favicon counterpart in `public/favicon.svg`. Keep the mark recognizable at small sizes, and pair it with the lowercase `pezzi` wordmark in the header. The hero and footer can use the wordmark alone because the mark already appears nearby.
- Existing colors remain the identity: lime, coral, lavender, and blue shapes against deep navy. The mosaic carries the color; interface chrome stays quieter. The actual palette and state rules live in `src/styles.css` and `src/mosaic.ts`.
- Manrope supplies large wordmarks and display text, Inter supplies compact controls, and Fraunces appears sparingly in expressive copy. Font imports live in `app/layout.tsx`.
- Rounded pills and cards support a playful feel. Controls must keep clear selected, disabled, hover, and keyboard focus states. Dense studio controls can be tighter than the landing page without changing the shared visual language.
- Motion should demonstrate a recognizable subject through the actual Pezzi renderer. The landing uses five original object studies in `public/demos/`: sneaker, camera, and teapot in the hero; poppy and lemon below. Each is isolated against open navy space and paired with a PNG poster. Reduced-motion visitors see the still frame.
- The footer uses a pixelated transition from the preceding section into a full-width dark surface. A few Pezzi-colored squares pulse while visible; the invitation, action, and navigation remain stationary.

The identity was visually checked in the desktop landing hero, footer, and studio header. Other historical notes in `DESIGN.md` may refer to the former Tessloop name because they document prior iterations.
