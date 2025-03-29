import type { IpcRendererEvent } from 'electron';
import {
  SyphonServerDescription,
  SyphonServerDirectoryListenerChannel,
} from 'node-syphon/universal';
import { SyphonAPIName } from '@/common';
import { SyphonCanvasComponent } from '../../../../webcomponents/syphon-canvas.webcomponent';
import { SyphonServerCollection } from '@/server/syphon-server-collection';

export class SyphonServerSelectComponent extends HTMLElement {
  /**
   * Install the web component.
   *
   * @param { string } name The name of the component (defaults to `syphon-server-list`).
   */
  public static install(name = 'syphon-server-select') {
    customElements.define(name, SyphonServerSelectComponent);
  }

  /**
   * Element's attributes.
   */
  public static observedAttributes = ['selected', 'uuid', 'canvas'];

  /**
   * Inter-process communication object to communicate with main Electron process.
   */
  private syphonIpc;

  /**
   * Root HTML select element.
   */
  private el: HTMLSelectElement;

  /**
   * Default option when no server is selected.
   */
  private defaultOption: HTMLOptionElement;

  /**
   * Directory servers.
   */
  public readonly servers: SyphonServerCollection;

  /**
   * Flag to avoid multiple 'connected' callback runs.
   */
  private isInitialized = false;

  /**
   * Eventual canvas to render the server's frames.
   */
  private boundCanvas: SyphonCanvasComponent | undefined;

  constructor() {
    super();
    this.servers = new SyphonServerCollection();
  }

  /**
   * Build underlying `HTMLSelectElement` options according to initial servers.
   */
  private buildInitialOptions() {
    for (const server of this.servers) {
      const option = document.createElement('option');
      option.text = `${server.SyphonServerDescriptionAppNameKey}${
        server.SyphonServerDescriptionNameKey
          ? ` - ${server.SyphonServerDescriptionNameKey}`
          : ''
      }`;
      option.value = server.SyphonServerDescriptionUUIDKey;
      option.selected = server.selected;
      this.el.appendChild(option);
    }
  }

  /**
   * Add an `HTMLOptionElement` to the root element when a server appears.
   *
   * @param { SyphonServerDescription } server The server's description.
   * @param { boolean } selected Is the server initially selected (defaults to false).
   */
  private addOption(server: SyphonServerDescription, selected = false) {
    const option = document.createElement('option');
    option.text = `${server.SyphonServerDescriptionAppNameKey}${
      server.SyphonServerDescriptionNameKey
        ? ` - ${server.SyphonServerDescriptionNameKey}`
        : ''
    }`;
    option.value = server.SyphonServerDescriptionUUIDKey;
    option.selected = selected;
    this.el.appendChild(option);
  }

  /**
   * Removes the corresponding `HTMLOptionElement` from the root element when a server disappears.
   *
   * @param { SyphonServerDescription } server The server's description.
   */
  private removeOption(server: SyphonServerDescription) {
    const option = Array.from(this.el.children).find(
      (el: HTMLOptionElement) =>
        el.value === server.SyphonServerDescriptionUUIDKey
    );
    if (option) {
      option.remove();
    }
  }

  /**
   * Called when element is mounted to the DOM.
   */
  public async connectedCallback() {
    if (this.isInitialized) return;

    if (!window[SyphonAPIName]) {
      throw new Error(
        `Syphon inter-process communicatiin API with name '${SyphonAPIName}' was not installed on 'window'.`
      );
    }

    // Get Inter-process communication API defined in the `preload` script.
    this.syphonIpc = window[SyphonAPIName];

    // Create underlying select element.
    this.el = document.createElement('select');
    this.defaultOption = document.createElement('option');
    this.defaultOption.text = 'Select a server...';
    this.el.appendChild(this.defaultOption);
    this.appendChild(this.el);

    // Bootstrap main process Syphon listeners.
    this.syphonIpc.directory.on(
      SyphonServerDirectoryListenerChannel.SyphonServerAnnounceNotification,
      (
        _event: IpcRendererEvent,
        message: {
          server: SyphonServerDescription;
          servers: SyphonServerDescription[];
        }
      ) => {
        if (this.servers.add(message.server)) {
          // Add unselected server if it doen't exist.
          this.addOption(message.server);

          // Emit event.
          const event = new Event('announce');
          this.dispatchEvent(event);
        }
      }
    );

    this.syphonIpc.directory.on(
      SyphonServerDirectoryListenerChannel.SyphonServerRetireNotification,
      (
        _event: IpcRendererEvent,
        message: {
          server: SyphonServerDescription;
          servers: SyphonServerDescription[];
        }
      ) => {
        const existing = this.servers.withUuid(
          message.server.SyphonServerDescriptionUUIDKey
        );

        if (existing && existing.selected) {
          // Select default option.
          this.el.options[0].selected = true;
        }

        if (this.servers.remove(existing)) {
          this.removeOption(message.server);

          const event = new Event('retire');
          this.dispatchEvent(event);
        }
      }
    );

    this.syphonIpc.directory.on(
      SyphonServerDirectoryListenerChannel.SyphonServerUpdateNotification,
      (
        _event: IpcRendererEvent,
        message: {
          server: SyphonServerDescription;
          servers: SyphonServerDescription[];
        }
      ) => {
        const existing = this.servers.find(
          (registered: SyphonServerDescription) =>
            registered.SyphonServerDescriptionUUIDKey ===
            message.server.SyphonServerDescriptionUUIDKey
        );

        // Update same UUID server.
        const updated = this.servers.update(message.server);
        const option = Array.from(this.el.options).find(
          (op: HTMLOptionElement) =>
            op.value === message.server.SyphonServerDescriptionUUIDKey
        );
        if (updated && option) {
          option.text = `${updated.SyphonServerDescriptionAppNameKey}${
            updated.SyphonServerDescriptionNameKey
              ? ` - ${updated.SyphonServerDescriptionNameKey}`
              : ''
          }`;
          option.value = updated.SyphonServerDescriptionUUIDKey;
          option.selected = existing.selected;
        }
        console.log('UPDATE', message);
      }
    );

    const servers = await this.syphonIpc.directory.getServers();
    for (const server of servers) {
      this.servers.add(server);
    }

    // Build options for 'select' element.
    this.buildInitialOptions();

    this.isInitialized = true;
  }

  /**
   * Called when element is unmounted from the DOM.
   */
  public disconnectedCallback() {
    //
  }

  /**
   * Called when element moved to a new page.
   */
  public adoptedCallback() {
    // console.log('Custom element moved to new page.');
  }

  /**
   * Called when an observed attribute changed.
   *
   * @param { string } name The name of the attribute.
   * @param { any } oldValue The previous value of the attribute.
   * @param { any } newValue The new value of the attribute.
   */
  public attributeChangedCallback(name: string, oldValue: any, newValue: any) {
    switch (name) {
      case 'canvas': {
        if (oldValue !== null) {
          // TODO: get eventual old bound canvas to clean-up.
        }

        if (newValue !== null) {
          // Get canvas (directly or from an id) to display client image in.

          const nextTick = setTimeout(() => {
            // Will run on next tick.

            if (newValue instanceof SyphonCanvasComponent) {
              // Value is a canvas component.
              this.boundCanvas = newValue;
              // TODO: bind selected.
              // this.boundCanvas.bindServer()
            } else if (typeof newValue === 'string') {
              // Value is an id.
              const el = document.getElementById(newValue);
              if (el instanceof SyphonCanvasComponent) {
                this.boundCanvas = el;
                // TODO: bind selected.
                // this.boundCanvas.bindServer()
              }
            }
            console.log('CANVAS', this.boundCanvas);
            clearTimeout(nextTick);
          }, 0);
        }

        break;
      }
      case 'selected': {
        if (typeof oldValue === 'string' || typeof oldValue === 'number') {
          // TODO: Unselect and disconnect server accordingly.
        }

        if (typeof newValue === 'string' || typeof newValue === 'number') {
          const nextTick = setTimeout(async () => {
            // Will run on next tick.

            const index = Number(newValue);
            if (this.servers.length === 0) {
              const servers = await this.syphonIpc.directory.getServers();
              let i = 0;
              for (const server of servers) {
                this.servers.add(server, i === index);
                i++;
              }
            }

            if (this.servers.length >= index) {
              this.servers.select(index);
              this.el.selectedIndex = index;
            }

            clearTimeout(nextTick);
          }, 0);
        }
        break;
      }
      case 'uuid': {
        // TODO: User passes a server UUID (could also be name, to be tested with app name and server name) they get from e.g. localStorage.
        // That would make us handle 'old' servers UUID / names kept in a storage.
        break;
      }
    }
  }
}
