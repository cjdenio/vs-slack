import React from "react";
import { Message } from "../../../src/types";

import Reaction from "./Reaction";

import MarkdownIt from "markdown-it";
import MarkdownItSlack from "markdown-it-slack";
import useUsers from "../lib/users";

const md = MarkdownIt().use(MarkdownItSlack);

export default ({ text, user, ts, reactions }: Message) => {
  const [{ profile, loading }] = useUsers([user]);

  return (
    <div className="message">
      <div
        className="message-avatar"
        style={{
          backgroundImage: loading ? null : `url('${profile.image_48}')`,
        }}
      />
      <div className="message-content">
        <div className={`message-username${loading ? " loading" : ""}`}>
          {!loading && (profile.display_name || profile.real_name)}
        </div>
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
