import type { IpcRendererEvent } from 'electron';
import {
  SyphonServerDescription,
  SyphonServerDirectoryListenerChannel,
} from 'node-syphon/universal';
import { getSyphonIpcAPI } from '@/utils/renderer/get-syphon-ipc-api.';

class _SyphonServerAnnounce {
  // Inter-process communication API defined in the `preload` script.
  private static syphonIpc;

  constructor() {
    _SyphonServerAnnounce.syphonIpc = getSyphonIpcAPI();
  }

  public subscribe(
    listener: (
      event: IpcRendererEvent,
      message: {
        server: SyphonServerDescription;
        servers: SyphonServerDescription[];
      }
    ) => void
  ) {
    _SyphonServerAnnounce.syphonIpc.directory.on(
      SyphonServerDirectoryListenerChannel.SyphonServerAnnounceNotification,
      listener
    );
  }

  public unsubscribe(
    listener: (
      event: IpcRendererEvent,
      message: {
        server: SyphonServerDescription;
        servers: SyphonServerDescription[];
      }
    ) => void
  ) {
    _SyphonServerAnnounce.syphonIpc.directory.off(
      SyphonServerDirectoryListenerChannel.SyphonServerAnnounceNotification,
      listener
    );
  }
}

const listener = new _SyphonServerAnnounce();
Object.seal(listener);

export { listener as SyphonServerAnnounce };
