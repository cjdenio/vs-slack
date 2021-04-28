declare function acquireVsCodeApi(): VsCodeApi;

declare interface VsCodeApi {
  postMessage(msg: any): void;
}
