import { Disposable, ExtensionContext, Webview } from "vscode";

export interface Message<T> {
  cmd: string | undefined;
  id: number;
  data: T;
}

export default class WebviewCommunicator implements Disposable {
  private webview: Webview;

  listeners: { [event: string]: ((payload: any) => Promise<any>)[] } = {};

  /**
   *
   */
  constructor(webview: Webview, context: ExtensionContext) {
    this.webview = webview;

    this.webview.onDidReceiveMessage(
      this.onMessage,
      this,
      context.subscriptions
    );

    context.subscriptions.push(this);
  }

  private onMessage(e: Message<any>) {
    const { cmd, data, id } = e;

    if (cmd) {
      if (this.listeners[cmd]) {
        this.listeners[cmd].forEach(async (listener) => {
          const response = await listener(data);

          this.webview.postMessage({
            id,
            data: response,
          });
        });
      }
    }
  }

  on<T, R>(event: string, callback: (payload: T) => Promise<R>) {
    // register the listener
    if (this.listeners[event]) {
      this.listeners[event].push(callback);
    } else {
      this.listeners[event] = [callback];
    }

    console.log("registered listener");
  }

  dispose() {
    // TODO actual disposing
    this.listeners = {};
  }
}
