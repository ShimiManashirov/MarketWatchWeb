require('dotenv').config();
const apiKey = process.env.OPENROUTER_API_KEY || "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";

fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        model: "google/gemini-2.0-flash-001",
        messages: [{ role: "user", content: "Hi" }]
    })
})
    .then(r => r.text())
    .then(text => {
        console.log("=== OPENROUTER RESPONSE ===");
        console.log(text);
    })
    .catch(err => console.error("Fetch failed:", err));
