// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { URL, URLSearchParams } from "url";
import { createServer } from "http";

import axios from "axios";

import constants from "./constants";
import openSlack from "./commands/openSlack";

const { clientId, clientSecret } = constants;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "vs-slack" is now active!');

  context.subscriptions.push(
    vscode.commands.registerCommand("vs-slack.login", async () => {
      await vscode.env.openExternal(
        vscode.Uri.parse(
          `https://slack.com/oauth/authorize?client_id=${clientId}&scope=client&redirect_uri=http://localhost:8005`
        )
      );

      // Spin up a temporary webserver
      const server = createServer(async (req, res) => {
        try {
          const url = new URL(req.url as string, "http://localhost:8005/");
          const code = url.searchParams.get("code");

          if (!code) {
            res.end("missing code");
            return;
          }

          console.log(code);

          const resp = await axios.post(
            "https://slack.com/api/oauth.access",
            new URLSearchParams({
              client_id: clientId,
              client_secret: clientSecret,
              code,
              redirect_uri: "http://localhost:8005",
            }).toString()
          );

          res.end("Success!");
          server.close(() => {
            console.log("server closed");
          });

          if (!resp.data.ok) {
            throw new Error("error while getting access token");
          }

          await context.secrets.store("vs-slack.token", resp.data.access_token);
        } catch (e) {
          res.end("Something went wrong: " + e);
          server.close();
        }
      });

      server.listen(8005);
    })
  );

  context.subscriptions.push(openSlack(context));
}

// this method is called when your extension is deactivated
export function deactivate() {}
