export interface Message<T> {
  cmd: string | undefined;
  id: number;
  data: T;
}

export default class WebviewCommunicator {
  listeners: { [event: string]: ((payload: any) => Promise<any>)[] } = {};
  idListeners: { [id: number]: (payload: any) => void } = {};
  vscode: VsCodeApi;
  onMessageBound: (e: MessageEvent<Message<any>>) => void;

  /**
   *
   */
  constructor(vscode: VsCodeApi) {
    this.vscode = vscode;

    this.onMessageBound = this.onMessage.bind(this);
    window.addEventListener("message", this.onMessageBound);
  }

  send<T, R>(cmd: string, data: T): Promise<R> {
    return new Promise((resolve, reject) => {
      const id = Math.random();

      this.vscode.postMessage({
        id,
        cmd,
        data,
      });

      // Listen for a response
      this.idListeners[id] = (payload) => {
        resolve(payload);
      };
    });
  }

  private onMessage(e: MessageEvent<Message<any>>) {
    const { cmd, data, id } = e.data;

    if (cmd) {
      if (this.listeners[cmd]) {
        this.listeners[cmd].forEach(async (listener) => {
          const response = await listener(data);

          this.vscode.postMessage({
            id,
            data: response,
          });
        });
      }
    } else {
      this.idListeners[id](data);
      delete this.idListeners[id];
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
    this.listeners = {};
    window.removeEventListener("message", this.onMessageBound);
  }
}
