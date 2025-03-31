import type { IpcRendererEvent } from 'electron';
import {
  SyphonServerDescription,
  SyphonServerDirectoryListenerChannel,
} from 'node-syphon/universal';
import { getSyphonIpcAPI } from '@/utils/renderer/get-syphon-ipc-api.';

class _SyphonServerRetireListener {
  // Inter-process communication API defined in the `preload` script.
  private static syphonIpc;

  constructor() {
    _SyphonServerRetireListener.syphonIpc = getSyphonIpcAPI();
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
    _SyphonServerRetireListener.syphonIpc.directory.on(
      SyphonServerDirectoryListenerChannel.SyphonServerRetireNotification,
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
    _SyphonServerRetireListener.syphonIpc.directory.off(
      SyphonServerDirectoryListenerChannel.SyphonServerRetireNotification,
      listener
    );
  }
}

const listener = new _SyphonServerRetireListener();
Object.seal(listener);

export { listener as SyphonServerRetire };
