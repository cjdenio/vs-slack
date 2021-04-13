import React, { useEffect, useRef, useState } from "react";
import { Message } from "./types/Message";

import UIMessage from "./components/Message";

const vscode = acquireVsCodeApi();

export default () => {
  const [messages, setMessages] = useState<Message[]>([]);

  const input = useRef(null);
  const messagesContainer = useRef(null);

  useEffect(() => {
    window.addEventListener("message", onMessage);

    return () => {
      window.removeEventListener("message", onMessage);
    };
  });

  useEffect(() => {
    messagesContainer.current.scrollTop =
      messagesContainer.current.scrollHeight;
  });

  const onMessage = (e: MessageEvent) => {
    const {
      data: { data, cmd },
    } = e;
    switch (cmd) {
      case "msg":
        setMessages([...messages, data]);
        break;
      case "msgs":
        data.reverse();
        setMessages([...messages, ...data]);
        break;
      case "msgedit":
        setMessages(
          messages.map((i) => {
            return i.ts == data.ts ? { ...i, text: data.text } : i;
          })
        );
        break;
      case "msgdel":
        console.log(`deleting ${data.ts}`);
        setMessages(messages.filter((i) => i.ts != data.ts));
        break;
    }
  };

  const sendMessage = (text: string) => {
    vscode.postMessage({
      cmd: "msg",
      data: {
        text,
      },
    });
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
          return <UIMessage key={message.ts} {...message} />;
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
    </div>
  );
};
