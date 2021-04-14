export interface Message {
  text: string;
  username: string;
  avatar: string;
  ts: string;
  reactions: { name: string; count: number }[];
}
