import type { IpcRendererEvent } from 'electron';
import { contextBridge, ipcRenderer } from 'electron';
import { SyphonAPIName, ElectronSyphonDirectoryChannel } from './common';
import { SyphonServerDirectoryListenerChannel } from 'node-syphon/universal';

export const SyphonAPI = {
  directory: {
    isListening: async () => {
      try {
        return await ipcRenderer.invoke(
          ElectronSyphonDirectoryChannel.IsListening
        );
      } catch (err: unknown) {
        return err;
      }
    },
    getServers: async () => {
      try {
        return await ipcRenderer.invoke(
          ElectronSyphonDirectoryChannel.GetServers
        );
      } catch (err: unknown) {
        return err;
      }
    },
    on: (
      channel: SyphonServerDirectoryListenerChannel,
      listener: (event: IpcRendererEvent, message: any) => void
    ) => {
      ipcRenderer.on(channel, listener);
    },
    off: (
      channel: SyphonServerDirectoryListenerChannel,
      listener?: (event: IpcRendererEvent, message: any) => void
    ) => {
      if (listener) {
        ipcRenderer.off(channel, listener);
      } else {
        ipcRenderer.removeAllListeners(channel);
      }
    },
  },
};

export const exposeSyphonAPI = (name = SyphonAPIName): void => {
  if (process.contextIsolated) {
    try {
      contextBridge.exposeInMainWorld(name, SyphonAPI);
    } catch (error) {
      console.error(error);
    }
  } else {
    // @ts-ignore (need dts)
    window[name] = SyphonAPI;
  }
};
