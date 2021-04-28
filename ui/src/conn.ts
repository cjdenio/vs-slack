import WebviewCommunicator from "./util/communicator";

const vscode = acquireVsCodeApi();

const communicator = new WebviewCommunicator(vscode);

export default communicator;
