import type { IpcRendererEvent } from 'electron';
import { SyphonServerDescription } from 'node-syphon/universal';
import type { SyphonServerSelectComponent } from '..';
import { SelectComponentBuilder } from '../select-component-helpers';
import { formatServerName } from '@/utils/universal';

export class OnServerAnnounce {
  public static handle(
    this: SyphonServerSelectComponent,
    _: IpcRendererEvent,
    message: {
      server: SyphonServerDescription;
      servers: SyphonServerDescription[];
    }
  ) {
    if (this.servers.add(message.server)) {
      // Add unselected server if it doen't exist.
      SelectComponentBuilder.addItem(
        this.el,
        message.server,
        () => formatServerName(message.server),
        () => message.server.SyphonServerDescriptionUUIDKey
      );

      // Emit event.
      const event = new Event('announce');
      this.dispatchEvent(event);
    }
  }
}
