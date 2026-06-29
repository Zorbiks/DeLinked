const HIDE_TIMELINE_CSS = `
  #workspace > div > div > section > div {
      display: none !important;
  }
`;

// Unified Message Router
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "toggleTimeline") {
        handleToggleTimeline();
    } else if (message.action === "cleanText") {
        deBullshitifyWithGemini(message.text, sendResponse);
        return true; // Keep channel open for async fetch
    }
});

// Asynchronous handler for Gemini API
async function deBullshitifyWithGemini(text, sendResponse) {
    if (!text) {
        sendResponse({ cleanedText: "" });
        return;
    }

    // Fetch the user's custom API key out of extension storage dynamically
    const { geminiApiKey } = await chrome.storage.local.get(["geminiApiKey"]);

    if (!geminiApiKey) {
        sendResponse({ cleanedText: "⚠️ Please enter your Gemini API Key inside the extension popup window first." });
        return;
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`;

    const requestBody = {
        contents: [
            {
                parts: [
                    {
                        text: `You are the core backend engine for "Debullshitify", a cynical, uncompromising, and highly aggressive translator of LinkedIn posts. 

Your objective: Ruthlessly strip away all corporate fluff, artificial humility, and puffed-up metrics. Penetrate right through the corporate veneer and guess the raw, unvarnished truth.

You must correctly identify the tone of the poster:
- If the poster is genuinely bootlicking, kissing up to a corporation, or defending toxic workplace practices, expose their desperate sycophancy immediately.
- If the poster is being deeply sarcastic, cynical, or mocking a corporation's stupidity (like pointing out an impossible 10-year experience requirement for a 1-year-old tool), do NOT mistake their math/logic for defending the company. They are roasting them. Translate their joke into its rawest, most brutal punchline.

Output rules:
1. Provide ONLY the final translation. Do not include any intro/outro phrases.
2. Use strict plain text. Do NOT use any markdown formatting like asterisks for bolding, bullet points, or headers. 
3. Be brutally direct and straight to the point.

Translate this LinkedIn post:
"${text}"`,
                    },
                ],
            },
        ],
    };

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        });

        const data = await response.json();

        // Error checking in case the key is invalid or unauthorized
        if (data.error) {
            sendResponse({ cleanedText: `⚠️ API Error: ${data.error.message}` });
            return;
        }

        const cleanedText = data.candidates[0].content.parts[0].text.trim();
        sendResponse({ cleanedText: cleanedText });
    } catch (err) {
        console.error("Gemini API Error:", err);
        sendResponse({ cleanedText: "⚠️ Failed to connect to Gemini API." });
    }
}

// Logic Handlers
async function handleToggleTimeline() {
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab) return;
        const { timelineState } = await chrome.storage.local.get(["timelineState"]);
        const isCurrentlyShown = !timelineState || timelineState === "shown";

        if (isCurrentlyShown) {
            await chrome.scripting.insertCSS({ css: HIDE_TIMELINE_CSS, target: { tabId: tab.id } });
            await chrome.storage.local.set({ timelineState: "hidden" });
        } else {
            await chrome.scripting.removeCSS({ css: HIDE_TIMELINE_CSS, target: { tabId: tab.id } });
            await chrome.storage.local.set({ timelineState: "shown" });
        }
    } catch (err) {
        console.error("Error toggling timeline state:", err);
    }
}
