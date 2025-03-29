import type { IpcRendererEvent } from 'electron';
import {
  SyphonServerDescription,
  SyphonServerDirectoryListenerChannel,
} from 'node-syphon/universal';
import { SyphonAPIName } from '@/common';

class _SyphonServerRetireListener {
  // Inter-process communication API defined in the `preload` script.
  private static syphonIpc;

  constructor() {
    if (!window[SyphonAPIName]) {
      throw new Error(
        `Syphon inter-process communicatiin API with name '${SyphonAPIName}' was not installed on 'window'.`
      );
    }
    _SyphonServerRetireListener.syphonIpc = window[SyphonAPIName];
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
    _SyphonServerRetireListener.syphonIpc.directory.on(
      SyphonServerDirectoryListenerChannel.SyphonServerRetireNotification,
      listener
    );
  }

  public unregister(listener: () => void) {
    _SyphonServerRetireListener.syphonIpc.directory.off(
      SyphonServerDirectoryListenerChannel.SyphonServerRetireNotification,
      listener
    );
  }
}

const listener = new _SyphonServerRetireListener();
Object.seal(listener);

export { listener as SyphonServerRetireListener };
