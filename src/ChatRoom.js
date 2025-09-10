//
import React, { useEffect, useState } from "react";
import { DeepChat } from "deep-chat-react";
import axios from "axios";

export default function ChatRoom() {
  const [threadId, setThreadId] = useState(null);
  const [loading, setLoading] = useState(true);

  const params = new URLSearchParams(window.location.search);
  const assistantType = params.get("assistantType");

  console.log("Assistant type from URL:", assistantType);

  // Step 1: store each user's thread ID persistently in localStorage (for browser use)
  useEffect(() => {
    const storedThreadId = localStorage.getItem("threadId");
    if (storedThreadId) {
      console.log("Using existing thread:", storedThreadId);
      setThreadId(storedThreadId);
      setLoading(false); // Thread ID is already there, so we're not loading
    } else {
      axios
        .post("/thread", {
          assistantType: assistantType, // Pass the assistant type to the backend
          }).then((res) => {
          localStorage.setItem("threadId", res.data.threadId);
          setThreadId(res.data.threadId);
          setLoading(false); // Thread ID created, stop loading
        })
        .catch((err) => console.error("Error creating thread", err));
        setLoading(false); // Error occurred, stop loading to show an error message
    }
  }, []);


  const handleSend = (body, signals) => {
    // A guard clause to prevent sending a message if threadId is not ready
    if (!threadId) {
      console.error("Thread ID is not set. Cannot send message.");
      signals.onResponse({ error: "Sorry, the chat is not ready yet." });
      return;
    }

    // Get the last message sent by the user
    const userText = body.messages[body.messages.length - 1].text;
    console.log("🔍 Message sent from DeepChat:", userText);

    // Make the POST request to your backend
    axios.post("/msg", {
      threadId,
      content: userText,
      assistantType: assistantType, 
    })
    .then(res => {
      // On success, use the onResponse signal to display the assistant's message
      console.log("✅ Assistant response received:", res.data.reply);
      signals.onResponse({ text: res.data.reply, role: 'assistant' });
    })
    .catch(err => {
      // On failure, use the onResponse signal to display an error message
      console.error("❌ Error sending message", err);
      signals.onResponse({ error: "Sorry, something went wrong." });
    });
  };


  // if (!threadId) return <div>Loading assistant...</div>;
  if (loading) {
    return <div>Loading chat...</div>;
  }
  return (
    <div style={{ maxWidth: "600px", margin: "auto" }}>
      <DeepChat
        connect={{ handler: handleSend }}
        textInput={{ placeholder: { text: "Type your message..." } }}
      />
    </div>
  );
}







  // V2 
  // // Step 2: Send a message + get a reply  
  // const handleSend = async (body, signals) => {
  //     console.log("🔍 Message sent from DeepChat:", body);
      
  //     const userText = body.messages[body.messages.length - 1].text;
      
  //     try {
  //       const res = await axios.post("http://localhost:4000/msg", {
  //         threadId,
  //         content: userText,
  //       });
  //       console.log("✅ Assistant response received:", res.data.reply);
        
  //       // Return in the format DeepChat expects
  //       return {
  //         messages: [{
  //           text: res.data.reply,
  //           role: 'ai'
  //         }]
  //       };

  //     } catch (err) {
  //       console.error("❌ Error sending message", err);
  //       return {
  //         messages: [{
  //           text: "Sorry, something went wrong.",
  //           role: 'ai'
            
  //         }]
  //       };
  //     }
  // };



  //  V1
  // const handleSend = async (body, signals) => {
  //   console.log("🔍 Message sent from DeepChat:", body);
    
  //   // Extract the latest message text
  //   const userText = body.messages[body.messages.length - 1].text;
    
  //  try {
  //     const res = await axios.post("http://localhost:4000/msg", {
  //       threadId,
  //       content: userText,
  //     });
  //     console.log("✅ Assistant response received:", res.data.reply);
      
  //     // Return just the messages array for DeepChat
  //     return [{
  //       text: res.data.reply,
  //       role: 'assistant'  // Adding role is recommended
  //     }];

  //   } catch (err) {
  //     console.error("❌ Error sending message", err);
  //     return [{
  //       text: "Sorry, something went wrong.",
  //       role: 'assistant'
  //     }];
  //   }
  // };






// // V2
// import React, { useEffect, useState } from "react";
// import { DeepChat } from "deep-chat-react";
// import axios from "axios";

// export default function ChatRoom() {
//   const [threadId, setThreadId] = useState(null);
 
//   // Step 1: store each user's thread ID persistently in localStorage (for browser use)
//   useEffect(() => {
//     const storedThreadId = localStorage.getItem("threadId");
//     if (storedThreadId) {
//       setThreadId(storedThreadId);
//     } else {
//       axios
//         .post("http://localhost:4000/thread")
//         .then((res) => {
//           localStorage.setItem("threadId", res.data.threadId);
//           setThreadId(res.data.threadId);
//         })
//         .catch((err) => console.error("Error creating thread", err));
//     }
//   }, []);

//   // Step 2: Send a message + get a reply  
//   const handleSend = async (body, signals) => {
//     console.log("🔍 Message sent from DeepChat:", body);
    
//     // Extract the latest message text
//     const userText = body.messages[body.messages.length - 1].text;
    
//     try {
//       const res = await axios.post("http://localhost:4000/msg", {
//         threadId,
//         content: userText,
//       });
//       console.log("✅ Assistant response received:", res.data.reply);
      
//       // Return in the format DeepChat expects
//       return { text: res.data.reply };
//     } catch (err) {
//       console.error("❌ Error sending message", err);
//       return { text: "Sorry, something went wrong." };
//     }
//   };

//   if (!threadId) return <div>Loading assistant...</div>;

//   return (
//     <div style={{ maxWidth: "600px", margin: "auto" }}>
//       <DeepChat
//         connect={{ handler: handleSend }}
//         textInput={{ placeholder: { text: "Type your message..." } }}
//       />
//     </div>
//   );
// }


// import React, { useEffect, useState } from "react";
// import {DeepChat} from "deep-chat-react";
// //import "deep-chat-react/style.css";
// import axios from "axios";

// export default function ChatRoom() {
//   const [threadId, setThreadId] = useState(null);


//   // Step 1: store each user’s thread ID persistently in localStorage (for browser use)
//   useEffect(() => {
//   const storedThreadId = localStorage.getItem("threadId");
//   if (storedThreadId) {
//     setThreadId(storedThreadId);
//   } else {
//     axios
//       .post("http://localhost:4000/thread")
//       .then((res) => {
//         localStorage.setItem("threadId", res.data.threadId);
//         setThreadId(res.data.threadId);
//       })
//       .catch((err) => console.error("Error creating thread", err));
//   }
// }, []);


//   // Step 2: Send a message + get a reply
// const handleSend = async (messageObject) => {
//   console.log("🔍 Message sent from DeepChat:", messageObject); // <-- add this
//   const userText = messageObject.text;
//   try {
//     const res = await axios.post("http://localhost:4000/msg", {
//       threadId,
//       content: userText,
//     });
//     console.log("✅ Assistant response received:", res.data.reply);
//     return { text: res.data.reply };
//   } catch (err) {
//     console.error("❌ Error sending message", err);
//     return { text: "Sorry, something went wrong." };
//   }
// };

//   if (!threadId) return <div>Loading assistant...</div>;

//   return (
//     <div style={{ maxWidth: "600px", margin: "auto" }}>
//       <DeepChat
//         onSend={handleSend}
//         userPlaceholder="Type your message..."
//         title="Chat with AI"
//       />
//     </div>
//   );
// }

