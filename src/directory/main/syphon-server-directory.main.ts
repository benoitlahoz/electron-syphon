import { ipcMain } from 'electron';
import {
  SyphonServerDirectory as NodeSyphonServerDirectory,
  SyphonServerDescription,
  SyphonServerDirectoryListenerChannel,
} from 'node-syphon';
import { ElectronSyphonDirectoryChannel } from '@/common';
import { webContentsSend } from '../../utils/web-contents-send';

class _SyphonServerDirectory {
  private directory: NodeSyphonServerDirectory;
  private mainProcessListeners: Record<
    SyphonServerDirectoryListenerChannel,
    ((message: any) => void)[]
  > = {};
  private isListening = false;

  constructor() {
    this.directory = new NodeSyphonServerDirectory();

    ipcMain.handle(ElectronSyphonDirectoryChannel.IsListening, async () => {
      return this.isListening;
    });

    ipcMain.handle(ElectronSyphonDirectoryChannel.GetServers, async () => {
      return this.servers;
    });
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
   *
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
   *
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
        // Notify main.
        this.notifyMain.bind(this)(
          SyphonServerDirectoryListenerChannel.SyphonServerInfoNotification,
          {
            info: message,
            servers: this.servers,
          }
        );

        // Notify renderer.
        webContentsSend(
          SyphonServerDirectoryListenerChannel.SyphonServerInfoNotification,
          {
            info: message,
            servers: this.servers,
          }
        );
      }
    );

    this.directory.on(
      SyphonServerDirectoryListenerChannel.SyphonServerErrorNotification,
      (message: string) => {
        // Notify main.
        this.notifyMain.bind(this)(
          SyphonServerDirectoryListenerChannel.SyphonServerErrorNotification,
          {
            error: message,
            servers: this.servers,
          }
        );

        // Notify renderer.
        webContentsSend(
          SyphonServerDirectoryListenerChannel.SyphonServerErrorNotification,
          {
            error: message,
            servers: this.servers,
          }
        );
      }
    );

    this.directory.on(
      SyphonServerDirectoryListenerChannel.SyphonServerAnnounceNotification,
      (message: SyphonServerDescription) => {
        // Notify main.
        this.notifyMain.bind(this)(
          SyphonServerDirectoryListenerChannel.SyphonServerAnnounceNotification,
          {
            server: message,
            servers: this.servers,
          }
        );

        // Notify renderer.
        webContentsSend(
          SyphonServerDirectoryListenerChannel.SyphonServerAnnounceNotification,
          {
            server: message,
            servers: this.servers,
          }
        );
      }
    );

    this.directory.on(
      SyphonServerDirectoryListenerChannel.SyphonServerRetireNotification,
      (message: SyphonServerDescription) => {
        // Notify main.
        this.notifyMain.bind(this)(
          SyphonServerDirectoryListenerChannel.SyphonServerRetireNotification,
          {
            server: message,
            servers: this.servers,
          }
        );

        // Notify renderer.
        webContentsSend(
          SyphonServerDirectoryListenerChannel.SyphonServerRetireNotification,
          {
            server: message,
            servers: this.servers,
          }
        );
      }
    );

    this.directory.on(
      SyphonServerDirectoryListenerChannel.SyphonServerUpdateNotification,
      (message: SyphonServerDescription) => {
        // Notify main.
        this.notifyMain.bind(this)(
          SyphonServerDirectoryListenerChannel.SyphonServerUpdateNotification,
          {
            server: message,
            servers: this.servers,
          }
        );

        // Notify renderer.
        webContentsSend(
          SyphonServerDirectoryListenerChannel.SyphonServerUpdateNotification,
          {
            server: message,
            servers: this.servers,
          }
        );
      }
    );

    this.directory.listen();
    this.isListening = true;
  }

  /**
   * Notify all main process' listeners of an incoming `Syphon` server directory message.
   *
   * @param { SyphonServerDirectoryListenerChannel } channel The event channel.
   * @param { any } message The received message.
   */
  private notifyMain(
    channel: SyphonServerDirectoryListenerChannel,
    message: any
  ): void {
    if (this.mainProcessListeners[channel]) {
      for (const listener of this.mainProcessListeners[channel]) {
        listener(message);
      }
    }
  }
}

// Create a singleton.
const directory = new _SyphonServerDirectory();
Object.seal(directory);

// Export the singleton.
export { directory as SyphonServerDirectory };

// Forward `node-syphon` types exports.
export type * from 'node-syphon';
export { SyphonServerDirectoryListenerChannel };
