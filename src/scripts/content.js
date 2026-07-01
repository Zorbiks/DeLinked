function injectDebullshitifyToActionBar() {
    const sendAnchors = document.querySelectorAll(`
        a[aria-label="Send"],
        button[aria-label="Send"],
        button[aria-label="Send in a private message"],
        .send-privately-button,
        [componentkey*="share-action"]
    `);

    sendAnchors.forEach((sendBtn) => {
        if (sendBtn.nextElementSibling && sendBtn.nextElementSibling.classList.contains("delinked-debullshitify-btn")) {
            return;
        }

        const debullshitActionBtn = document.createElement("button");
        debullshitActionBtn.type = "button";
        debullshitActionBtn.className = "delinked-debullshitify-btn";
        debullshitActionBtn.innerHTML = `<span class="delinked-btn-text">Debullshitify</span>`;
        debullshitActionBtn.dataset.state = "original";

        debullshitActionBtn.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();

            if (debullshitActionBtn.classList.contains("is-loading")) return;

            const state = debullshitActionBtn.dataset.state;

            // Find the post card
            const postCard =
                sendBtn.closest('[role="listitem"]') ||
                sendBtn.closest('[role="article"]') ||
                sendBtn.closest("[data-urn]") ||
                sendBtn.closest(".beb12872");

            if (!postCard) {
                console.warn("DeLinked: Could not find the post card container.");
                return;
            }

            // Find the text container
            const getTextContainer = () =>
                postCard.querySelector('[data-testid="expandable-text-box"]') ||
                postCard.querySelector(".feed-shared-update-v2__description .update-components-text") ||
                postCard.querySelector(".feed-shared-inline-show-more-text .update-components-text");

            
            // Restore the original HTML back
            if (state === "debullshitified") {
                const originalHtml = debullshitActionBtn.dataset.originalHtml;
                if (originalHtml) {
                    const textContainer = getTextContainer();
                    if (textContainer) {
                        // Restore the full original DOM
                        textContainer.innerHTML = originalHtml;
                        debullshitActionBtn.dataset.state = "original";
                        debullshitActionBtn.innerHTML = `<span class="delinked-btn-text">Debullshitify</span>`;
                        debullshitActionBtn.classList.remove("is-restore");
                    }
                }
                return;
            }

            // Debullshitify
            const textContainer = getTextContainer();
            if (!textContainer) {
                console.warn("DeLinked: Text container not found inside this post card.");
                return;
            }

            // Save the full original innerHTML so we always have the real original to restore to
            debullshitActionBtn.dataset.originalHtml = textContainer.innerHTML;

            // Check if the post is truncated ("... more" button present).
            const moreBtn = textContainer.querySelector('[data-testid="expandable-text-button"]');
            const isTruncated = !!moreBtn;

            // Extract clean text from a container and remove the "more" button
            // so it never leaks into the AI prompt
            const extractText = (container) => {
                const clone = container.cloneNode(true);
                const moreBtnClone = clone.querySelector('[data-testid="expandable-text-button"]');
                if (moreBtnClone) moreBtnClone.remove();
                return clone.textContent.trim();
            };

            // The function that reads text, calls AI, and swaps content
            const processText = () => {
                const liveContainer = getTextContainer();
                if (!liveContainer) {
                    console.warn("DeLinked: Container disappeared before processing.");
                    debullshitActionBtn.classList.remove("is-loading");
                    return;
                }

                const fullText = extractText(liveContainer);
                if (!fullText) {
                    console.warn("DeLinked: No text found to debullshitify.");
                    debullshitActionBtn.classList.remove("is-loading");
                    return;
                }

                browser.runtime.sendMessage({ action: "cleanText", text: fullText }, (response) => {
                    debullshitActionBtn.classList.remove("is-loading");

                    if (response && response.cleanedText) {
                        const finalContainer = getTextContainer();
                        if (finalContainer) {
                            // Replace the entire inner content with the cleaned text
                            finalContainer.textContent = response.cleanedText;
                        }
                        debullshitActionBtn.dataset.state = "debullshitified";
                        debullshitActionBtn.innerHTML = `<span class="delinked-btn-text">Restore</span>`;
                        debullshitActionBtn.classList.add("is-restore");
                    } else {
                        console.warn("DeLinked: API returned no text.");
                        // Restore original HTML so the post isn't left in a broken state
                        const fallbackContainer = getTextContainer();
                        if (fallbackContainer && debullshitActionBtn.dataset.originalHtml) {
                            fallbackContainer.innerHTML = debullshitActionBtn.dataset.originalHtml;
                        }
                    }
                });
            };

            debullshitActionBtn.classList.add("is-loading");

            if (isTruncated) {
                // Click the "more" button so LinkedIn reveals the full text in the DOM,
                // then wait a tick for the DOM update before reading.
                moreBtn.click();
                setTimeout(processText, 400);
            } else {
                processText();
            }
        });

        sendBtn.insertAdjacentElement("afterend", debullshitActionBtn);
    });
}

const observer = new MutationObserver(() => {
    injectDebullshitifyToActionBar();
});

observer.observe(document.body, { childList: true, subtree: true });
injectDebullshitifyToActionBar();