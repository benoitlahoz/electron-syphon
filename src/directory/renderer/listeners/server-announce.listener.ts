import type { IpcRendererEvent } from 'electron';
import {
  SyphonServerDescription,
  SyphonServerDirectoryListenerChannel,
} from 'node-syphon/universal';
import { SyphonAPIName } from '@/common';

class _SyphonServerAnnounceListener {
  // Inter-process communication API defined in the `preload` script.
  private static syphonIpc;

  constructor() {
    if (!window[SyphonAPIName]) {
      throw new Error(
        `Syphon inter-process communicatiin API with name '${SyphonAPIName}' was not installed on 'window'.`
      );
    }
    _SyphonServerAnnounceListener.syphonIpc = window[SyphonAPIName];
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
    _SyphonServerAnnounceListener.syphonIpc.directory.on(
      SyphonServerDirectoryListenerChannel.SyphonServerAnnounceNotification,
      listener
    );
  }

  public unregister(listener: () => void) {
    _SyphonServerAnnounceListener.syphonIpc.directory.off(
      SyphonServerDirectoryListenerChannel.SyphonServerAnnounceNotification,
      listener
    );
  }
}

const listener = new _SyphonServerAnnounceListener();
Object.seal(listener);

export { listener as SyphonServerAnnounceListener };
