import express from "express";
import fetch from "node-fetch";

const app = express();
const BACKEND_API = process.env.BACKEND_API || "http://backend:5000/chat";

app.use(express.static("public"));
app.use(express.json());

app.post("/send", async (req, res) => {
	try {
		const { prompt } = req.body;

		const response = await fetch(BACKEND_API, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ prompt }),
		});

		const data = await response.json();
		res.json(data);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

app.listen(8080, () => {
	console.log("Frontend running on http://localhost:8080");
});
