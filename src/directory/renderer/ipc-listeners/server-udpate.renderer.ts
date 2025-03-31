import { getSyphonIpcAPI } from '@/utils/renderer/get-syphon-ipc-api.';
import type { IpcRendererEvent } from 'electron';
import {
  SyphonServerDescription,
  SyphonServerDirectoryListenerChannel,
} from 'node-syphon/universal';

class _SyphonServerUpdate {
  // Inter-process communication API defined in the `preload` script.
  private static syphonIpc;

  constructor() {
    _SyphonServerUpdate.syphonIpc = getSyphonIpcAPI();
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
    _SyphonServerUpdate.syphonIpc.directory.on(
      SyphonServerDirectoryListenerChannel.SyphonServerUpdateNotification,
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
    _SyphonServerUpdate.syphonIpc.directory.off(
      SyphonServerDirectoryListenerChannel.SyphonServerUpdateNotification,
      listener
    );
  }
}

const listener = new _SyphonServerUpdate();
Object.seal(listener);

export { listener as SyphonServerUpdate };
