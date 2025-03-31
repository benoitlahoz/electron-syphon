import type { IpcRendererEvent } from 'electron';
import { SyphonServerDescription } from 'node-syphon/universal';
import type { SyphonServerSelectComponent } from '..';
import { SelectComponentBuilder } from '../select-component-helpers';

export class OnServerRetire {
  public static handle(
    this: SyphonServerSelectComponent,
    _: IpcRendererEvent,
    message: {
      server: SyphonServerDescription;
      servers: SyphonServerDescription[];
    }
  ) {
    const existing = this.servers.withUuid(
      message.server.SyphonServerDescriptionUUIDKey
    );

    if (existing && existing.selected) {
      if (SelectComponentBuilder.hasPlaceholder(this.el))
        this.el.selectedIndex = 0;
      else this.el.selectedIndex = -1;
    }

    if (this.servers.remove(existing)) {
      this.removeOption(message.server);

      const event = new Event('retire');
      this.dispatchEvent(event);
    }
  }
}
