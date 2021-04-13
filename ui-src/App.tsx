import React, { useEffect, useRef, useState } from "react";
import { Message } from "./types/Message";

import UIMessage from "./components/Message";

const vscode = acquireVsCodeApi();

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
  const [messages, setMessages] = useState<Message[]>([]);
  const [typing, setTyping] = useState<
    { username: string; id: string; timeout: NodeJS.Timeout }[]
  >([]);

  function stopTypingIndicator(user: string) {
    setTyping(typing.filter((i) => i.id != user));
    console.log("stopped for " + user);
  }

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
      case "typing":
        console.log("typing " + data.id);
        if (!typing.some((i) => i.id == data.id)) {
          // console.log(typing);
          // console.log(data.id);

          console.log("set " + data.id);
          setTyping([
            ...typing,
            {
              ...data,
              timeout: setTimeout(() => stopTypingIndicator(data.id), 6000),
            },
          ]);
        } else {
          // they're already typing
          setTyping(
            typing.map((i) => {
              if (i.id == data.id) {
                console.log("reset " + i.id);
                clearTimeout(i.timeout);

                i.timeout = setTimeout(() => stopTypingIndicator(i.id), 6000);
                return i;
              } else {
                return i;
              }
            })
          );
        }
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

  const sendTypingIndicator = () => {
    vscode.postMessage({
      cmd: "typing",
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
