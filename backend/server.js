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
			body: JSON.stringify({
				model: "llama3",
				prompt: userPrompt,
				stream: false,
			}),
		});
		const data = await response.json();
		return res.json({ response: data.response });
	} catch (err) {
		console.error("Backend error:", err);
		res.status(500).json({ error: err.message });
	}
});

app.listen(5000, () => {
	console.log("Backend running on http://localhost:5000");
});
