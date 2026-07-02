# DeLinked

![DeLinked icon](icon.png)

A browser extension to block the LinkedIn feed and use AI to translate corporate slop into what they actually mean.

## Features
* **Cross-Browser Support**: Works natively on Chrome and Firefox
* **Feed Blocker**: Cuts out the corporate noise entirely.
* **Debullshitify Button**: Strips the cringe and AI-generated text down to the actual truth.

## Motivation
LinkedIn is just AI slop and corporate cringe. Everyone uses ChatGPT to make long, fake stories to make themselves look important. DeLinked exists to mock them.

## Installation & Setup

### 1. Build the Extension
Because the extension supports multiple browsers, you need to compile it first.

Clone the repository, install any dependencies, and run the build script:
```bash
node build.js

```

This will generate a `build/` directory containing separate `chrome` and `firefox` folders.

### 2. Load it into your Browser

* **For Chrome:**
1. Open a new tab and go to `chrome://extensions/`.
2. Enable **Developer mode** (top-right toggle).
3. Click **Load unpacked** in the top left.
4. Select the `build/chrome` folder from this project.


* **For Firefox:**
1. Open a new tab and go to `about:debugging#/runtime/this-firefox`.
2. Click **Load Temporary Add-on...**
3. Navigate to the `build/firefox` folder and select the `manifest.json` file.


### 3. Connect your API Key

Open the extension popup from your browser toolbar and paste in your [Gemini API key](https://aistudio.google.com/app/api-keys) to power the AI translations.

## Screenshot
![Popup screenshot](popup.png)
