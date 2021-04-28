import { useEffect, useState } from "react";

const emojis: { [name: string]: string } = {};

export default function useCustomEmoji(name: string) {
  const [emoji, setEmoji] = useState({ emoji: "", loading: true });

  useEffect(() => {}, []);

  return emoji;
}
