require('dotenv').config();
const apiKey = process.env.GEMINI_API_KEY;

const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents: [{ parts: [{ text: "Hi" }] }] })
})
    .then(r => r.text())
    .then(text => console.log("=== GEMINI RESPONSE ===", text))
    .catch(err => console.error("Fetch failed:", err));
