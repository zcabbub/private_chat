import React, { useEffect, useState } from "react";
import {DeepChat} from "deep-chat-react";
//import "deep-chat-react/style.css";
import axios from "axios";

export default function ChatRoom() {
  const [threadId, setThreadId] = useState(null);

  // Step 1: Get a new thread for this participant
  useEffect(() => {
    axios
      .post("http://localhost:4000/thread")
      .then((res) => setThreadId(res.data.threadId))
      .catch((err) => console.error("Error creating thread", err));
  }, []);

  // Step 2: Send a message + get a reply
  const handleSend = async (text) => {
    try {
      const res = await axios.post("http://localhost:4000/msg", {
        threadId,
        content: text,
      });
      return res.data.reply;
    } catch (err) {
      console.error("Error sending message", err);
      return "Sorry, something went wrong.";
    }
  };

  if (!threadId) return <div>Loading assistant...</div>;

  return (
    <div style={{ maxWidth: "600px", margin: "auto" }}>
      <DeepChat
        onSend={handleSend}
        userPlaceholder="Type your message..."
        title="Chat with AI"
      />
    </div>
  );
}

