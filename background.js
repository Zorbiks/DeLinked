const hideTimelineCss = `
#workspace > div > div > section > div {
    display: none
}
`;

chrome.runtime.onMessage.addListener((message) => {
    if (message.action === "toggleTimeline") {
        (async () => {
            const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
            const currentTabId = tabs[0].id;

            const result = await chrome.storage.local.get(["timelineState"]);

            const currentState = result.timelineState || "shown";

            if (currentState === "shown") {
                await chrome.scripting.insertCSS({
                    css: hideTimelineCss,
                    target: { tabId: currentTabId },
                });
                await chrome.storage.local.set({ timelineState: "hidden" });
            } else {
                await chrome.scripting.removeCSS({
                    css: hideTimelineCss,
                    target: { tabId: currentTabId },
                });
                await chrome.storage.local.set({ timelineState: "shown" });
            }
        })();
    }
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete") {
        const result = await chrome.storage.local.get(["timelineState"]);

        if (result.timelineState === "hidden") {
            try {
                await chrome.scripting.insertCSS({
                    css: hideTimelineCss,
                    target: { tabId: tabId },
                });
            } catch (err) {
                console.error("Failed to inject CSS on reload:", err);
            }
        }
    }
});
