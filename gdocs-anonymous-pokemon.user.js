// ==UserScript==
// @name         Google Docs Anonymous Pokémon
// @namespace    https://github.com/liangforstudy/gdocs-anonymous-pokemon
// @version      1.3.0
// @description  Replaces Google Docs/Sheets/Slides "Anonymous Animal" viewers with Pokémon (name + avatar).
// @author       liangforstudy
// @match        https://docs.google.com/*
// @grant        GM_xmlhttpRequest
// @connect      raw.githubusercontent.com
// @connect      images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com
// @connect      *
// @run-at       document-idle
// @homepageURL  https://github.com/liangforstudy/gdocs-anonymous-pokemon
// @supportURL   https://github.com/liangforstudy/gdocs-anonymous-pokemon/issues
// @downloadURL  https://raw.githubusercontent.com/liangforstudy/gdocs-anonymous-pokemon/main/gdocs-anonymous-pokemon.user.js
// @updateURL    https://raw.githubusercontent.com/liangforstudy/gdocs-anonymous-pokemon/main/gdocs-anonymous-pokemon.user.js
// ==/UserScript==

(function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // CONFIG
  // ---------------------------------------------------------------------------

  // Where sprites come from. Two modes:
  //
  //  'files'  – one image per Pokémon. `url` is a template; {dex} is the
  //             National Dex number, {dex3} is zero-padded to 3 digits
  //             (e.g. 025), {name} is the lowercase Pokémon name, {sprite}
  //             is the entry's `sprite` (e.g. 128-paldea) or else {dex}.
  //
  //  'sheets' – one sprite sheet per generation, cropped on the fly.
  //             Fill in one entry per gen (see SHEET_TEMPLATE below).
  //
  // `url` may be a list, tried in order: Loran-Hemlock's icons straight from
  // DeviantArt, then the bundled icons, then PokeAPI for anything still missing.
  // An entry can also be a function (poke) => url | null.
  const SPRITE_SOURCE = {
    mode: 'files',
    url: [
      deviantArtUrl,
      'https://raw.githubusercontent.com/liangforstudy/gdocs-anonymous-pokemon/main/sprites/{sprite}.png',
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/{dex}.png',
    ],

    // Used only when mode === 'sheets'. Keys are generation numbers.
    // cellWidth/cellHeight: size of one sprite cell in px.
    // cols: sprites per row.  offsetX/offsetY: padding before the first cell.
    // gapX/gapY: spacing between cells.  firstDex: dex number of the first cell.
    // positions: optional { dex: [col, row] } overrides for irregular sheets.
    sheets: {
      // 1: { url: 'https://raw.githubusercontent.com/.../gen1.png', firstDex: 1,   cols: 15, cellWidth: 64, cellHeight: 64, offsetX: 0, offsetY: 0, gapX: 0, gapY: 0 },
      // 2: { url: '...gen2.png', firstDex: 152, cols: 15, cellWidth: 64, cellHeight: 64 },
      // 3: { url: '...gen3.png', firstDex: 252, ... },
      // 4: { url: '...gen4.png', firstDex: 387, ... },
      // 5: { url: '...gen5.png', firstDex: 494, ... },
      // 6: { url: '...gen6.png', firstDex: 650, ... },
      // 7: { url: '...gen7.png', firstDex: 722, ... },
      // 8: { url: '...gen8.png', firstDex: 810, ... },
      // 9: { url: '...gen9.png', firstDex: 906, ... },
    },
  };

  // Shuffle-style icons by Loran-Hemlock (https://www.deviantart.com/loran-hemlock),
  // loaded from DeviantArt's own CDN so they are never re-hosted here. DeviantArt
  // resizes them server-side and applies its watermark.
  // sprite id -> [deviation page slug, CDN file path, signed token]
  const DEVIANTART = {
    980: ['Clodsire-%28Pokemon-Shuffle-Style-Icon%29-991208630', '2724c149-01f0-4ac7-8847-00bfc56254f7/dge51h2-6fad1540-4701-4ae9-aaf8-4bed41cc4a99.png', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiIvZi8yNzI0YzE0OS0wMWYwLTRhYzctODg0Ny0wMGJmYzU2MjU0ZjcvZGdlNTFoMi02ZmFkMTU0MC00NzAxLTRhZTktYWFmOC00YmVkNDFjYzRhOTkucG5nIiwiaGVpZ2h0IjoiPD0xMDI0Iiwid2lkdGgiOiI8PTEwMjQifV1dLCJhdWQiOlsidXJuOnNlcnZpY2U6aW1hZ2Uud2F0ZXJtYXJrIl0sIndtayI6eyJwYXRoIjoiL3dtLzI3MjRjMTQ5LTAxZjAtNGFjNy04ODQ3LTAwYmZjNTYyNTRmNy9sb3Jhbi1oZW1sb2NrLTQucG5nIiwib3BhY2l0eSI6OTUsInByb3BvcnRpb25zIjowLjQ1LCJncmF2aXR5IjoiY2VudGVyIn19.9uthML3vcjwSebPPjKrToJTlukMDM0mDgYN9dgsHBcY'],
    821: ['Rookidee-%28Pokemon-Shuffle-Style-Icon%29-1184234952', '2724c149-01f0-4ac7-8847-00bfc56254f7/djl29jc-d11c9aac-46aa-438e-9cf9-e93cec22b4c9.png', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiIvZi8yNzI0YzE0OS0wMWYwLTRhYzctODg0Ny0wMGJmYzU2MjU0ZjcvZGpsMjlqYy1kMTFjOWFhYy00NmFhLTQzOGUtOWNmOS1lOTNjZWMyMmI0YzkucG5nIiwiaGVpZ2h0IjoiPD04MDAiLCJ3aWR0aCI6Ijw9ODAwIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmltYWdlLndhdGVybWFyayJdLCJ3bWsiOnsicGF0aCI6Ii93bS8yNzI0YzE0OS0wMWYwLTRhYzctODg0Ny0wMGJmYzU2MjU0ZjcvbG9yYW4taGVtbG9jay00LnBuZyIsIm9wYWNpdHkiOjk1LCJwcm9wb3J0aW9ucyI6MC40NSwiZ3Jhdml0eSI6ImNlbnRlciJ9fQ.AKHToM3MXQ3Bg7RJwmpUuF4vyt63UWN5DO0Y-ZvcTqU'],
    877: ['Morpeko-%28Pokemon-Shuffle-style-icon%29-896533601', '2724c149-01f0-4ac7-8847-00bfc56254f7/detrtr5-4dbee3e9-869e-44bc-be70-b3c93bdb5e23.png', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiIvZi8yNzI0YzE0OS0wMWYwLTRhYzctODg0Ny0wMGJmYzU2MjU0ZjcvZGV0cnRyNS00ZGJlZTNlOS04NjllLTQ0YmMtYmU3MC1iM2M5M2JkYjVlMjMucG5nIiwiaGVpZ2h0IjoiPD05MDAiLCJ3aWR0aCI6Ijw9OTAwIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmltYWdlLndhdGVybWFyayJdLCJ3bWsiOnsicGF0aCI6Ii93bS8yNzI0YzE0OS0wMWYwLTRhYzctODg0Ny0wMGJmYzU2MjU0ZjcvbG9yYW4taGVtbG9jay00LnBuZyIsIm9wYWNpdHkiOjk1LCJwcm9wb3J0aW9ucyI6MC40NSwiZ3Jhdml0eSI6ImNlbnRlciJ9fQ.UQZfseqCotF6xRZKtiCZvV4SmEpJNFzWRlUV6aY6M_Y'],
    899: ['Wyrdeer-%28Pokemon-Shuffle-Style-Icon%29-909684751', '2724c149-01f0-4ac7-8847-00bfc56254f7/df1lp8v-14ab6713-6986-4d4d-aaed-0c8db891ee7c.png', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiIvZi8yNzI0YzE0OS0wMWYwLTRhYzctODg0Ny0wMGJmYzU2MjU0ZjcvZGYxbHA4di0xNGFiNjcxMy02OTg2LTRkNGQtYWFlZC0wYzhkYjg5MWVlN2MucG5nIiwiaGVpZ2h0IjoiPD0xMDI0Iiwid2lkdGgiOiI8PTEwMjQifV1dLCJhdWQiOlsidXJuOnNlcnZpY2U6aW1hZ2Uud2F0ZXJtYXJrIl0sIndtayI6eyJwYXRoIjoiL3dtLzI3MjRjMTQ5LTAxZjAtNGFjNy04ODQ3LTAwYmZjNTYyNTRmNy9sb3Jhbi1oZW1sb2NrLTQucG5nIiwib3BhY2l0eSI6OTUsInByb3BvcnRpb25zIjowLjQ1LCJncmF2aXR5IjoiY2VudGVyIn19.kVxCkxSjs_UwMfCTrfilEbWYEFgyjSkJ_rHMEtWXcBg'],
    901: ['Ursaluna-%28Pokemon-Shuffle-Style-Icon%29-907880853', '2724c149-01f0-4ac7-8847-00bfc56254f7/df0j1cl-41ad2726-9444-45e8-9c1d-7a0833549e06.png', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiIvZi8yNzI0YzE0OS0wMWYwLTRhYzctODg0Ny0wMGJmYzU2MjU0ZjcvZGYwajFjbC00MWFkMjcyNi05NDQ0LTQ1ZTgtOWMxZC03YTA4MzM1NDllMDYucG5nIiwiaGVpZ2h0IjoiPD0xMDI0Iiwid2lkdGgiOiI8PTEwMjQifV1dLCJhdWQiOlsidXJuOnNlcnZpY2U6aW1hZ2Uud2F0ZXJtYXJrIl0sIndtayI6eyJwYXRoIjoiL3dtLzI3MjRjMTQ5LTAxZjAtNGFjNy04ODQ3LTAwYmZjNTYyNTRmNy9sb3Jhbi1oZW1sb2NrLTQucG5nIiwib3BhY2l0eSI6OTUsInByb3BvcnRpb25zIjowLjQ1LCJncmF2aXR5IjoiY2VudGVyIn19.VX96g57-Qo1RJ0Z97gILIG5WxJtrgQFOwSKQXAJHhUU'],
    912: ['Quaxly-%28Pokemon-Shuffle-Style-Icon%29-908350278', '2724c149-01f0-4ac7-8847-00bfc56254f7/df0t3k6-24ec23fe-3234-4889-933c-07da558dfc30.png', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiIvZi8yNzI0YzE0OS0wMWYwLTRhYzctODg0Ny0wMGJmYzU2MjU0ZjcvZGYwdDNrNi0yNGVjMjNmZS0zMjM0LTQ4ODktOTMzYy0wN2RhNTU4ZGZjMzAucG5nIiwiaGVpZ2h0IjoiPD0xMDI0Iiwid2lkdGgiOiI8PTEwMjQifV1dLCJhdWQiOlsidXJuOnNlcnZpY2U6aW1hZ2Uud2F0ZXJtYXJrIl0sIndtayI6eyJwYXRoIjoiL3dtLzI3MjRjMTQ5LTAxZjAtNGFjNy04ODQ3LTAwYmZjNTYyNTRmNy9sb3Jhbi1oZW1sb2NrLTQucG5nIiwib3BhY2l0eSI6OTUsInByb3BvcnRpb25zIjowLjQ1LCJncmF2aXR5IjoiY2VudGVyIn19.ObzQlCwi6EuYv3R4IoDJ7MCsiPClPdRqHpX4Bhz0uuM'],
    914: ['Quaquaval-%28Pokemon-Shuffle-Style-Icon%29-945343377', '2724c149-01f0-4ac7-8847-00bfc56254f7/dfmtzm9-64236fca-c3aa-437e-9f58-29fd2dbbef78.png', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiIvZi8yNzI0YzE0OS0wMWYwLTRhYzctODg0Ny0wMGJmYzU2MjU0ZjcvZGZtdHptOS02NDIzNmZjYS1jM2FhLTQzN2UtOWY1OC0yOWZkMmRiYmVmNzgucG5nIiwiaGVpZ2h0IjoiPD0xMDI0Iiwid2lkdGgiOiI8PTEwMjQifV1dLCJhdWQiOlsidXJuOnNlcnZpY2U6aW1hZ2Uud2F0ZXJtYXJrIl0sIndtayI6eyJwYXRoIjoiL3dtLzI3MjRjMTQ5LTAxZjAtNGFjNy04ODQ3LTAwYmZjNTYyNTRmNy9sb3Jhbi1oZW1sb2NrLTQucG5nIiwib3BhY2l0eSI6OTUsInByb3BvcnRpb25zIjowLjQ1LCJncmF2aXR5IjoiY2VudGVyIn19.9mkmL8FcD55g4xUkZRDMp4ONXA-MSgkFU-3g9ttvCao'],
    926: ['Fidough-%28Pokemon-Shuffle-Style-Icon%29-927420948', '2724c149-01f0-4ac7-8847-00bfc56254f7/dfc5ul0-7386667f-83ae-4d0f-a534-19fe9081d3ad.png', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiIvZi8yNzI0YzE0OS0wMWYwLTRhYzctODg0Ny0wMGJmYzU2MjU0ZjcvZGZjNXVsMC03Mzg2NjY3Zi04M2FlLTRkMGYtYTUzNC0xOWZlOTA4MWQzYWQucG5nIiwiaGVpZ2h0IjoiPD0xMDI0Iiwid2lkdGgiOiI8PTEwMjQifV1dLCJhdWQiOlsidXJuOnNlcnZpY2U6aW1hZ2Uud2F0ZXJtYXJrIl0sIndtayI6eyJwYXRoIjoiL3dtLzI3MjRjMTQ5LTAxZjAtNGFjNy04ODQ3LTAwYmZjNTYyNTRmNy9sb3Jhbi1oZW1sb2NrLTQucG5nIiwib3BhY2l0eSI6OTUsInByb3BvcnRpb25zIjowLjQ1LCJncmF2aXR5IjoiY2VudGVyIn19.trw9M1y78WF7hFRJpvBrWVj0jETdODBFq77N5DpFAJE'],
    942: ['Maschiff-%28Pokemon-Shuffle-Style-Icon%29-1080246156', '2724c149-01f0-4ac7-8847-00bfc56254f7/dhv5f9o-7d267a35-f1a7-4805-9643-cf9006f65517.png', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiIvZi8yNzI0YzE0OS0wMWYwLTRhYzctODg0Ny0wMGJmYzU2MjU0ZjcvZGh2NWY5by03ZDI2N2EzNS1mMWE3LTQ4MDUtOTY0My1jZjkwMDZmNjU1MTcucG5nIiwiaGVpZ2h0IjoiPD04MDAiLCJ3aWR0aCI6Ijw9ODAwIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmltYWdlLndhdGVybWFyayJdLCJ3bWsiOnsicGF0aCI6Ii93bS8yNzI0YzE0OS0wMWYwLTRhYzctODg0Ny0wMGJmYzU2MjU0ZjcvbG9yYW4taGVtbG9jay00LnBuZyIsIm9wYWNpdHkiOjk1LCJwcm9wb3J0aW9ucyI6MC40NSwiZ3Jhdml0eSI6ImNlbnRlciJ9fQ.fK2m2fY63-nsSWwkMYxSzA85gXL9yqVhgc31q2WZlzg'],
    963: ['Finizen-%28Pokemon-Shuffle-Style-Icon%29-941637605', '2724c149-01f0-4ac7-8847-00bfc56254f7/dfkmk85-45eeff32-ebbb-46a5-9347-21dc6a8fba3c.png', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiIvZi8yNzI0YzE0OS0wMWYwLTRhYzctODg0Ny0wMGJmYzU2MjU0ZjcvZGZrbWs4NS00NWVlZmYzMi1lYmJiLTQ2YTUtOTM0Ny0yMWRjNmE4ZmJhM2MucG5nIiwiaGVpZ2h0IjoiPD0xMDI0Iiwid2lkdGgiOiI8PTEwMjQifV1dLCJhdWQiOlsidXJuOnNlcnZpY2U6aW1hZ2Uud2F0ZXJtYXJrIl0sIndtayI6eyJwYXRoIjoiL3dtLzI3MjRjMTQ5LTAxZjAtNGFjNy04ODQ3LTAwYmZjNTYyNTRmNy9sb3Jhbi1oZW1sb2NrLTQucG5nIiwib3BhY2l0eSI6OTUsInByb3BvcnRpb25zIjowLjQ1LCJncmF2aXR5IjoiY2VudGVyIn19.KTUs4m8eJ2n40J_mN5Jo5ANScBRtiX3uN6r9vDwE6YI'],
    964: ['Palafin---Zero-Form-%28Pokemon-Shuffle-Style-Icon%29-941637838', '2724c149-01f0-4ac7-8847-00bfc56254f7/dfkmkem-a3cc62c2-b963-4b10-b461-b6cca19b1925.png', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiIvZi8yNzI0YzE0OS0wMWYwLTRhYzctODg0Ny0wMGJmYzU2MjU0ZjcvZGZrbWtlbS1hM2NjNjJjMi1iOTYzLTRiMTAtYjQ2MS1iNmNjYTE5YjE5MjUucG5nIiwiaGVpZ2h0IjoiPD0xMDI0Iiwid2lkdGgiOiI8PTEwMjQifV1dLCJhdWQiOlsidXJuOnNlcnZpY2U6aW1hZ2Uud2F0ZXJtYXJrIl0sIndtayI6eyJwYXRoIjoiL3dtLzI3MjRjMTQ5LTAxZjAtNGFjNy04ODQ3LTAwYmZjNTYyNTRmNy9sb3Jhbi1oZW1sb2NrLTQucG5nIiwib3BhY2l0eSI6OTUsInByb3BvcnRpb25zIjowLjQ1LCJncmF2aXR5IjoiY2VudGVyIn19.jytk1gpVq6nf7FtsN3YaSMp1SCDiKtpoavH3YzjTFfw'],
    973: ['Flamigo-%28Pokemon-Shuffle-Style-Icon%29-942210070', '2724c149-01f0-4ac7-8847-00bfc56254f7/dfkytxy-d95a3ef5-cd86-4dfd-ae2b-97c6bb04f449.png', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiIvZi8yNzI0YzE0OS0wMWYwLTRhYzctODg0Ny0wMGJmYzU2MjU0ZjcvZGZreXR4eS1kOTVhM2VmNS1jZDg2LTRkZmQtYWUyYi05N2M2YmIwNGY0NDkucG5nIiwiaGVpZ2h0IjoiPD0xMDI0Iiwid2lkdGgiOiI8PTEwMjQifV1dLCJhdWQiOlsidXJuOnNlcnZpY2U6aW1hZ2Uud2F0ZXJtYXJrIl0sIndtayI6eyJwYXRoIjoiL3dtLzI3MjRjMTQ5LTAxZjAtNGFjNy04ODQ3LTAwYmZjNTYyNTRmNy9sb3Jhbi1oZW1sb2NrLTQucG5nIiwib3BhY2l0eSI6OTUsInByb3BvcnRpb25zIjowLjQ1LCJncmF2aXR5IjoiY2VudGVyIn19.onKE1fOvAl1M-oQl7tYwu-gHokCJxi9Bu-jnDuzcOG4'],
    974: ['Cetoddle-%28Pokemon-Shuffle-Style-Icon%29-976805278', '2724c149-01f0-4ac7-8847-00bfc56254f7/dg5kbry-2cc06025-3090-4a25-adf6-accda91fa76d.png', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiIvZi8yNzI0YzE0OS0wMWYwLTRhYzctODg0Ny0wMGJmYzU2MjU0ZjcvZGc1a2JyeS0yY2MwNjAyNS0zMDkwLTRhMjUtYWRmNi1hY2NkYTkxZmE3NmQucG5nIiwiaGVpZ2h0IjoiPD0xMDI0Iiwid2lkdGgiOiI8PTEwMjQifV1dLCJhdWQiOlsidXJuOnNlcnZpY2U6aW1hZ2Uud2F0ZXJtYXJrIl0sIndtayI6eyJwYXRoIjoiL3dtLzI3MjRjMTQ5LTAxZjAtNGFjNy04ODQ3LTAwYmZjNTYyNTRmNy9sb3Jhbi1oZW1sb2NrLTQucG5nIiwib3BhY2l0eSI6OTUsInByb3BvcnRpb25zIjowLjQ1LCJncmF2aXR5IjoiY2VudGVyIn19.xmJSjWyAvsQVjnnz2SB3Mr_PaFSyLxymfGhThwIr8hA'],
    975: ['Cetitan-%28Pokemon-Shuffle-Style-Icon%29-925639162', '2724c149-01f0-4ac7-8847-00bfc56254f7/dfb3nqy-3125cf96-30a3-46f8-9bc0-b0890c07679d.png', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiIvZi8yNzI0YzE0OS0wMWYwLTRhYzctODg0Ny0wMGJmYzU2MjU0ZjcvZGZiM25xeS0zMTI1Y2Y5Ni0zMGEzLTQ2ZjgtOWJjMC1iMDg5MGMwNzY3OWQucG5nIiwiaGVpZ2h0IjoiPD0xMDI0Iiwid2lkdGgiOiI8PTEwMjQifV1dLCJhdWQiOlsidXJuOnNlcnZpY2U6aW1hZ2Uud2F0ZXJtYXJrIl0sIndtayI6eyJwYXRoIjoiL3dtLzI3MjRjMTQ5LTAxZjAtNGFjNy04ODQ3LTAwYmZjNTYyNTRmNy9sb3Jhbi1oZW1sb2NrLTQucG5nIiwib3BhY2l0eSI6OTUsInByb3BvcnRpb25zIjowLjQ1LCJncmF2aXR5IjoiY2VudGVyIn19.LntSRItvfodi1Lg63j4twzefOclhiSmEz_fug0DX0L8'],
    981: ['Farigiraf-%28Pokemon-Shuffle-Style-Icon%29-932130323', '2724c149-01f0-4ac7-8847-00bfc56254f7/dfeyscz-523b6903-4431-4631-a5d9-a378046cb9f9.png', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiIvZi8yNzI0YzE0OS0wMWYwLTRhYzctODg0Ny0wMGJmYzU2MjU0ZjcvZGZleXNjei01MjNiNjkwMy00NDMxLTQ2MzEtYTVkOS1hMzc4MDQ2Y2I5ZjkucG5nIiwiaGVpZ2h0IjoiPD0xMDI0Iiwid2lkdGgiOiI8PTEwMjQifV1dLCJhdWQiOlsidXJuOnNlcnZpY2U6aW1hZ2Uud2F0ZXJtYXJrIl0sIndtayI6eyJwYXRoIjoiL3dtLzI3MjRjMTQ5LTAxZjAtNGFjNy04ODQ3LTAwYmZjNTYyNTRmNy9sb3Jhbi1oZW1sb2NrLTQucG5nIiwib3BhY2l0eSI6OTUsInByb3BvcnRpb25zIjowLjQ1LCJncmF2aXR5IjoiY2VudGVyIn19.z7c6clp5SP0GYK1vnYyWTcPLROy0YoVm99FaqYHv1yE'],
    1007: ['Koraidon-%28Pokemon-Shuffle-Style-Icon%29-1176489830', '2724c149-01f0-4ac7-8847-00bfc56254f7/djgg9d2-6720be8c-6939-4f2e-b843-ea2d212ed456.png', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiIvZi8yNzI0YzE0OS0wMWYwLTRhYzctODg0Ny0wMGJmYzU2MjU0ZjcvZGpnZzlkMi02NzIwYmU4Yy02OTM5LTRmMmUtYjg0My1lYTJkMjEyZWQ0NTYucG5nIiwiaGVpZ2h0IjoiPD04MDAiLCJ3aWR0aCI6Ijw9ODAwIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmltYWdlLndhdGVybWFyayJdLCJ3bWsiOnsicGF0aCI6Ii93bS8yNzI0YzE0OS0wMWYwLTRhYzctODg0Ny0wMGJmYzU2MjU0ZjcvbG9yYW4taGVtbG9jay00LnBuZyIsIm9wYWNpdHkiOjk1LCJwcm9wb3J0aW9ucyI6MC40NSwiZ3Jhdml0eSI6ImNlbnRlciJ9fQ.UutfHPspOm3gx13eAPZM1aa6iGMZbzA-FKeSu8yIarc'],
    '128-paldea': ['Paldean-Tauros---Combat-%28Pk.-Shuffle-Style-Icon%29-1176379846', '2724c149-01f0-4ac7-8847-00bfc56254f7/djgdwhy-3c6e303f-f14d-413b-8104-8a0f4be6dbc4.png', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiIvZi8yNzI0YzE0OS0wMWYwLTRhYzctODg0Ny0wMGJmYzU2MjU0ZjcvZGpnZHdoeS0zYzZlMzAzZi1mMTRkLTQxM2ItODEwNC04YTBmNGJlNmRiYzQucG5nIiwiaGVpZ2h0IjoiPD04MDAiLCJ3aWR0aCI6Ijw9ODAwIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmltYWdlLndhdGVybWFyayJdLCJ3bWsiOnsicGF0aCI6Ii93bS8yNzI0YzE0OS0wMWYwLTRhYzctODg0Ny0wMGJmYzU2MjU0ZjcvbG9yYW4taGVtbG9jay00LnBuZyIsIm9wYWNpdHkiOjk1LCJwcm9wb3J0aW9ucyI6MC40NSwiZ3Jhdml0eSI6ImNlbnRlciJ9fQ.5CFLIuWlXcmQqYGBUcZtxgyiI3AtFGMiMWe7GZ0DG2s'],
  };

  function deviantArtUrl(poke) {
    const entry = DEVIANTART[poke.sprite || poke.dex];
    if (!entry) return null;
    const [, file, token] = entry;
    return `https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/${file}/v1/fill/w_128,h_128/icon.png?token=${token}`;
  }

  // Per-animal image URL overrides, e.g. { quokka: 'https://.../custom.png' }.
  const SPRITE_OVERRIDES = {};

  // Replace the "Anonymous X" text in tooltips, cursor flags and menus.
  const REPLACE_NAMES = true;

  // Avatar circle colour. Google gives each anonymous viewer a random colour,
  // which can clash with the Pokémon (Quaquaval on green looks like a Grass type).
  //  'type'   – colour the circle by the Pokémon's primary type (default)
  //  'google' – keep Google's colour
  const BACKGROUND = 'type';

  // Render sprites with crisp pixels instead of browser smoothing. Leave off for
  // the Shuffle-style icons; turn on if you use pixel-art game sprites.
  const PIXELATED = false;

  // ---------------------------------------------------------------------------
  // ANIMAL → POKÉMON MAP
  // key: Google's avatar file name (ssl.gstatic.com/docs/common/profile/<key>_lg.png)
  // label: how Google writes the animal after "Anonymous"
  // sprite: file name in sprites/ when it isn't just the dex number (regional forms)
  // alts: extra Pokémon; one of [main, ...alts] is picked at random per animal per page load
  // wink: a winking icon exists as sprites/<id>-wink.png; used half the time
  // color: avatar circle colour, overriding the type colour (e.g. color: '#8d6e63')
  // ---------------------------------------------------------------------------

  const ANIMALS = {
    alligator:    { label: 'Alligator',     dex: 160, name: 'Feraligatr' },
    anteater:     { label: 'Anteater',      dex: 631, name: 'Heatmor' },
    armadillo:    { label: 'Armadillo',     dex: 28,  name: 'Sandslash' },
    auroch:       { label: 'Auroch',        dex: 128, name: 'Paldean Tauros', sprite: '128-paldea' },
    axolotl:      { label: 'Axolotl',       dex: 194, name: 'Wooper' },
    badger:       { label: 'Badger',        dex: 264, name: 'Linoone' },
    bat:          { label: 'Bat',           dex: 41,  name: 'Zubat' },
    beaver:       { label: 'Beaver',        dex: 399, name: 'Bidoof' },
    blobfish:     { label: 'Blobfish',      dex: 132, name: 'Ditto' },
    buffalo:      { label: 'Buffalo',       dex: 626, name: 'Bouffalant' },
    camel:        { label: 'Camel',         dex: 323, name: 'Camerupt' },
    capybara:     { label: 'Capybara',      dex: 980, name: 'Clodsire', alts: [{ dex: 399, name: 'Bidoof' }, { dex: 400, name: 'Bibarel' }] },
    chameleon:    { label: 'Chameleon',     dex: 352, name: 'Kecleon' },
    cheetah:      { label: 'Cheetah',       dex: 53,  name: 'Persian' },
    chicken:      { label: 'Chicken',       dex: 255, name: 'Torchic', wink: true },
    chipmunk:     { label: 'Chipmunk',      dex: 417, name: 'Pachirisu', wink: true },
    chinchilla:   { label: 'Chinchilla',    dex: 572, name: 'Minccino' },
    chupacabra:   { label: 'Chupacabra',    dex: 302, name: 'Sableye' },
    cormorant:    { label: 'Cormorant',     dex: 279, name: 'Pelipper' },
    coyote:       { label: 'Coyote',        dex: 261, name: 'Poochyena' },
    crow:         { label: 'Crow',          dex: 198, name: 'Murkrow', alts: [{ dex: 821, name: 'Rookidee' }] },
    dingo:        { label: 'Dingo',         dex: 744, name: 'Rockruff' },
    dinosaur:     { label: 'Dinosaur',      dex: 697, name: 'Tyrantrum', alts: [{ dex: 1007, name: 'Koraidon' }] },
    dolphin:      { label: 'Dolphin',       dex: 963, name: 'Finizen', alts: [{ dex: 964, name: 'Palafin' }] },
    dragon:       { label: 'Dragon',        dex: 149, name: 'Dragonite' },
    duck:         { label: 'Duck',          dex: 54,  name: 'Psyduck', alts: [{ dex: 912, name: 'Quaxly' }] },
    dumbooctopus: { label: 'Dumbo Octopus', dex: 224, name: 'Octillery' },
    elephant:     { label: 'Elephant',      dex: 232, name: 'Donphan' },
    ferret:       { label: 'Ferret',        dex: 162, name: 'Furret' },
    fox:          { label: 'Fox',           dex: 37,  name: 'Vulpix' },
    frog:         { label: 'Frog',          dex: 656, name: 'Froakie', wink: true },
    giraffe:      { label: 'Giraffe',       dex: 981, name: 'Farigiraf' },
    goose:        { label: 'Goose',         dex: 914, name: 'Quaquaval' },
    gopher:       { label: 'Gopher',        dex: 50,  name: 'Diglett' },
    grizzly:      { label: 'Grizzly',       dex: 217, name: 'Ursaring', alts: [{ dex: 901, name: 'Ursaluna' }] },
    hamster:      { label: 'Hamster',       dex: 25,  name: 'Pikachu', wink: true, alts: [
      // Pikachu forms from the Shuffle sheet: preview in sheets/pikachu-forms.png, delete any you don't want.
      { dex: 25, name: 'Pikachu', sprite: '25-f01' },
      { dex: 25, name: 'Pikachu', sprite: '25-f02' },
      { dex: 25, name: 'Pikachu', sprite: '25-f03' },
      { dex: 25, name: 'Pikachu', sprite: '25-f04' },
      { dex: 25, name: 'Pikachu', sprite: '25-f05' },
      { dex: 25, name: 'Pikachu', sprite: '25-f06' },
      { dex: 25, name: 'Pikachu', sprite: '25-f07' },
      { dex: 25, name: 'Pikachu', sprite: '25-f08' },
      { dex: 25, name: 'Pikachu', sprite: '25-f09' },
      { dex: 25, name: 'Pikachu', sprite: '25-f10' },
      { dex: 25, name: 'Pikachu', sprite: '25-f11' },
      { dex: 25, name: 'Pikachu', sprite: '25-f12' },
      { dex: 25, name: 'Pikachu', sprite: '25-f13' },
      { dex: 25, name: 'Pikachu', sprite: '25-f14' },
      { dex: 25, name: 'Pikachu', sprite: '25-f15' },
      { dex: 25, name: 'Pikachu', sprite: '25-f16' },
      { dex: 25, name: 'Pikachu', sprite: '25-f17' },
      { dex: 25, name: 'Pikachu', sprite: '25-f18' },
      { dex: 25, name: 'Pikachu', sprite: '25-f19' },
      { dex: 25, name: 'Pikachu', sprite: '25-f20' },
      { dex: 25, name: 'Pikachu', sprite: '25-f21' },
      { dex: 25, name: 'Pikachu', sprite: '25-f22' },
      { dex: 25, name: 'Pikachu', sprite: '25-f23' },
      { dex: 25, name: 'Pikachu', sprite: '25-f24' },
      { dex: 25, name: 'Pikachu', sprite: '25-f25' },
      { dex: 25, name: 'Pikachu', sprite: '25-f26' },
      { dex: 25, name: 'Pikachu', sprite: '25-f27' },
      { dex: 25, name: 'Pikachu', sprite: '25-f28' },
      { dex: 25, name: 'Pikachu', sprite: '25-f29' },
      { dex: 25, name: 'Pikachu', sprite: '25-f30' },
      { dex: 25, name: 'Pikachu', sprite: '25-f31' },
      { dex: 25, name: 'Pikachu', sprite: '25-f32' },
      { dex: 25, name: 'Pikachu', sprite: '25-f33' },
      { dex: 25, name: 'Pikachu', sprite: '25-f34' },
      { dex: 25, name: 'Pikachu', sprite: '25-f35' },
      { dex: 25, name: 'Pikachu', sprite: '25-f36' },
      { dex: 25, name: 'Pikachu', sprite: '25-f37' },
      { dex: 25, name: 'Pikachu', sprite: '25-f38' },
      { dex: 25, name: 'Pikachu', sprite: '25-f39' },
      { dex: 26, name: 'Raichu', wink: true },
      { dex: 26, name: 'Alolan Raichu', sprite: '26-alola' },
    ] },
    hedgehog:     { label: 'Hedgehog',      dex: 650, name: 'Chespin', wink: true },
    hippo:        { label: 'Hippo',         dex: 449, name: 'Hippopotas' },
    hyena:        { label: 'Hyena',         dex: 262, name: 'Mightyena' },
    jackal:       { label: 'Jackal',        dex: 448, name: 'Lucario' },
    jackalope:    { label: 'Jackalope',     dex: 660, name: 'Diggersby' },
    ibex:         { label: 'Ibex',          dex: 673, name: 'Gogoat' },
    ifrit:        { label: 'Ifrit',         dex: 720, name: 'Hoopa' },
    iguana:       { label: 'Iguana',        dex: 695, name: 'Heliolisk' },
    kangaroo:     { label: 'Kangaroo',      dex: 115, name: 'Kangaskhan' },
    kiwi:         { label: 'Kiwi',          dex: 177, name: 'Natu' },
    koala:        { label: 'Koala',         dex: 775, name: 'Komala' },
    kraken:       { label: 'Kraken',        dex: 73,  name: 'Tentacruel' },
    lemur:        { label: 'Lemur',         dex: 190, name: 'Aipom' },
    leopard:      { label: 'Leopard',       dex: 510, name: 'Liepard' },
    liger:        { label: 'Liger',         dex: 667, name: 'Litleo' },
    llama:        { label: 'Llama',         dex: 749, name: 'Mudbray' },
    manatee:      { label: 'Manatee',       dex: 131, name: 'Lapras' },
    mink:         { label: 'Mink',          dex: 418, name: 'Buizel', alts: [{ dex: 419, name: 'Floatzel' }] },
    monkey:       { label: 'Monkey',        dex: 56,  name: 'Mankey' },
    moose:        { label: 'Moose',         dex: 899, name: 'Wyrdeer' },
    narwhal:      { label: 'Narwhal',       dex: 975, name: 'Cetitan' },
    nyancat:      { label: 'Nyan Cat',      dex: 52,  name: 'Meowth' },
    orangutan:    { label: 'Orangutan',     dex: 765, name: 'Oranguru' },
    otter:        { label: 'Otter',         dex: 501, name: 'Oshawott', wink: true },
    panda:        { label: 'Panda',         dex: 674, name: 'Pancham' },
    penguin:      { label: 'Penguin',       dex: 393, name: 'Piplup', wink: true },
    platypus:     { label: 'Platypus',      dex: 83,  name: "Farfetch'd" },
    python:       { label: 'Python',        dex: 23,  name: 'Ekans' },
    pumpkin:      { label: 'Pumpkin',       dex: 710, name: 'Pumpkaboo' },
    quagga:       { label: 'Quagga',        dex: 523, name: 'Zebstrika' },
    quokka:       { label: 'Quokka',        dex: 877, name: 'Morpeko' },
    rabbit:       { label: 'Rabbit',        dex: 427, name: 'Buneary' },
    raccoon:      { label: 'Raccoon',       dex: 263, name: 'Zigzagoon' },
    rhino:        { label: 'Rhino',         dex: 111, name: 'Rhyhorn' },
    sheep:        { label: 'Sheep',         dex: 179, name: 'Mareep' },
    shrew:        { label: 'Shrew',         dex: 27,  name: 'Sandshrew', alts: [{ dex: 19, name: 'Rattata' }, { dex: 19, name: 'Alolan Rattata', sprite: '19-alola' }] },
    skunk:        { label: 'Skunk',         dex: 434, name: 'Stunky' },
    slowloris:    { label: 'Slow Loris',    dex: 79,  name: 'Slowpoke' },
    squirrel:     { label: 'Squirrel',      dex: 587, name: 'Emolga' },
    tiger:        { label: 'Tiger',         dex: 243, name: 'Raikou' },
    turtle:       { label: 'Turtle',        dex: 7,   name: 'Squirtle', wink: true },
    unicorn:      { label: 'Unicorn',       dex: 78,  name: 'Rapidash' },
    walrus:       { label: 'Walrus',        dex: 365, name: 'Walrein' },
    wolf:         { label: 'Wolf',          dex: 745, name: 'Lycanroc' },
    wolverine:    { label: 'Wolverine',     dex: 215, name: 'Sneasel' },
    wombat:       { label: 'Wombat',        dex: 446, name: 'Munchlax' },

    // Retired from the current pool, kept in case old sessions still show them.
    bear:         { label: 'Bear',          dex: 216, name: 'Teddiursa' },
    dog:          { label: 'Dog',           dex: 926, name: 'Fidough' },
    lion:         { label: 'Lion',          dex: 668, name: 'Pyroar' },

    // 2019 Endangered Species Day additions (names only; not on the gstatic CDN).
    africanwilddog:    { label: 'African Wild Dog',        dex: 942, name: 'Maschiff' },
    bluewhale:         { label: 'Blue Whale',              dex: 974, name: 'Cetoddle' },
    desertelephant:    { label: 'Desert-Dwelling Elephant', dex: 231, name: 'Phanpy' },
    fossa:             { label: 'Fossa',                   dex: 509, name: 'Purrloin' },
    greyreefshark:     { label: 'Grey Reef Shark',         dex: 319, name: 'Sharpedo' },
    sumatranorangutan: { label: 'Sumatran Orangutan',      dex: 766, name: 'Passimian' },
    bluefintuna:       { label: 'Pacific Bluefin Tuna',    dex: 550, name: 'Basculin' },
    kingpenguin:       { label: 'King Penguin',            dex: 395, name: 'Empoleon' },
    polarbear:         { label: 'Polar Bear',              dex: 614, name: 'Beartic' },
    siberiantiger:     { label: 'Siberian Tiger',          dex: 727, name: 'Incineroar' },

    // Not in Google's pool; here in case it's ever added.
    flamingo:          { label: 'Flamingo',                dex: 973, name: 'Flamigo' },
  };

  // Primary type per sprite id (forms use their own typing). From PokeAPI.
  const TYPES = {
    255: 'fire', 980: 'poison', 26: 'electric', 400: 'normal', 419: 'water', 19: 'normal', '19-alola': 'dark',
    7: 'water', 23: 'poison', 25: 'electric', 27: 'ground', 28: 'ground', 37: 'fire',
    41: 'poison', 50: 'ground', 52: 'normal', 53: 'normal', 54: 'water', 56: 'fighting',
    73: 'water', 78: 'fire', 79: 'water', 83: 'normal', 111: 'ground', 115: 'normal',
    '128-paldea': 'fighting', 131: 'water', 132: 'normal', 149: 'dragon', 160: 'water', 162: 'normal',
    177: 'psychic', 179: 'electric', 190: 'normal', 194: 'water', 198: 'dark', 215: 'dark',
    216: 'normal', 217: 'normal', 224: 'water', 231: 'ground', 232: 'ground', 243: 'electric',
    261: 'dark', 262: 'dark', 263: 'normal', 264: 'normal', 279: 'water', 302: 'dark',
    319: 'water', 323: 'fire', 352: 'normal', 365: 'ice', 393: 'water', 395: 'water',
    399: 'normal', 417: 'electric', 418: 'water', 427: 'normal', 434: 'poison', 446: 'normal',
    448: 'fighting', 449: 'ground', 501: 'water', 509: 'dark', 510: 'dark', 523: 'electric',
    550: 'water', 572: 'normal', 587: 'electric', 614: 'ice', 626: 'normal', 631: 'fire',
    650: 'grass', 656: 'water', 660: 'normal', 667: 'fire', 668: 'fire', 673: 'grass',
    674: 'fighting', 695: 'electric', 697: 'rock', 710: 'ghost', 720: 'psychic', 727: 'fire',
    744: 'rock', 745: 'rock', 749: 'ground', 765: 'normal', 766: 'fighting', 775: 'normal',
    821: 'flying', 877: 'electric', 899: 'normal', 901: 'ground', 912: 'water', 914: 'water',
    926: 'fairy', 942: 'dark', 963: 'water', 964: 'water', 973: 'flying', 974: 'ice',
    975: 'ice', 981: 'normal', 1007: 'fighting',
  };

  const TYPE_COLORS = {
    normal: '#a8a878', fire: '#f08030', water: '#6890f0', electric: '#f8d030',
    grass: '#78c850', ice: '#98d8d8', fighting: '#c03028', poison: '#a040a0',
    ground: '#e0c068', flying: '#a890f0', psychic: '#f85888', bug: '#a8b820',
    rock: '#b8a038', ghost: '#705898', dragon: '#7038f8', dark: '#705848',
    steel: '#b8b8d0', fairy: '#ee99ac',
  };

  function typeColor(poke) {
    // Forms and wink sprites without their own entry use the species' type.
    return poke.color || TYPE_COLORS[TYPES[poke.sprite] || TYPES[poke.dex]] || null;
  }

  // Settle each animal's Pokémon once, so its avatar and name always agree.
  // Animals Google adds later still get a Pokémon: hash the name onto a mapped animal.
  const KNOWN = Object.keys(ANIMALS);
  function standIn(key) {
    let h = 0;
    for (const c of key) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    return ANIMALS[KNOWN[h % KNOWN.length]];
  }

  const picks = new Map();
  function pick(key) {
    if (!picks.has(key)) {
      const a = ANIMALS[key] || standIn(key);
      const options = [a, ...(a.alts || [])];
      let choice = options[Math.floor(Math.random() * options.length)];
      if (choice.wink && Math.random() < 0.5) choice = { ...choice, sprite: `${choice.sprite || choice.dex}-wink` };
      picks.set(key, choice);
    }
    return picks.get(key);
  }

  const GEN_RANGES = [
    [1, 1, 151], [2, 152, 251], [3, 252, 386], [4, 387, 493], [5, 494, 649],
    [6, 650, 721], [7, 722, 809], [8, 810, 905], [9, 906, 1025],
  ];

  // ---------------------------------------------------------------------------
  // SPRITE LOADING
  // ---------------------------------------------------------------------------

  // All images are fetched through GM_xmlhttpRequest and turned into data: URLs,
  // which sidesteps Docs' CSP and CORS for both modes.
  const spriteCache = new Map(); // animal key -> Promise<dataURL|null>
  const servedFrom = new Map();  // animal key -> URL the sprite actually came from
  const sheetCache = new Map();  // sheet url -> Promise<ImageBitmap>

  function fetchBlob(url) {
    return new Promise((resolve, reject) => {
      GM_xmlhttpRequest({
        method: 'GET',
        url,
        responseType: 'blob',
        onload: (r) => (r.status >= 200 && r.status < 300 ? resolve(r.response) : reject(new Error(`${r.status} ${url}`))),
        onerror: () => reject(new Error(`network error ${url}`)),
      });
    });
  }

  function blobToDataURL(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  function fillTemplate(template, poke) {
    return template
      .replace(/\{sprite\}/g, poke.sprite || String(poke.dex))
      .replace(/\{dex3\}/g, String(poke.dex).padStart(3, '0'))
      .replace(/\{dex\}/g, String(poke.dex))
      .replace(/\{name\}/g, poke.name.toLowerCase().replace(/[^a-z0-9]/g, ''));
  }

  function genOf(dex) {
    const hit = GEN_RANGES.find(([, lo, hi]) => dex >= lo && dex <= hi);
    return hit ? hit[0] : null;
  }

  async function cropFromSheet(poke) {
    const sheet = SPRITE_SOURCE.sheets[genOf(poke.dex)];
    if (!sheet) throw new Error(`no sheet configured for gen ${genOf(poke.dex)} (${poke.name})`);

    if (!sheetCache.has(sheet.url)) {
      sheetCache.set(sheet.url, fetchBlob(sheet.url).then((b) => createImageBitmap(b)));
    }
    const bitmap = await sheetCache.get(sheet.url);

    const { cellWidth: w, cellHeight: h, cols } = sheet;
    const [col, row] = (sheet.positions && sheet.positions[poke.dex]) || (() => {
      const i = poke.dex - sheet.firstDex;
      return [i % cols, Math.floor(i / cols)];
    })();
    const x = (sheet.offsetX || 0) + col * (w + (sheet.gapX || 0));
    const y = (sheet.offsetY || 0) + row * (h + (sheet.gapY || 0));

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    canvas.getContext('2d').drawImage(bitmap, x, y, w, h, 0, 0, w, h);
    return canvas.toDataURL('image/png');
  }

  function getSprite(key) {
    if (!spriteCache.has(key)) {
      const poke = pick(key);
      let p;
      if (SPRITE_OVERRIDES[key]) p = fetchBlob(SPRITE_OVERRIDES[key]).then(blobToDataURL);
      else if (SPRITE_SOURCE.mode === 'sheets') p = cropFromSheet(poke);
      else {
        const urls = [].concat(SPRITE_SOURCE.url)
          .map((t) => (typeof t === 'function' ? t(poke) : fillTemplate(t, poke)))
          .filter(Boolean);
        p = urls.reduce((prev, url) => prev.catch(() => fetchBlob(url).then((b) => {
          servedFrom.set(key, url);
          return b;
        })), Promise.reject(new Error('no url'))).then(blobToDataURL);
      }
      spriteCache.set(key, p.catch((e) => {
        console.warn('[Anonymous Pokémon]', e);
        return null;
      }));
    }
    return spriteCache.get(key);
  }

  // ---------------------------------------------------------------------------
  // AVATAR REPLACEMENT
  // ---------------------------------------------------------------------------

  // Matches both chicken_lg.png and the newer chicken_lg_2.png style.
  const AVATAR_RE = /\/docs\/common\/profile\/([a-z]+)(?:_[a-z0-9]+)+\.(?:png|svg|jpg|webp)/i;
  const DONE = 'data-anon-pokemon';

  function animalFromUrl(url) {
    const m = url && url.match(AVATAR_RE);
    return m ? m[1].toLowerCase() : null;
  }

  function isPainted(el) {
    const bg = getComputedStyle(el).backgroundColor;
    return bg && bg !== 'transparent' && !/rgba\(.*,\s*0\)$/.test(bg);
  }

  function styleSprite(el, key) {
    if (PIXELATED) el.style.imageRendering = 'pixelated';
    if (BACKGROUND !== 'type') return;
    const color = typeColor(pick(key));
    if (!color) return;
    // Google's colour may sit on the avatar itself or on a wrapper around it.
    el.style.backgroundColor = color;
    const parent = el.parentElement;
    if (parent && isPainted(parent)) {
      const a = el.getBoundingClientRect();
      const b = parent.getBoundingClientRect();
      if (Math.abs(a.width - b.width) < 16 && Math.abs(a.height - b.height) < 16) parent.style.backgroundColor = color;
    }
  }

  async function replaceImg(img) {
    // Our own data: URLs never match, so this only re-runs if Docs resets the src.
    const key = animalFromUrl(img.currentSrc || img.src);
    if (!key) return;
    // Google's alt is the viewer's display name in the user's language
    // ("Anonymous Chicken", "Anonymer Ameisenbär"); learn it before it's swapped.
    const original = img.getAttribute('alt') || img.getAttribute('aria-label') || '';
    learnName(original, key);
    img.setAttribute(DONE, key);
    const data = await getSprite(key);
    if (!data || img.getAttribute(DONE) !== key) return;
    img.removeAttribute('srcset');
    img.src = data;
    img.style.objectFit = 'contain';
    styleSprite(img, key);
    // alt only: a title attribute would add a browser tooltip on top of Google's hover card.
    img.alt = original.trim() ? localized(original.trim(), key) : `Anonymous ${pick(key).name}`;
  }

  async function replaceBackground(el) {
    const key = animalFromUrl(el.style.backgroundImage);
    if (!key) return;
    el.setAttribute(DONE, key);
    const data = await getSprite(key);
    if (!data || el.getAttribute(DONE) !== key) return;
    el.style.backgroundImage = `url("${data}")`;
    el.style.backgroundSize = 'contain';
    el.style.backgroundRepeat = 'no-repeat';
    el.style.backgroundPosition = 'center';
    styleSprite(el, key);
  }

  // ---------------------------------------------------------------------------
  // NAME REPLACEMENT
  // ---------------------------------------------------------------------------

  const LABEL_TO_KEY = new Map(Object.entries(ANIMALS).map(([k, a]) => [a.label.toLowerCase(), k]));
  const labels = Object.values(ANIMALS)
    .map((a) => a.label)
    .sort((a, b) => b.length - a.length) // longest first so "Blue Whale" beats "Whale"
    .map((l) => l.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const NAME_RE = new RegExp(`\\b(Anonymous)\\s+(${labels.join('|')})\\b`, 'gi');
  const ATTRS = ['title', 'aria-label', 'data-tooltip', 'alt', 'data-name'];

  // Never touch the document body itself, only Docs UI chrome.
  function inEditor(node) {
    const el = node.nodeType === 1 ? node : node.parentElement;
    return !!(el && el.closest('.kix-appview-editor, [contenteditable="true"], .waffle, .punch-viewer-content'));
  }

  // Display names read off avatars, e.g. "Anonymous Chicken" -> chicken. Covers
  // animals missing from ANIMALS and non-English UIs that NAME_RE can't match.
  const learned = new Map();

  function localized(label, key) {
    const name = pick(key).name;
    if (/anonymous/i.test(label)) return label.replace(/(anonymous)\s+.*$/i, `$1 ${name}`);
    return `${label.split(/\s+/)[0]} ${name}`; // "Anonymer Ameisenbär" -> "Anonymer Heatmor"
  }

  function learnName(text, key) {
    const label = text.trim();
    // Need "<word> <animal>": a one-word label would match inside its own replacement.
    if (!REPLACE_NAMES || learned.has(label) || label.split(/\s+/).length < 2) return;
    learned.set(label, key);
    queue(document.body); // the viewer list may already be on screen
  }

  function hasLearned(str) {
    for (const label of learned.keys()) if (str.includes(label)) return true;
    return false;
  }

  function swapNames(str) {
    let out = str.replace(NAME_RE, (_, anon, animal) => `${anon} ${pick(LABEL_TO_KEY.get(animal.toLowerCase())).name}`);
    for (const [label, key] of learned) {
      if (out.includes(label)) out = out.split(label).join(localized(label, key));
    }
    return out === str ? null : out;
  }

  function replaceText(node) {
    const next = swapNames(node.nodeValue);
    if (next !== null && next !== node.nodeValue) node.nodeValue = next;
  }

  function replaceAttrs(el) {
    for (const attr of ATTRS) {
      const v = el.getAttribute(attr);
      if (!v) continue;
      const next = swapNames(v);
      if (next !== null && next !== v) el.setAttribute(attr, next);
    }
  }

  // ---------------------------------------------------------------------------
  // SOURCE LINKS
  // Ctrl/Shift/Cmd + click a swapped avatar to open where its art came from.
  // While the modifier is held over an avatar, a small tooltip shows the URL.
  // A plain click is left alone, so Google's own click behaviour still works.
  // ---------------------------------------------------------------------------

  const SPRITERS_RESOURCE = 'https://www.spriters-resource.com/3ds/pokemonshuffle/';

  function sourceUrl(key) {
    const poke = pick(key);
    const served = servedFrom.get(key) || '';
    const entry = DEVIANTART[poke.sprite || poke.dex];
    if (entry && served.includes('wixmp.com')) return `https://www.deviantart.com/loran-hemlock/art/${entry[0]}`;
    if (served.includes('/PokeAPI/')) return 'https://github.com/PokeAPI/sprites';
    return served ? SPRITERS_RESOURCE : null;
  }

  const avatarAt = (target) => (target instanceof Element ? target.closest(`[${DONE}]`) : null);
  const withModifier = (e) => e.ctrlKey || e.shiftKey || e.metaKey;

  for (const type of ['mousedown', 'mouseup', 'click']) {
    document.addEventListener(type, (e) => {
      const el = avatarAt(e.target);
      if (!el || !withModifier(e)) return;
      const url = sourceUrl(el.getAttribute(DONE));
      if (!url) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      if (type === 'click') window.open(url, '_blank', 'noopener');
    }, true);
  }

  let tip = null;
  let hovered = null;
  let mouseX = 0;
  let mouseY = 0;

  function showTip(e) {
    const url = hovered && sourceUrl(hovered.getAttribute(DONE));
    if (!url || !withModifier(e)) return hideTip();
    if (!tip) {
      tip = document.createElement('div');
      Object.assign(tip.style, {
        position: 'fixed', zIndex: 2147483647, pointerEvents: 'none', padding: '4px 8px',
        borderRadius: '4px', background: '#3c4043', color: '#fff', font: '12px/1.4 sans-serif',
        whiteSpace: 'nowrap', boxShadow: '0 1px 3px rgba(0,0,0,.3)',
      });
    }
    tip.textContent = url;
    if (!tip.isConnected) document.body.appendChild(tip);
    tip.style.left = `${Math.max(8, Math.min(mouseX + 12, innerWidth - tip.offsetWidth - 8))}px`;
    tip.style.top = `${mouseY + 16}px`;
  }

  function trackMouse(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
  }

  function hideTip() {
    if (tip) tip.remove();
  }

  document.addEventListener('mouseover', (e) => {
    trackMouse(e);
    hovered = avatarAt(e.target);
    hovered ? showTip(e) : hideTip();
  }, true);
  document.addEventListener('mousemove', (e) => {
    trackMouse(e);
    if (hovered) showTip(e);
  }, true);
  document.addEventListener('keydown', (e) => hovered && showTip(e), true);
  document.addEventListener('keyup', (e) => hovered && showTip(e), true);
  window.addEventListener('blur', hideTip);

  // ---------------------------------------------------------------------------
  // SCANNING
  // ---------------------------------------------------------------------------

  function processElement(el) {
    if (el.tagName === 'IMG') replaceImg(el);
    if (el.style && el.style.backgroundImage) replaceBackground(el);
    if (REPLACE_NAMES && !inEditor(el)) replaceAttrs(el);
  }

  function scan(root) {
    if (root.nodeType === 3) {
      if (REPLACE_NAMES && !inEditor(root)) replaceText(root);
      return;
    }
    if (root.nodeType !== 1) return;

    processElement(root);
    root.querySelectorAll('img, [style*="background"], [title], [aria-label], [data-tooltip]').forEach(processElement);

    if (REPLACE_NAMES && !inEditor(root)) {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
        acceptNode: (n) => ((/anonymous/i.test(n.nodeValue) || hasLearned(n.nodeValue)) && !inEditor(n)
          ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT),
      });
      for (let n = walker.nextNode(); n; n = walker.nextNode()) replaceText(n);
    }
  }

  // Batch mutations; Docs mutates the DOM constantly. setTimeout rather than
  // requestAnimationFrame so background tabs still get processed.
  const pending = new Set();
  let scheduled = false;
  function queue(node) {
    pending.add(node);
    if (scheduled) return;
    scheduled = true;
    setTimeout(() => {
      scheduled = false;
      const nodes = [...pending];
      pending.clear();
      nodes.forEach((n) => n.isConnected && scan(n));
    }, 50);
  }

  new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.type === 'childList') m.addedNodes.forEach(queue);
      else if (m.type === 'characterData') queue(m.target);
      else if (m.type === 'attributes') queue(m.target);
    }
  }).observe(document.documentElement, {
    childList: true,
    subtree: true,
    characterData: REPLACE_NAMES,
    attributes: true,
    attributeFilter: ['src', 'style', ...ATTRS],
  });

  scan(document.body);
})();
