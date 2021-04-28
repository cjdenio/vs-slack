import React, { useEffect, useRef, useState } from "react";
import { Message } from "../../src/types";

import UIMessage from "./components/Message";
import WebviewCommunicator from "./util/communicator";
import useMessages from "./lib/messages";
import communicator from "./conn";

function renderTyping(usernames: string[]): string {
  if (usernames.length == 0) return "";
  if (usernames.length > 4) return "Several people are typing";

  // https://stackoverflow.com/a/53879103/10987085
  if (usernames.length === 1) return usernames[0] + " is typing";
  const firsts = usernames.slice(0, usernames.length - 1);
  const last = usernames[usernames.length - 1];
  return firsts.join(", ") + " and " + last + " are typing";
}

export default () => {
  const { messages } = useMessages(communicator);
  const [typing, setTyping] = useState<
    { username: string; id: string; timeout: NodeJS.Timeout }[]
  >([]);

  function stopTypingIndicator(user: string) {
    setTyping(typing.filter((i) => i.id !== user));
    console.log("stopped for " + user);
  }

  const input = useRef(null);
  const messagesContainer = useRef(null);

  useEffect(() => {
    window.addEventListener("message", onMessage);

    communicator.send("msg", { text: "text" }).then((resp) => {
      console.log("Response: " + resp);
    });

    return () => {
      window.removeEventListener("message", onMessage);
    };
  }, []);

  useEffect(() => {
    messagesContainer.current.scrollTop =
      messagesContainer.current.scrollHeight;
  }, [messages]);

  const onMessage = (e: MessageEvent) => {
    console.log(e.data);
  };

  const sendMessage = (text: string) => {
    communicator.send("msg", { text });
  };

  const sendTypingIndicator = () => {
    communicator.send("typing", {});
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          flex: 1,
          overflow: "auto",
          padding: "10px 50px",
        }}
        ref={messagesContainer}
      >
        {messages.map((message) => {
          return (
            <UIMessage
              key={message.ts}
              reactions={
                {
                  // "🚀": [{ username: "Caleb" }, { username: "ricey" }],
                  // "🧲": [{ username: "ricey" }],
                  // "🦀": [{ username: "ricey" }],
                  // "🍇": [{ username: "ricey" }],
                  // "🥺": [{ username: "ricey" }],
                  // "😭": [{ username: "ricey" }],
                  // "🐢": [{ username: "ricey" }],
                  // "🚨": [{ username: "ricey" }],
                }
              }
              {...message}
            />
          );
        })}
      </div>
      <form
        onSubmit={(e) => e.preventDefault()}
        style={{
          display: "flex",
          width: "100%",
          boxSizing: "border-box",
          padding: "10px 50px",
        }}
      >
        <input
          type="text"
          placeholder="Message"
          style={{ flex: 1, marginRight: 10 }}
          ref={input}
          onInput={() => sendTypingIndicator()}
        />
        <button
          type="submit"
          onClick={() => {
            sendMessage(input.current.value);
            input.current.value = "";
          }}
        >
          Send
        </button>
      </form>
      <div
        className="under-message-bar"
        style={{
          width: "100%",
          boxSizing: "border-box",
          padding: "0 50px 10px 55px",
          minHeight: "25px",
        }}
      >
        <div className="typing">
          {renderTyping(typing.map((i) => i.username))}
        </div>
      </div>
    </div>
  );
};
