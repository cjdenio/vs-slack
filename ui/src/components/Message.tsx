import React from "react";
import { Message } from "../types/Message";

import Reaction from "./Reaction";

import MarkdownIt from "markdown-it";
import MarkdownItSlack from "markdown-it-slack";

const md = MarkdownIt().use(MarkdownItSlack);

export default ({ text, username, avatar, ts, reactions }: Message) => {
  return (
    <div className="message">
      <img className="message-avatar" src={avatar} />
      <div className="message-content">
        <div className="message-username">{username}</div>
        <div
          className="message-text"
          dangerouslySetInnerHTML={{ __html: md.render(text) }}
        />
        {reactions.length > 0 && (
          <div style={{ display: "flex", marginTop: 5, flexWrap: "wrap" }}>
            {reactions.map(({ count, name }) => (
              <Reaction
                key={name}
                num={count}
                emoji={name}
                highlighted={false}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
