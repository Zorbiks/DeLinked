import { cp, rm } from "fs/promises";

async function build() {
    // clean old builds
    await rm("build/chrome", { recursive: true, force: true });
    await rm("build/firefox", { recursive: true, force: true });

    // copy source files
    await cp("src", "build/chrome", { recursive: true });
    await cp("src", "build/firefox", { recursive: true });

    // copy manifests
    await cp("manifest.chrome.json", "build/chrome/manifest.json");
    await cp("manifest.firefox.json", "build/firefox/manifest.json");

    console.log("Build complete");
}

build().catch((err) => {
    console.error("Build failed:", err);
});
