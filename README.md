# Anonymous Pokémon in Google Docs: DeviantArt Edition

The same Tampermonkey userscript as [the main version](https://github.com/liangforstudy/gdocs-anonymous-pokemon), plus **gen 8–9 and regional-form Pokémon**, drawn in Pokémon Shuffle style by [Loran-Hemlock](https://www.deviantart.com/loran-hemlock/gallery).

*Anonymous Goose* becomes *Anonymous Quaquaval*, *Anonymous Quokka* becomes *Anonymous Morpeko*, and *Anonymous Dolphin* might turn out to be a *SuperHero Dolphin*.

## Main or this edition?

| | Main | DeviantArt Edition |
|---|---|---|
| Icons | Pokémon Shuffle (gen 1–7) | Pokémon Shuffle + Loran-Hemlock's gen 8–9 and regional forms |
| Pokémon | 329 | 384 (all of main's, plus 55 more) |
| Art loaded from | GitHub only | GitHub and DeviantArt |
| Script name in Tampermonkey | Google Docs Anonymous Pokémon | Google Docs Anonymous Pokémon (DeviantArt icons) |

**Install only one.** Both run on the same pages, so with both on, each avatar would get swapped twice.

## Install

1. Install [Tampermonkey](https://www.tampermonkey.net/).
2. Open [`gdocs-anonymous-pokemon.user.js` on this branch](https://raw.githubusercontent.com/liangforstudy/gdocs-anonymous-pokemon/deviantart-icons/gdocs-anonymous-pokemon.user.js). Tampermonkey will offer to install it.
3. If you had the main version installed, turn it off or remove it.

Everything else (avatar colours, names in any language, Ctrl/Shift+click credit links, settings) works the same as main. See [the main README](https://github.com/liangforstudy/gdocs-anonymous-pokemon#readme) for details and the full animal list.

## What this edition adds

Every Pokémon from main is here too. On top of those, 23 animals gain Pokémon:

| Anonymous… | Extra Pokémon in this edition |
|---|---|
| Auroch | Paldean Tauros (Combat, Blaze and Aqua breeds) |
| Axolotl | Paldean Wooper |
| Capybara | Clodsire |
| Crow | Rookidee, Corvisquire, Corviknight |
| Dingo | Hisuian Growlithe, Hisuian Arcanine, Fidough, Dachsbun, Maschiff, Mabosstiff, Greavard, Houndstone |
| Dinosaur | Koraidon, Cyclizar, Miraidon |
| Dolphin | Finizen, Palafin, and Palafin's Hero form as the easter egg *SuperHero Dolphin* |
| Dragon | Frigibax, Arctibax, Baxcalibur |
| Duck | Quaxly, Quaxwell |
| Fox | Hisuian Zorua, Hisuian Zoroark |
| Giraffe | Farigiraf |
| Goose | Quaquaval, Quaxly, Quaxwell |
| Grizzly | Ursaluna, Bloodmoon Ursaluna |
| Monkey | Annihilape, Grafaiai |
| Moose | Wyrdeer |
| Narwhal | Cetitan, Cetoddle |
| Nyan Cat | Sprigatito, Floragato, Meowscarada |
| Otter | Hisuian Samurott |
| Quokka | Morpeko |
| Rabbit | Raboot |
| Slow Loris | Galarian Slowbro |
| Wolf | Hisuian Zorua, Hisuian Zoroark |
| Wolverine | Hisuian Sneasel, Sneasler |

## How the DeviantArt icons load

- The 48 icons are **not stored in this repo**. The script loads each one straight from DeviantArt's image server, which resizes it to 128×128 and keeps DeviantArt's watermark.
- The `DEVIANTART` table in the script lists every icon with its deviation page. **Ctrl/Shift+click** one in a Doc to open that page.
- If DeviantArt ever stops serving an icon, that Pokémon quietly falls back to PokeAPI artwork, so the script keeps working.
- Each viewer's browser fetches at most a few small images, once per page load.

To add another of Loran-Hemlock's icons: open its deviation page, find the `images-wixmp-…` image URL in the page source, and add `[page slug, path after /f/ up to .png, token]` to `DEVIANTART`.

## Updates

This edition follows main: fixes land on main first and are copied over here. Its version number moves separately, so check the `@version` line in the script.

## Credits

- Gen 8–9 and regional-form icons: [Loran-Hemlock](https://www.deviantart.com/loran-hemlock/gallery). The artist offers them free for **personal use only, no monetization**. Please respect that, and support the artist if you enjoy them.
- Gen 1–7 icons: ripped from *Pokémon Shuffle* (3DS), via [The Spriters Resource](https://www.spriters-resource.com/3ds/pokemonshuffle/).
- Animal list sources: see [the main README](https://github.com/liangforstudy/gdocs-anonymous-pokemon#sources-for-the-animal-list).

## AI Usage

I did most of the cherry picking for the sprites, Claude did the code, as well as the DeviantArt fetch system. It would be impossible to make the code without Claude.

## Disclaimer

Fan project, not affiliated with Google, Nintendo, Game Freak, The Pokémon Company, DeviantArt or Loran-Hemlock. Pokémon names and sprites belong to their respective owners.
