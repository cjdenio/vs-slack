export interface Reaction {
  name: string;
  users: string[];
  count: number;
}

export interface Message {
  text: string;
  user: string;
  ts: string;
  reactions: Reaction[];
}

export interface Profile {
  real_name?: string;
  display_name?: string;
  status_text?: string;
  status_emoji?: string;

  image_24?: string;
  image_48?: string;
}
