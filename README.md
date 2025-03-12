# Polyphonic

![Polyhonic Library Screen](preview.png)

## Summary
"Polyphonic" is a desktop music player that is built to support playback from Subsonic-compatible servers, as well as a user's local music directories (local music functionality is still a WIP).

## Tech Stack
![Tech Stack](https://skillicons.dev/icons?i=tauri,ts,react,vite,tailwind)

This project uses the 2.0 version of Tauri, and on the front-end utilizes modern React libraries such as Tanstack Router. The UI is based around Shadcn + Tailwind-friendly components, with minor manual CSS adjustments to account for more complex layouts (e.g. album grid).

## Current Features
* Ability to connect to a single Subsonic server
* Basic Subsonic library navigation (artist, album, and song selection)
* Basic playback functionality using the "stream" Subsonic API call
* Album art retrieval + local caching of album art
* Simple Light/Dark mode

## WIP (and Future Features)
* Support for multiple Subsonic libraries
* Support for local file libraries
* Download server tracks for offline functionality
* UI polish + improvements
* WebView2 UI adjustments
* Metadata + Album Art updates (if supported by the API)