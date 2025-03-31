import type { IpcRendererEvent } from 'electron';
import { SyphonServerDescription } from 'node-syphon/universal';
import type { SyphonServerSelectComponent } from '..';
import { SelectComponentBuilder } from '../select-component-helpers';
import { formatServerName } from '@/utils/universal';

export class OnServerUpdate {
  public static handle(
    this: SyphonServerSelectComponent,
    _: IpcRendererEvent,
    message: {
      server: SyphonServerDescription;
      servers: SyphonServerDescription[];
    }
  ) {
    // Update same UUID server.
    const updated = this.servers.update(message.server);

    if (updated) {
      // Update select element option.
      SelectComponentBuilder.updateItem(
        this.el,
        updated,
        () => updated.SyphonServerDescriptionUUIDKey,
        () => formatServerName(updated)
      );
    }
  }
}
