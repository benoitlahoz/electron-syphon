import type { IpcRendererEvent } from 'electron';
import {
  SyphonServerDescription,
  SyphonServerDirectoryListenerChannel,
} from 'node-syphon/universal';
import { SyphonAPIName } from '@/common';

class _SyphonServerUpdateListener {
  // Inter-process communication API defined in the `preload` script.
  private static syphonIpc;

  constructor() {
    if (!window[SyphonAPIName]) {
      throw new Error(
        `Syphon inter-process communicatiin API with name '${SyphonAPIName}' was not installed on 'window'.`
      );
    }
    _SyphonServerUpdateListener.syphonIpc = window[SyphonAPIName];
  }

  public register(
    listener: (
      event: IpcRendererEvent,
      message: {
        server: SyphonServerDescription;
        servers: SyphonServerDescription[];
      }
    ) => void
  ) {
    _SyphonServerUpdateListener.syphonIpc.directory.on(
      SyphonServerDirectoryListenerChannel.SyphonServerUpdateNotification,
      listener
    );
  }

  public unregister(listener: () => void) {
    _SyphonServerUpdateListener.syphonIpc.directory.off(
      SyphonServerDirectoryListenerChannel.SyphonServerUpdateNotification,
      listener
    );
  }
}

const listener = new _SyphonServerUpdateListener();
Object.seal(listener);

export { listener as SyphonServerUpdateListener };
