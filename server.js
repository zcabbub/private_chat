import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const assistantId = process.env.ASSISTANT_ID; // "asst_YOUR_ASSISTANT_ID"; // ← Replace this

// Step 1: Create a thread for each participant
app.post("/thread", async (req, res) => {
  try {
    const thread = await openai.beta.threads.create();
    res.json({ threadId: thread.id });
  } catch (err) {
    console.error(err);
    res.status(500).send("Thread creation failed");
  }
});

// Step 2: Add a message + run the assistant
app.post("/msg", async (req, res) => {
  const { threadId, content } = req.body;

  try {
    await openai.beta.threads.messages.create(threadId, {
      role: "user",
      content,
    });

    const run = await openai.beta.threads.runs.create(threadId, {
      assistant_id: assistantId,
    });

    let status;
    do {
      await new Promise((r) => setTimeout(r, 1000));
      status = await openai.beta.threads.runs.retrieve(threadId, run.id);
    } while (status.status !== "completed");

    const messages = await openai.beta.threads.messages.list(threadId);
    const reply = messages.data.find((msg) => msg.role === "assistant");

    res.json({ reply: reply?.content[0]?.text?.value || "No reply." });
  } catch (err) {
    console.error(err);
    res.status(500).send("Message processing failed");
  }
});

app.listen(4000, () => {
  console.log("✅ Backend listening on http://localhost:4000");
});

