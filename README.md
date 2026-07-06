# Gloss

Vocabulary learning chrome extension tool built for non-native English speakers. Highlight any word or phrase while reading online and Gloss will instantly generate a context-specific definition based on the surrounding text, allowing you to understand vocabulary as it actually appears in real usage

![Gloss demo](demo.gif)

## Features

- Highlight any word or phrase to generate a context-specific definition
- Switch between 9 languages for the definition
- Save cards to a personal library
- Search and sort saved cards in the side panel
- Toggle Gloss on/off from the side panel

## Installation

Since this extension is pending Chrome Web Store review, you can load it manually:

1. Clone this repo
2. Create a `config.js` file in the root folder:
```js
const CONFIG = {
    GEMINI_API_KEY: "your-api-key-here"
};
```
3. Go to `chrome://extensions` in Chrome
4. Enable **Developer mode** (top right)
5. Click **Load unpacked** and select the cloned folder

Get a free Gemini API key at [aistudio.google.com](https://aistudio.google.com).

## Tech stack

- Vanilla JS, HTML, CSS
- Chrome Extensions API (Manifest V3)
- Gemini API (context-aware definitions)

## Roadmap

- ElevenLabs TTS for audio pronunciation
- Spaced repetition review system
- Highlight previously saved words while browsing