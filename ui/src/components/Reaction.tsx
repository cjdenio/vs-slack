import React from "react";

export default (props: {
  num: number;
  emoji: string;
  highlighted: boolean;
}) => {
  return (
    <div className={`reaction ${props.highlighted ? "highlighted" : ""}`}>
      <span className="reaction-emoji">
        <img src="https://emoji.slack-edge.com/T0266FRGM/upvote/200c668ba60cae23.png" />
      </span>
      <span className="reaction-number">
        <b>{props.num}</b>
      </span>
    </div>
  );
};
