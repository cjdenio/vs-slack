import React from "react";
import { Message } from "../types/Message";

export default ({ text, username, avatar }: Message) => {
  return (
    <div className="message">
      <img className="message-avatar" src={avatar} />
      <div className="message-content">
        <div className="message-username">{username}</div>
        <div className="message-text">{text}</div>
      </div>
    </div>
  );
};
