import express from "express";

const router = express.Router();

router.post("/ai", async (req, res) => {
  const { prompt } = req.body;
  console.log("AI REQUEST:", prompt);

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        }),
      }
    );

    const data: any = await response.json();

    console.log(data);

    const result =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "AI tidak merespon";

    res.json({ result });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      result: "Terjadi error pada AI",
    });
  }
});


export default router;