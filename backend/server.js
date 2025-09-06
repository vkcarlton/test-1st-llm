import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

const OLLAMA_API = process.env.OLLAMA_API || "http://ollama:11434/api/generate";

app.post("/chat", async (req, res) => {
	try {
		const userPrompt = req.body.prompt || "";

		const response = await fetch(OLLAMA_API, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			// ⚠️ important: disable streaming if you only want a single JSON
			// body: JSON.stringify({ model: "llama3", prompt: userPrompt, stream: false })

			// or: keep streaming and handle it manually
			body: JSON.stringify({
				model: "llama3",
				prompt: userPrompt,
				stream: false,
			}),
		});

		// ---- option A: non-streaming mode ----
		// if you use {stream:false} above:
		const data = await response.json();
		return res.json({ response: data.response });

		// ---- option B: streaming mode (default) ----
		let fullText = "";
		const reader = response.body.getReader();
		const decoder = new TextDecoder();

		while (true) {
			const { done, value } = await reader.read();
			if (done) break;
			const chunk = decoder.decode(value, { stream: true });

			for (const line of chunk.split("\n")) {
				if (!line.trim()) continue;
				try {
					const obj = JSON.parse(line);
					if (obj.response) fullText += obj.response;
				} catch (err) {
					console.error("Bad JSON line:", line);
				}
			}
		}

		return res.json({ response: fullText.trim() });
	} catch (err) {
		console.error("Backend error:", err);
		res.status(500).json({ error: err.message });
	}
});

app.listen(5000, () => {
	console.log("Backend running on http://localhost:5000");
});
