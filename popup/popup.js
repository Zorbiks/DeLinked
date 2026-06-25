const toggleTimelineBtn = document.getElementById("toggle-timeline-btn")

toggleTimelineBtn.addEventListener('click', () => {
    chrome.runtime.sendMessage({
        action: 'toggleTimeline'
    })
})