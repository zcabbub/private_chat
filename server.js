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

const assistantId = process.env.ASSISTANT_ID;

// Step 1: Create a thread for each participant
app.post("/thread", async (req, res) => {
  try {
    const thread = await openai.beta.threads.create();
    console.log("✅ Created new thread:", thread.id);
    res.json({ threadId: thread.id });
  } catch (err) {
    console.error("❌ Error creating thread:", err);
    res.status(500).send("Thread creation failed");
  }
});

// Step 2: Add a message + run the assistant
app.post("/msg", async (req, res) => {
  const { threadId, content } = req.body;

  console.log("📥 Incoming message request:", req.body);
  console.log("  - Thread ID:", threadId);
  console.log("  - Message Content:", content);

  if (!threadId) {
    return res.status(400).send("Missing threadId");
  }
  if (!content) {
    return res.status(400).send("Missing content");
  }
  if (!assistantId) {
    return res.status(500).send("Missing ASSISTANT_ID in environment variables");
  }

  try {
    // 🔹 Add user message to thread
    const userMessage = await openai.beta.threads.messages.create(threadId, {
      role: "user",
      content,
    });
    console.log("📝 User message added:", userMessage.id);

    // 🔹 Run the assistant
    const run = await openai.beta.threads.runs.create(threadId, {
      assistant_id: assistantId,
    });
    console.log("🚀 Assistant run started:", run.id);
    console.log("🔍 Using threadId:", threadId, "runId:", run.id);

    // 🔄 Poll for run completion (with error handling)
    let runStatus;
    let attempts = 0;
    const maxAttempts = 30; // 30 seconds timeout
    
    do {
      await new Promise(r => setTimeout(r, 10000));
      runStatus = await openai.beta.threads.runs.retrieve(run.id, {thread_id: threadId});
      attempts++;
      if (runStatus.status === "failed") {
        throw new Error(`Run failed: ${runStatus.last_error?.message || 'Unknown error'}`);
      }
    } while (runStatus.status !== "completed" && attempts < maxAttempts);

      if (runStatus.status !== "completed") {
        throw new Error("Timed out waiting for completion");
      }

    // now it's safe to list the messages:
    const messages = await openai.beta.threads.messages.list(threadId);
    console.log("📋 Retrieved", messages.data.length, "messages");
    
    // Find the most recent assistant message
    const assistantMessages = messages.data.filter(msg => msg.role === "assistant");
    const latestAssistantMessage = assistantMessages[0]; // Messages are returned in reverse chronological order

    // Safely extract reply text
    let replyText = "No reply found.";
    if (latestAssistantMessage && latestAssistantMessage.content && latestAssistantMessage.content.length > 0) {
      const textContent = latestAssistantMessage.content.find(c => c.type === "text");
      if (textContent && textContent.text && textContent.text.value) {
        replyText = textContent.text.value;
      }
    }

    console.log("💬 Assistant reply:", replyText);
    res.json({ reply: replyText });
    
  } catch (err) {
    console.error("❌ Error during message handling:", err);
    console.error("❌ Error details:", {
      message: err.message,
      stack: err.stack,
      threadId,
      assistantId
    });
    res.status(500).json({ 
      error: "Message processing failed", 
      details: err.message 
    });
  }
});

app.listen(4000, () => {
  console.log("✅ Backend listening on http://localhost:4000");
  console.log("🔑 Assistant ID:", assistantId ? "✅ Set" : "❌ Missing");
});
















// import express from "express";
// import cors from "cors";
// import dotenv from "dotenv";
// import OpenAI from "openai";

// dotenv.config();
// const app = express();
// app.use(cors());
// app.use(express.json());

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// const assistantId = process.env.ASSISTANT_ID; // "asst_YOUR_ASSISTANT_ID"; // ← Replace in .env

// // Step 1: Create a thread for each participant
// app.post("/thread", async (req, res) => {
//   try {
//     const thread = await openai.beta.threads.create();
//     console.log("✅ Created new thread:", thread.id);
//     res.json({ threadId: thread.id });
//   } catch (err) {
//     console.error("❌ Error creating thread:", err);
//     res.status(500).send("Thread creation failed");
//   }
// });


// // Step 2: Add a message + run the assistant
// app.post("/msg", async (req, res) => {
//   const { threadId, content } = req.body;

//   console.log("📥 Incoming message request:", req.body);
//   console.log("  - Thread ID:", threadId);
//   console.log("  - Message Content:", content);

// if (!threadId) {
//   return res.status(400).send("Missing threadId");
// }
// if (!content) {
//   return res.status(400).send("Missing content");
// }
  
// // try {
// //     // 🔹 Add user message to thread
// //     const userMessage = await openai.beta.threads.messages.create(threadId, {
// //       role: "user",
// //       content,
// //     });
// //     console.log("📝 User message added:", userMessage.id);

// //     // 🔹 Run the assistant
// //     const run = await openai.beta.threads.runs.create(threadId, {
// //       assistant_id: assistantId,
// //     });
// //     console.log("🚀 Assistant run started:", run.id);

// //     // 🔄 Poll for run completion
// //     let status;
// //     do {
// //       await new Promise((r) => setTimeout(r, 1000)); // wait 1 second
// //       status = await openai.beta.threads.runs.retrieve(threadId, run.id);
// //       console.log("🔄 Run status:", status.status);
// //     } while (status.status !== "completed");

// //     // 🔹 Get assistant response
// //     const messages = await openai.beta.threads.messages.list(threadId);
// //     const reply = messages.data.find((msg) => msg.role === "assistant");

// //     const replyText = reply?.content[0]?.text?.value || "No reply.";

// //     console.log("💬 Assistant reply:", replyText);

// //     res.json({ reply: replyText });
// //   } catch (err) {
// //     console.error("❌ Error during message handling:", err);
// //     res.status(500).send("Message processing failed");
// //   }

// try {
//   // 🔹 Add user message to thread
//   const userMessage = await openai.beta.threads.messages.create(threadId, {
//     role: "user",
//     content,
//   });
//   console.log("📝 User message added:", userMessage.id);

//   // 🔹 Run the assistant
//   const run = await openai.beta.threads.runs.create(threadId, {
//     assistant_id: assistantId,
//   });
//   console.log("🚀 Assistant run started:", run.id);

//   // 🔄 Poll for run completion (with error handling)
//   let status;
//   let attempts = 0;
//   const maxAttempts = 30; // 30 seconds timeout
//   do {
//     await new Promise((r) => setTimeout(r, 1000));
//     status = await openai.beta.threads.runs.retrieve(threadId, run.id);
//     console.log("🔄 Run status:", status.status);
//     attempts++;
//     if (status.status === "failed" || status.status === "cancelled") {
//       throw new Error(`Run ${status.status}`);
//     }
//   } while (status.status !== "completed" && attempts < maxAttempts);

//   if (attempts === maxAttempts) {
//     throw new Error("Run timed out");
//   }

//   // 🔹 Get assistant response
//   const messages = await openai.beta.threads.messages.list(threadId);
//   const reply = messages.data.find((msg) => msg.role === "assistant");

//   // Safely extract reply text
//   let replyText = "No reply.";
//   if (reply && reply.content && reply.content.length > 0) {
//     const textObj = reply.content.find((c) => c.type === "text");
//     replyText = textObj?.text?.value || "No reply.";
//   }

//   console.log("💬 Assistant reply:", replyText);

//   res.json({ reply: replyText });
// } catch (err) {
//   console.error("❌ Error during message handling:", err);
//   res.status(500).send("Message processing failed");
// }
// // ...existing code...

// });



// //   try {
// //     await openai.beta.threads.messages.create(threadId, {
// //       role: "user",
// //       content,
// //     });

// //     const run = await openai.beta.threads.runs.create(threadId, {
// //       assistant_id: assistantId,
// //     });

// //     let status;
// //     do {
// //       await new Promise((r) => setTimeout(r, 1000));
// //       status = await openai.beta.threads.runs.retrieve(threadId, run.id);
// //     } while (status.status !== "completed");

// //     const messages = await openai.beta.threads.messages.list(threadId);
// //     const reply = messages.data.find((msg) => msg.role === "assistant");

// //     res.json({ reply: reply?.content[0]?.text?.value || "No reply." });
// //   } catch (err) {
// //     console.error(err);
// //     res.status(500).send("Message processing failed");
// //   }
// // });

// app.listen(4000, () => {
//   console.log("✅ Backend listening on http://localhost:4000");
// });

