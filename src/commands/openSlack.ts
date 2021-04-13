import * as vscode from "vscode";
import * as path from "path";
import { RTMClient } from "@slack/rtm-api";
import { WebClient } from "@slack/web-api";
import { isDate } from "node:util";

let panel: vscode.WebviewPanel | undefined = undefined;

async function getChannels(client: WebClient): Promise<vscode.QuickPickItem[]> {
  const resp = await client.users.conversations({
    exclude_archived: true,
    limit: 1000,
  });

  return (resp.channels as any).map((i: any) => {
    return {
      label: `#${i.name}`,
      description: i.topic.value || null,
    };
  });
}

function channelGetter(client: WebClient) {
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

export default (context: vscode.ExtensionContext) =>
  vscode.commands.registerCommand("vs-slack.openSlack", async () => {
    if (!panel) {
      const token = await context.secrets.get("vs-slack.token");
      if (!token) {
        vscode.window.showErrorMessage("Please log in first.");
        return;
      }

      const rtm = new RTMClient(token);
      const slack = new WebClient(token);

      const channels = channelGetter(slack);

      // Ask the user what channel to open
      const channel = await vscode.window.showQuickPick(
        channels.loadChannels(),
        {
          placeHolder: "Select a channel",
        }
      );

      if (!channel) {
        return;
      }

      const channelId = channels.getChannelId(channel.label.slice(1));
      if (!channelId) {
        vscode.window.showErrorMessage("Error getting channel information.");
        return;
      }

      console.log(channelId);

      panel = vscode.window.createWebviewPanel(
        "slack",
        "Slack",
        vscode.ViewColumn.Two,
        {
          enableScripts: true,
          retainContextWhenHidden: true,
        }
      );

      const bundleSrc = panel.webview.asWebviewUri(
        vscode.Uri.file(path.join(context.extensionPath, "out", "ui.js"))
      );
      panel.webview.html = getWebviewContent(bundleSrc);

      // Cache user avatars/username
      const users: { [id: string]: { username: string; avatar: string } } = {};

      const userInfo = async (
        id: string
      ): Promise<{ username: string; avatar: string }> => {
        if (users[id]) {
          console.log(`cached result for ${id}`);
          console.log(users);
          return users[id];
        }

        const user_obj = await slack.users.info({ user: id });
        const user = {
          username: (user_obj.user as any).real_name,
          avatar: (user_obj.user as any).profile.image_original,
        };

        users[id] = user;

        return user;
      };

      rtm.on("message", async (event) => {
        if (!event.subtype && event.channel == channelId) {
          console.log(event);

          const user = await userInfo(event.user);

          panel?.webview.postMessage({
            cmd: "msg",
            data: {
              username: user.username,
              text: event.text,
              avatar: user.avatar,
              ts: event.ts,
            },
          });
        }
      });

      panel.webview.onDidReceiveMessage(
        async (msg) => {
          const { cmd, data } = msg;

          switch (cmd) {
            case "msg":
              const message = await rtm.sendMessage(data.text, channelId);
              const user = await userInfo(rtm.activeUserId as string);

              panel?.webview.postMessage({
                cmd: "msg",
                data: {
                  username: user.username,
                  text: data.text,
                  avatar: user.avatar,
                  ts: message.ts,
                },
              });
              break;
          }
        },
        undefined,
        context.subscriptions
      );

      await rtm.start();

      panel.onDidDispose(
        async () => {
          panel = undefined;
          await rtm.disconnect();
          rtm.removeAllListeners();
        },
        {},
        context.subscriptions
      );
    } else {
      panel.reveal();
    }
  });

function getWebviewContent(bundleSrc: vscode.Uri) {
  return `<!DOCTYPE html>
  <html lang="en">
  <head>
	  <meta charset="UTF-8">
	  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body>
    <div id="root"></div>

    <script src="${bundleSrc}"></script>
  </body>
  </html>`;
}
