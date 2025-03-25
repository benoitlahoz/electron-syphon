import { webContents } from 'electron';
import {
  SyphonServerDirectory as NodeSyphonServerDirectory,
  SyphonServerDescription,
  SyphonServerDirectoryListenerChannel,
} from 'node-syphon';

class _SyphonServerDirectory {
  private directory: NodeSyphonServerDirectory;
  private mainProcessListeners: Record<
    SyphonServerDirectoryListenerChannel,
    ((message: any) => void)[]
  > = {};
  private isListening = false;

  constructor() {
    this.directory = new NodeSyphonServerDirectory();
  }

  /**
   * Remove listeners, exit server directory process and dispose `ServerDirectory` singleton.
   */
  public dispose(): void {
    for (const channel in this.mainProcessListeners) {
      this.off(channel);
    }
    this.directory.dispose();
  }

  /**
   * Add a listener to server directory events from the main process.
   * @param { SyphonServerDirectoryListenerChannel } channel The received channel.
   * @param { (message: any) => void } listener The listener to the given message.
   */
  public on(
    channel: SyphonServerDirectoryListenerChannel,
    listener: (message: any) => void
  ) {
    if (!this.mainProcessListeners[channel]) {
      this.mainProcessListeners[channel] = [];
    }

    this.mainProcessListeners[channel].push(listener);

    // Handle already listening directory for server announce.
    if (
      this.isListening &&
      channel ===
        SyphonServerDirectoryListenerChannel.SyphonServerAnnounceNotification
    ) {
      for (const server of this.servers) {
        listener(server);
      }
    }
  }

  /**
   * Remove one or all listeners to server directory events from the main process.
   * @param { SyphonServerDirectoryListenerChannel } channel The received channel.
   * @param { (message: any) => void | undefined } listener The listener to the given message.
   * If not provided, all listeners to given channel will be removed.
   */
  public off(
    channel: SyphonServerDirectoryListenerChannel,
    listener?: (message: any) => void
  ) {
    if (this.mainProcessListeners[channel]) {
      if (!listener) {
        delete this.mainProcessListeners[channel];
        return;
      }

      const existing = this.mainProcessListeners[channel].find(listener);
      if (existing) {
        const index = this.mainProcessListeners[channel].indexOf(listener);
        this.mainProcessListeners[channel].splice(index, 1);
      }
    }
  }

  /**
   * Registered Syphon servers.
   */
  public get servers(): SyphonServerDescription[] {
    return this.directory.servers;
  }

  /**
   * Is server directory running.
   */
  public get isRunning(): boolean {
    return this.directory.isRunning;
  }

  /**
   * Listen to server directory messages and forward them to renderer process.
   */
  public listen(): void {
    if (this.isListening) {
      return;
    }

    this.directory.on(
      SyphonServerDirectoryListenerChannel.SyphonServerInfoNotification,
      (message: string) => {
        // Notify amin.
        this.notidyMain.bind(this)(
          SyphonServerDirectoryListenerChannel.SyphonServerInfoNotification,
          message
        );

        // Notify renderer.
        this.notifyRenderer.bind(this)(
          SyphonServerDirectoryListenerChannel.SyphonServerInfoNotification,
          message
        );
      }
    );

    this.directory.on(
      SyphonServerDirectoryListenerChannel.SyphonServerErrorNotification,
      (message: string) => {
        // Notify amin.
        this.notidyMain.bind(this)(
          SyphonServerDirectoryListenerChannel.SyphonServerErrorNotification,
          message
        );

        // Notify renderer.
        this.notifyRenderer.bind(this)(
          SyphonServerDirectoryListenerChannel.SyphonServerErrorNotification,
          message
        );
      }
    );

    this.directory.on(
      SyphonServerDirectoryListenerChannel.SyphonServerAnnounceNotification,
      (message: SyphonServerDescription) => {
        // Notify amin.
        this.notidyMain.bind(this)(
          SyphonServerDirectoryListenerChannel.SyphonServerAnnounceNotification,
          message
        );

        // Notify renderer.
        this.notifyRenderer.bind(this)(
          SyphonServerDirectoryListenerChannel.SyphonServerAnnounceNotification,
          message
        );
      }
    );

    this.directory.on(
      SyphonServerDirectoryListenerChannel.SyphonServerRetireNotification,
      (message: SyphonServerDescription) => {
        // Notify amin.
        this.notidyMain.bind(this)(
          SyphonServerDirectoryListenerChannel.SyphonServerRetireNotification,
          message
        );

        // Notify renderer.
        this.notifyRenderer.bind(this)(
          SyphonServerDirectoryListenerChannel.SyphonServerRetireNotification,
          message
        );
      }
    );

    this.directory.listen();
    this.isListening = true;
  }

  /**
   * Notify all main process listeners of an incoming `Syphon` server directory message.
   *
   * @param { SyphonServerDirectoryListenerChannel } channel The received channel.
   * @param { any } message The received message.
   */
  private notidyMain(
    channel: SyphonServerDirectoryListenerChannel,
    message: any
  ): void {
    if (this.mainProcessListeners[channel]) {
      for (const listener of this.mainProcessListeners[channel]) {
        listener(message);
      }
    }
  }

  /**
   * Notify all windows of an incoming `Syphon` server directory message.
   *
   * @param { SyphonServerDirectoryListenerChannel } channel The received channel.
   * @param { any } message The received message.
   */
  private notifyRenderer(
    channel: SyphonServerDirectoryListenerChannel,
    message: any
  ): void {
    const contents = webContents.getAllWebContents();
    for (const webContent of contents) {
      webContent.send(channel, {
        message,
        servers: this.servers,
      });
    }
  }
}

const directory = new _SyphonServerDirectory();
Object.freeze(directory);

export { directory as SyphonServerDirectory };
export {
  SyphonServerDirectoryListenerChannel,
  SyphonServerDescription,
} from 'node-syphon';
