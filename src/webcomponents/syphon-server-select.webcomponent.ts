import type { IpcRendererEvent } from 'electron';
import {
  SyphonServerDescription,
  SyphonServerDirectoryListenerChannel,
} from 'node-syphon/universal';
import { SyphonAPIName } from '@/common';
import { SyphonCanvasComponent } from './syphon-canvas.webcomponent';

interface ServerSelectDescription extends SyphonServerDescription {
  selected: boolean;
}

export class SyphonServerSelectComponent extends HTMLElement {
  private static APIName = SyphonAPIName;

  /**
   * Install the web component.
   *
   * @param { string } name The name of the component (defaults to `syphon-server-list`).
   */
  public static install(
    name = 'syphon-server-select',
    options?: { apiName?: string }
  ) {
    customElements.define(name, SyphonServerSelectComponent);

    if (options) {
      if (options.apiName) {
        SyphonServerSelectComponent.APIName = options.apiName;
      }
    }
  }

  /**
   * Element's attributes.
   */
  public static observedAttributes = ['selected', 'canvas'];

  /**
   * Inter-process communication object to communicate with main Electron process.
   */
  private syphonIpc;

  /**
   * Root HTML select element.
   */
  private root: HTMLSelectElement;

  /**
   * Default option when no server is selected.
   */
  private defaultOption: HTMLOptionElement;

  /**
   * Directory servers.
   */
  public readonly servers: ServerSelectDescription[] = [];

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
      this.root.appendChild(option);
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
    this.root.appendChild(option);
  }

  /**
   * Removes the corresponding `HTMLOptionElement` from the root element when a server disappears.
   *
   * @param { SyphonServerDescription } server The server's description.
   */
  private removeOption(server: SyphonServerDescription) {
    const option = Array.from(this.root.children).find(
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

    if (!window[SyphonServerSelectComponent.APIName]) {
      throw new Error(
        `Syphon inter-process communicatiin API with name '${SyphonServerSelectComponent.APIName}' was not installed on 'window'.`
      );
    }

    // Get Inter-process communication API defined in the `preload` script.
    this.syphonIpc = window[SyphonServerSelectComponent.APIName];

    // Create underlying select element.
    this.root = document.createElement('select');
    this.defaultOption = document.createElement('option');
    this.defaultOption.innerText = 'Select a server...';
    this.root.appendChild(this.defaultOption);
    this.appendChild(this.root);

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
        // TODO: Event for announce.

        for (const server of message.servers) {
          const existing = this.servers.find(
            (registered: SyphonServerDescription) =>
              registered.SyphonServerDescriptionUUIDKey ===
              server.SyphonServerDescriptionUUIDKey
          );

          if (existing) continue;

          // Add unselected server.
          this.servers.push({
            ...server,
            selected: false,
          });
          this.addOption(server);
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
        // TODO: handle if selected

        for (const server of this.servers) {
          const existing = this.servers.find(
            (registered: SyphonServerDescription) =>
              registered.SyphonServerDescriptionUUIDKey ===
              server.SyphonServerDescriptionUUIDKey
          );

          if (existing) {
            const index = this.servers.indexOf(existing);
            this.servers.splice(index, 1);
            this.removeOption(server);
          }
        }

        // TODO: Check if local servers correspond to received servers and update accordingly.
        console.log('RETIRE', message);
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
        for (const server of this.servers) {
          const existing = this.servers.find(
            (registered: SyphonServerDescription) =>
              registered.SyphonServerDescriptionUUIDKey ===
              server.SyphonServerDescriptionUUIDKey
          );

          if (existing) {
            const index = this.servers.indexOf(existing);
            this.servers.splice(index, 1, {
              ...message.server,
              // TODO: handle if selected
              selected: server.selected,
            });
            this.removeOption(server);
          }
        }

        // TODO: Check if local servers correspond to received servers and update accordingly.
        console.log('UPDATE', message);
      }
    );

    const servers = await this.syphonIpc.directory.getServers();
    for (const server of servers) {
      this.servers.push({
        ...server,
        selected: false,
      });
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
    console.log(
      `Attribute ${name} has changed from ${oldValue} to ${newValue}.`
    );

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
              this.boundCanvas = newValue;
            } else if (typeof newValue === 'string') {
              const el = document.getElementById(newValue);
              if (el instanceof SyphonCanvasComponent) {
                this.boundCanvas = el;
              }
            }

            clearTimeout(nextTick);
          }, 0);
        }

        break;
      }
      case 'selected': {
        //
        break;
      }
    }
  }
}
