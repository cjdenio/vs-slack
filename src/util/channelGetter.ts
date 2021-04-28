import { WebClient } from "@slack/web-api";
import * as vscode from "vscode";

export function channelGetter(client: WebClient) {
  return {
    async loadChannels(): Promise<vscode.QuickPickItem[]> {
      const resp = await client.users.conversations({
        exclude_archived: false,
        limit: 1000,
      });

      this.channels = resp.channels as any;

      return (resp.channels as any).map((i: any) => {
        return {
          label: `#${i.name}`,
          description: i.topic.value || null,
        };
      });
    },
    getChannelId(name: string): string | null {
      const channel = this.channels.find((i: any) => i.name == name);

      return channel ? (channel as any).id : null;
    },
    channels: [],
  };
}
