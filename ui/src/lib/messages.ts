import { useEffect, useState } from "react";
import { Message, Profile } from "../../../src/types";
import WebviewCommunicator from "../util/communicator";

export default function useMessages(comm: WebviewCommunicator) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    comm
      .send<any, Message[]>("msgs", {
        max: 20,
      })
      .then((msgs) => {
        setMessages(msgs);
        setLoading(false);
      });
  }, []);

  return { messages, loading };
}
