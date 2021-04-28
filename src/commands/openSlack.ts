import * as vscode from "vscode";
import * as path from "path";
import { RTMClient } from "@slack/rtm-api";
import { WebClient } from "@slack/web-api";

import { channelGetter } from "../util/channelGetter";
import WebviewCommunicator from "../util/communicator";
import { Message, Profile } from "../types";

let panel: vscode.WebviewPanel | undefined = undefined;

export default (context: vscode.ExtensionContext) =>
  vscode.commands.registerCommand("vs-slack.openSlack", async () => {
    if (!panel) {
      const token = await context.secrets.get("vs-slack.token");
      if (!token) {
        const selected = await vscode.window.showErrorMessage(
          "Please log in first.",
          "Log in"
        );
        if (selected == "Log in") {
          await vscode.commands.executeCommand("vs-slack.login");
        }

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

      console.log("Connected to: " + channelId);

      panel = vscode.window.createWebviewPanel(
        "slack",
        "Slack",
        vscode.ViewColumn.Two,
        {
          enableScripts: true,
          retainContextWhenHidden: true,
        }
      );

      const communicator = new WebviewCommunicator(panel.webview, context);

      // Handle requests from the webview
      communicator.on<{ max: number }, Message[]>("msgs", async (e) => {
        const messages = await slack.conversations.history({
          channel: channelId,
          limit: e.max,
        });

        (messages.messages as Message[]).reverse();

        return messages.messages as Message[];
      });

      communicator.on<{ user: string }, Profile>(
        "users.profile.get",
        async ({ user }) => {
          const profile = await slack.users.profile.get({ user });

          return profile.profile as Profile;
        }
      );

      const bundleSrc = panel.webview.asWebviewUri(
        vscode.Uri.file(path.join(context.extensionPath, "ui", "dist", "ui.js"))
      );
      panel.webview.html = getWebviewContent(bundleSrc);

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
