# Google Docs Anonymous Pokémon

A Tampermonkey userscript that turns Google Docs / Sheets / Slides **anonymous animals** into Pokémon.

*Anonymous Goose* becomes *Anonymous Quaquaval*, *Anonymous Hamster* becomes *Anonymous Pikachu*, and the avatar icon is swapped for the Pokémon's sprite.

## Install

1. Install [Tampermonkey](https://www.tampermonkey.net/).
2. Open [`gdocs-anonymous-pokemon.user.js`](gdocs-anonymous-pokemon.user.js) (the **Raw** button on GitHub). Tampermonkey will offer to install it.
3. Open any Google Doc that anonymous viewers are looking at.

## What it changes

- **Avatars**: any image or background that points at `ssl.gstatic.com/docs/common/profile/<animal>_lg.png` is replaced with the matching sprite.
- **Avatar colour**: Google gives each anonymous viewer a random circle colour. The script recolours it by the Pokémon's primary type (Quaquaval on water blue rather than a misleading green). Set `BACKGROUND = 'google'` to keep Google's colour, or give one Pokémon its own with `color: '#8d6e63'` in `ANIMALS`.
- **Names**: "Anonymous &lt;Animal&gt;" in tooltips, cursor flags, the viewer list and menus. Text inside the document itself is never touched.
- **Any language**: the script reads each viewer's display name off their avatar, so translated names work too ("Anonymer Ameisenbär" becomes "Anonymer Heatmor").
- **New animals**: if Google adds an animal that isn't mapped yet, it still gets a Pokémon, picked consistently from the existing map.
- **Art credit links**: **Ctrl/Shift+click** (Cmd+click on Mac) a Pokémon avatar to open where its art came from: the icon's own DeviantArt page for Loran-Hemlock's icons, or The Spriters Resource for the Shuffle game icons. Hold Ctrl or Shift while hovering to see the link. A plain click still does what Google normally does.

Everything runs locally in your browser and only changes what you see.

## Sprites

Avatars use Pokémon Shuffle-style icons, tried in this order:

1. **Gen 8–9 and regional forms**: [Loran-Hemlock's icons](https://www.deviantart.com/loran-hemlock/gallery), loaded straight from DeviantArt's CDN at 128×128. Nothing is re-hosted in this repo, and you don't need to download anything. The `DEVIANTART` table in the script maps each Pokémon to its deviation.
2. **Gen 1–7**: the [`sprites/`](sprites) folder, named `<dex>.png`, or `<dex>-<region>.png` for regional forms such as `128-paldea.png` (128×128, transparent). These are cut from the Pokémon Shuffle sheets in [`sheets/`](sheets). To change or add one, edit [`sheets/cells.txt`](sheets/cells.txt) (dex, gen, column,row of the cell, counted from 0) and run `powershell -File sheets\crop.ps1`.
3. **Anything else**: official artwork from [PokeAPI/sprites](https://github.com/PokeAPI/sprites).

To add another of Loran-Hemlock's icons, open its deviation page, find the `images-wixmp-…` image URL in the page source, and add `[page slug, path after /f/ up to .png, token]` to `DEVIANTART`.

To change sources, edit `SPRITE_SOURCE` at the top of the script.

**One file per Pokémon** (default; `url` can be a single template or a list tried in order):

```js
const SPRITE_SOURCE = {
  mode: 'files',
  url: [
    'https://raw.githubusercontent.com/YOU/REPO/main/sprites/{sprite}.png', // {sprite} (128-paldea, else dex), {dex}, {dex3} (025), {name} (pikachu)
    'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/{dex}.png',
  ],
};
```

**One sheet per generation** (cropped in the browser):

```js
const SPRITE_SOURCE = {
  mode: 'sheets',
  sheets: {
    1: { url: '.../gen1.png', firstDex: 1, cols: 15, cellWidth: 64, cellHeight: 64, offsetX: 0, offsetY: 0, gapX: 0, gapY: 0 },
    // ...one entry per generation you use
  },
};
```

If a sheet has gaps or extra forms, pin any Pokémon to a specific cell with `positions: { 25: [9, 1] }` (column, row; 0-based). To swap in a single custom image, use `SPRITE_OVERRIDES`, e.g. `{ goose: 'https://.../quaquaval.png' }`.

### Sprites needed per generation

🌐 = loaded from Loran-Hemlock's DeviantArt, ✅ = bundled in `sprites/`, unmarked = PokeAPI fallback for now, 😉 = winks half the time.

| Gen | Count | Pokémon |
|---|---|---|
| 1 | 23 | Squirtle ✅ 😉, Rattata ✅, Ekans ✅, Pikachu ✅ 😉, Raichu ✅ 😉, Sandshrew ✅, Sandslash ✅, Vulpix ✅, Zubat ✅, Diglett ✅, Meowth ✅, Persian ✅, Psyduck ✅, Mankey ✅, Tentacruel ✅, Rapidash ✅, Slowpoke ✅, Farfetch'd ✅, Rhyhorn ✅, Kangaskhan ✅, Lapras ✅, Ditto ✅, Dragonite ✅ |
| 2 | 14 | Feraligatr ✅, Furret ✅, Natu ✅, Mareep ✅, Aipom ✅, Wooper ✅, Murkrow ✅, Sneasel ✅, Teddiursa ✅, Ursaring ✅, Octillery ✅, Phanpy ✅, Donphan ✅, Raikou ✅ |
| 3 | 11 | Torchic ✅ 😉, Poochyena ✅, Mightyena ✅, Zigzagoon ✅, Linoone ✅, Pelipper ✅, Sableye ✅, Sharpedo ✅, Camerupt ✅, Kecleon ✅, Walrein ✅ |
| 4 | 12 | Piplup ✅ 😉, Empoleon ✅, Bidoof ✅, Bibarel ✅, Pachirisu ✅ 😉, Buizel ✅, Floatzel ✅, Buneary ✅, Stunky ✅, Munchlax ✅, Lucario ✅, Hippopotas ✅ |
| 5 | 10 | Oshawott ✅ 😉, Purrloin ✅, Liepard ✅, Zebstrika ✅, Basculin ✅, Minccino ✅, Emolga ✅, Beartic ✅, Bouffalant ✅, Heatmor ✅ |
| 6 | 11 | Chespin ✅ 😉, Froakie ✅ 😉, Diggersby ✅, Litleo ✅, Pyroar ✅, Gogoat ✅, Pancham ✅, Heliolisk ✅, Tyrantrum ✅, Pumpkaboo ✅, Hoopa ✅ |
| 7 | 9 | Alolan Rattata ✅, Alolan Raichu ✅, Incineroar ✅, Rockruff ✅, Lycanroc ✅, Mudbray ✅, Oranguru ✅, Passimian ✅, Komala ✅ |
| 8 | 4 | Rookidee 🌐, Morpeko 🌐, Wyrdeer 🌐, Ursaluna 🌐 |
| 9 | 13 | Paldean Tauros 🌐, Quaxly 🌐, Quaquaval 🌐, Fidough 🌐, Maschiff 🌐, Finizen 🌐, Palafin 🌐, Flamigo 🌐, Cetoddle 🌐, Cetitan 🌐, Clodsire 🌐, Farigiraf 🌐, Koraidon 🌐 |

## Animal → Pokémon map

The 82 animals currently in Google's pool (each confirmed on Google's avatar server, including the newer Capybara and Chicken), then 3 retired ones, the 2019 Endangered Species Day set, and Flamingo (not in Google's pool; included in case it's ever added).

Where an animal lists more than one Pokémon, one is picked at random for that animal each time the page loads (avatar and name always match).

| Anonymous… | Pokémon | Gen |
|---|---|---|
| Alligator | Feraligatr #160 | 2 |
| Anteater | Heatmor #631 | 5 |
| Armadillo | Sandslash #28 | 1 |
| Auroch | Paldean Tauros #128 | 9 |
| Axolotl | Wooper #194 | 2 |
| Badger | Linoone #264 | 3 |
| Bat | Zubat #41 | 1 |
| Beaver | Bidoof #399 | 4 |
| Blobfish | Ditto #132 | 1 |
| Buffalo | Bouffalant #626 | 5 |
| Camel | Camerupt #323 | 3 |
| Capybara | Clodsire #980 / Bidoof #399 / Bibarel #400 | 9 / 4 |
| Chameleon | Kecleon #352 | 3 |
| Cheetah | Persian #53 | 1 |
| Chicken | Torchic #255 😉 | 3 |
| Chinchilla | Minccino #572 | 5 |
| Chipmunk | Pachirisu #417 😉 | 4 |
| Chupacabra | Sableye #302 | 3 |
| Cormorant | Pelipper #279 | 3 |
| Coyote | Poochyena #261 | 3 |
| Crow | Murkrow #198 / Rookidee #821 | 2 / 8 |
| Dingo | Rockruff #744 | 7 |
| Dinosaur | Tyrantrum #697 / Koraidon #1007 | 6 / 9 |
| Dolphin | Finizen #963 / Palafin #964 | 9 |
| Dragon | Dragonite #149 | 1 |
| Duck | Psyduck #54 / Quaxly #912 | 1 / 9 |
| Dumbo Octopus | Octillery #224 | 2 |
| Elephant | Donphan #232 | 2 |
| Ferret | Furret #162 | 2 |
| Fox | Vulpix #37 | 1 |
| Frog | Froakie #656 😉 | 6 |
| Giraffe | Farigiraf #981 | 9 |
| Goose | Quaquaval #914 | 9 |
| Gopher | Diglett #50 | 1 |
| Grizzly | Ursaring #217 / Ursaluna #901 | 2 / 8 |
| Hamster | Pikachu #25 😉 / Raichu #26 😉 / Alolan Raichu #26 (+39 Pikachu forms) | 1 / 7 |
| Hedgehog | Chespin #650 😉 | 6 |
| Hippo | Hippopotas #449 | 4 |
| Hyena | Mightyena #262 | 3 |
| Ibex | Gogoat #673 | 6 |
| Ifrit | Hoopa #720 | 6 |
| Iguana | Heliolisk #695 | 6 |
| Jackal | Lucario #448 | 4 |
| Jackalope | Diggersby #660 | 6 |
| Kangaroo | Kangaskhan #115 | 1 |
| Kiwi | Natu #177 | 2 |
| Koala | Komala #775 | 7 |
| Kraken | Tentacruel #73 | 1 |
| Lemur | Aipom #190 | 2 |
| Leopard | Liepard #510 | 5 |
| Liger | Litleo #667 | 6 |
| Llama | Mudbray #749 | 7 |
| Manatee | Lapras #131 | 1 |
| Mink | Buizel #418 / Floatzel #419 | 4 |
| Monkey | Mankey #56 | 1 |
| Moose | Wyrdeer #899 | 8 |
| Narwhal | Cetitan #975 | 9 |
| Nyan Cat | Meowth #52 | 1 |
| Orangutan | Oranguru #765 | 7 |
| Otter | Oshawott #501 😉 | 5 |
| Panda | Pancham #674 | 6 |
| Penguin | Piplup #393 😉 | 4 |
| Platypus | Farfetch'd #83 | 1 |
| Pumpkin | Pumpkaboo #710 | 6 |
| Python | Ekans #23 | 1 |
| Quagga | Zebstrika #523 | 5 |
| Quokka | Morpeko #877 | 8 |
| Rabbit | Buneary #427 | 4 |
| Raccoon | Zigzagoon #263 | 3 |
| Rhino | Rhyhorn #111 | 1 |
| Sheep | Mareep #179 | 2 |
| Shrew | Sandshrew #27 / Rattata #19 / Alolan Rattata #19 | 1 / 7 |
| Skunk | Stunky #434 | 4 |
| Slow Loris | Slowpoke #79 | 1 |
| Squirrel | Emolga #587 | 5 |
| Tiger | Raikou #243 | 2 |
| Turtle | Squirtle #7 😉 | 1 |
| Unicorn | Rapidash #78 | 1 |
| Walrus | Walrein #365 | 3 |
| Wolf | Lycanroc #745 | 7 |
| Wolverine | Sneasel #215 | 2 |
| Wombat | Munchlax #446 | 4 |
| *Bear (retired)* | Teddiursa #216 | 2 |
| *Dog (retired)* | Fidough #926 | 9 |
| *Lion (retired)* | Pyroar #668 | 6 |
| *African Wild Dog (2019)* | Maschiff #942 | 9 |
| *Blue Whale (2019)* | Cetoddle #974 | 9 |
| *Desert-Dwelling Elephant (2019)* | Phanpy #231 | 2 |
| *Fossa (2019)* | Purrloin #509 | 5 |
| *Grey Reef Shark (2019)* | Sharpedo #319 | 3 |
| *Sumatran Orangutan (2019)* | Passimian #766 | 7 |
| *Pacific Bluefin Tuna (2019)* | Basculin #550 | 5 |
| *King Penguin (2019)* | Empoleon #395 | 4 |
| *Polar Bear (2019)* | Beartic #614 | 5 |
| *Siberian Tiger (2019)* | Incineroar #727 | 7 |
| *Flamingo (not in pool)* | Flamigo #973 | 9 |

Don't like a pick? Change the `dex` and `name` for that animal in `ANIMALS` in the script. Add `alts: [{ dex, name }]` to give an animal random alternates.

## Sources for the animal list

- [Evert Meulie: complete list of anonymous animals](https://evert.meulie.net/faqwd/complete-list-anonymous-animals-on-google-drive-docs-sheets-slides/) (the crowdsourced list PopSci used)
- [GoogleWatchBlog (2013)](https://www.googlewatchblog.de/2013/04/google-drive-viewer-tiernamen/)
- [9to5Google: 2019 endangered animals](https://9to5google.com/2019/05/17/google-docs-endangered-animals/)
- [hmnd's gist](https://gist.github.com/hmnd/e1b4ef8a14d2ffcf89cface330c56b06) and [Querela's gist](https://gist.github.com/Querela/d6ec6f54893791936431) (Capybara, and the German names)
- Chicken: spotted live in a Doc (`chicken_lg_2.png`), not listed anywhere else

## Credits

- Gen 1–7 icons: ripped from *Pokémon Shuffle* (3DS), via [The Spriters Resource](https://www.spriters-resource.com/3ds/pokemonshuffle/).
- Gen 8–9 and regional-form Shuffle-style icons by [Loran-Hemlock](https://www.deviantart.com/loran-hemlock/gallery), loaded from DeviantArt (not re-hosted), personal and non-commercial use only per the artist's terms: Rookidee, Wyrdeer, Ursaluna, Morpeko, Paldean Tauros, Quaxly, Quaquaval, Fidough, Maschiff, Finizen, Palafin, Flamigo, Cetoddle, Cetitan, Farigiraf, Koraidon, Clodsire.

## Disclaimer

Fan project, not affiliated with Google, Nintendo, Game Freak or The Pokémon Company. Pokémon names and sprites belong to their respective owners.
