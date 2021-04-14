import React from "react";

export default (props: {
  num: number;
  emoji: string;
  highlighted: boolean;
}) => {
  return (
    <div className={`reaction ${props.highlighted ? "highlighted" : ""}`}>
      <span className="reaction-emoji">:{props.emoji}:</span>
      <span className="reaction-number">
        <b>{props.num}</b>
      </span>
    </div>
  );
};
