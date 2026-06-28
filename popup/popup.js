document.addEventListener("DOMContentLoaded", async () => {
    const toggleCheckbox = document.getElementById("timeline-toggle-checkbox");
    const apiKeyInput = document.getElementById("api-key-input");
    const saveKeyBtn = document.getElementById("save-key-btn");
    const saveStatus = document.getElementById("save-status");

    // Restore Timeline Toggle State
    const { timelineState } = await chrome.storage.local.get(["timelineState"]);
    toggleCheckbox.checked = (timelineState === "hidden");

    // Restore Saved API Key (if any exists)
    const { geminiApiKey } = await chrome.storage.local.get(["geminiApiKey"]);
    if (geminiApiKey) {
        apiKeyInput.value = geminiApiKey;
    }

    // Listen for changes on the timeline toggle switch
    toggleCheckbox.addEventListener("change", () => {
        chrome.runtime.sendMessage({ action: 'toggleTimeline' });
    });

    // Handle Saving the API Key
    saveKeyBtn.addEventListener("click", async () => {
        const inputKey = apiKeyInput.value.trim();

        await chrome.storage.local.set({ geminiApiKey: inputKey });
        
        saveStatus.style.color = "green";
        saveStatus.textContent = "Saved successfully!";
        
        setTimeout(() => {
            saveStatus.textContent = "";
        }, 2000);
    });
});