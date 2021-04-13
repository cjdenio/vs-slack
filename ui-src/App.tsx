import React, { useEffect, useRef, useState } from "react";
import { Message } from "./types/Message";

import UIMessage from "./components/Message";

const vscode = acquireVsCodeApi();

export default () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const input = useRef(null);

  useEffect(() => {
    window.addEventListener("message", onMessage);

    return () => {
      window.removeEventListener("message", onMessage);
    };
  });

  const onMessage = (e: MessageEvent) => {
    const { data } = e;
    switch (data.cmd) {
      case "msg":
        setMessages([...messages, data.data]);
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
        padding: "10px 50px",
        boxSizing: "border-box",
      }}
    >
      <div style={{ flex: 1, overflow: "auto" }}>
        {messages.map((message) => {
          return <UIMessage key={message.ts} {...message} />;
        })}
      </div>
      <form
        onSubmit={(e) => e.preventDefault()}
        style={{
          display: "flex",
          width: "100%",
          // padding: "10px 0px",
          boxSizing: "border-box",
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
