function injectDebullshitifyToActionBar() {
    const sendAnchors = document.querySelectorAll(`
        a[aria-label="Send"],
        button[aria-label="Send"],
        button[aria-label="Send in a private message"],
        .send-privately-button,
        [componentkey*="share-action"]
    `);

    sendAnchors.forEach((sendBtn) => {
        // Avoid double injection
        if (sendBtn.nextElementSibling && sendBtn.nextElementSibling.classList.contains("delinked-debullshitify-btn")) {
            return;
        }

        // Create the button
        const debullshitActionBtn = document.createElement("button");
        debullshitActionBtn.type = "button";
        debullshitActionBtn.className = "delinked-debullshitify-btn";
        debullshitActionBtn.innerHTML = `<span class="delinked-btn-text">Debullshitify</span>`;

        // Handle click
        debullshitActionBtn.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();

            // If already loading, ignore
            if (debullshitActionBtn.classList.contains("is-loading")) return;

            // Find the post card
            const postCard = sendBtn.closest('[role="listitem"]') ||
                             sendBtn.closest('[role="article"]') ||
                             sendBtn.closest("[data-urn]") ||
                             sendBtn.closest(".beb12872");

            if (!postCard) {
                console.warn("Could not find the post card container.");
                return;
            }

            // Find the text container
            let textContainer = postCard.querySelector('[data-testid="expandable-text-box"]');
            if (!textContainer) {
                textContainer = postCard.querySelector('.feed-shared-update-v2__description .update-components-text');
            }
            if (!textContainer) {
                textContainer = postCard.querySelector('.feed-shared-inline-show-more-text .update-components-text');
            }

            if (!textContainer) {
                console.warn("Target text box container not found inside this post card.");
                return;
            }

            // Extract original text (strip "more" button text if inside)
            let originalText = textContainer.innerText.trim();
            const moreBtnInside = textContainer.querySelector('[data-testid="expandable-text-button"]');
            if (moreBtnInside) {
                originalText = originalText.replace(moreBtnInside.innerText, "").trim();
            }

            if (!originalText) {
                console.warn("No text found to debullshitify.");
                return;
            }

            // Add loading state
            debullshitActionBtn.classList.add("is-loading");
            // Disable the button visually (already via pointer-events:none in CSS)
            // But we also want to prevent double clicks, which is already handled.

            // Send to background
            chrome.runtime.sendMessage({ action: "cleanText", text: originalText }, (response) => {
                // Remove loading state regardless of success/failure
                debullshitActionBtn.classList.remove("is-loading");

                if (response && response.cleanedText) {
                    textContainer.textContent = response.cleanedText;
                } else {
                    // Optionally show a temporary error message or just log
                    console.warn("Debullshitify failed or returned no text.");
                    // Could also set textContainer.textContent = "⚠️ Error: ..." but keep it simple
                }
            });
        });

        // Place the button next to the "Send" button
        sendBtn.insertAdjacentElement("afterend", debullshitActionBtn);
    });
}

// Observer and initial run
const observer = new MutationObserver(() => {
    injectDebullshitifyToActionBar();
});

observer.observe(document.body, {
    childList: true,
    subtree: true,
});

injectDebullshitifyToActionBar();