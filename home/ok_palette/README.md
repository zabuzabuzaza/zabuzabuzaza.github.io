# An OK Palette Generator 

Based on the OKLAB / LCH colourspace by Björn Ottosson outlined [here](https://bottosson.github.io/posts/oklab/), and inspired by many other colour pickers like [this one](https://oklch.com/). 

Was supposed to be modelled around a DJ deck, what with the two decks and the mixer in the middle, and the sans-serif font reminded me of Raw Data Feel / Endless. 

TODO
- [ ] canvas going along the top with each end as the anchor colours, and a variable segmented palatte blend between (maybe up to 12 steps, 0 counting for a smooth transition if it's not too much of a performance hit)
- [ ] click to copy rgb / hex to clipboard. need this for at least the two anchors, but inbetween blends would be nice too
- [ ] pretty up the sliders and number input
- [ ] add a bisection method for finding fallback colour. the default one CSS uses is awful, comes nowhere close. You just need to dump the chroma until it's within the gamut, and why CSS does it the way it does is beyond me. 
- [ ] add extra palettes on the side (chroma variable) and along the bottom (two anchors on each side, and gray at current lightness in the middle)
