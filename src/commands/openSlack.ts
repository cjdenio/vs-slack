import * as vscode from "vscode";
import * as path from "path";
import { RTMClient } from "@slack/rtm-api";
import { WebClient } from "@slack/web-api";

let panel: vscode.WebviewPanel | undefined = undefined;

const CHANNEL_ID = "C017MS0S4E6";

export default (context: vscode.ExtensionContext) =>
  vscode.commands.registerCommand("vs-slack.openSlack", async () => {
    if (!panel) {
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

      const token = await context.secrets.get("vs-slack.token");
      if (!token) {
        return;
      }

      const rtm = new RTMClient(token);
      const slack = new WebClient(token);

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
        if (!event.subtype && event.channel == CHANNEL_ID) {
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
              const message = await rtm.sendMessage(data.text, CHANNEL_ID);
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
