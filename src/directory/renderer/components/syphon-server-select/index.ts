import { SyphonServerDescription } from 'node-syphon/universal';
import { nextTick, getSyphonIpcAPI, defineAttributes } from '@/utils/renderer';
import { formatServerName } from '@/utils/universal';
import {
  SyphonServerCollection,
  SyphonServerDescriptionItem,
} from '@/server/syphon-server-collection.universal';
import { SyphonClientCanvasComponent } from '@/client/renderer/components/syphon-client-canvas';
import {
  SyphonServerAnnounce,
  SyphonServerRetire,
  SyphonServerUpdate,
} from '@/directory/renderer/ipc-listeners';
import {
  OnServerAnnounce,
  OnServerRetire,
  OnServerUpdate,
} from './event-handlers';
import { SelectComponentBuilder } from './select-component-helpers';

export class SyphonServerSelectComponent extends HTMLElement {
  /**
   * Install the web component.
   *
   * @param { string | undefined } name An optional prefix to prepend to the component's name.
   *
   * @example
   * // For `syphon-server-select` component.
   * install('foo') // Component will be usable with name `foo-syphon-server-select`
   */
  public static install(prefix?: string) {
    let name = `syphon-server-select`;
    if (prefix) name = `${prefix}-${name}`;
    customElements.define(name, SyphonServerSelectComponent);
  }

  /**
   * Element's attributes.
   */
  public static observedAttributes = defineAttributes(
    'placeholder',
    'selected',
    'uuid',
    'canvas'
  );

  /**
   * Inter-process communication object to communicate with main Electron process.
   */
  private syphonIpc;

  /**
   * Server announce listener bound to `this`.
   */
  private serverAnnounceListener: typeof OnServerAnnounce.handle;

  /**
   * Server retire listener bound to `this`.
   */
  private serverRetireListener: typeof OnServerAnnounce.handle;

  /**
   * Server update listener bound to `this`.
   */
  private serverUpdateListener: typeof OnServerUpdate.handle;

  /**
   * Selection change listener bound to `this`.
   */
  private onSelectServer: typeof this.onElementChangeEvent;

  /**
   * Root HTML select element.
   */
  protected el: HTMLSelectElement;

  /**
   * Default option when no server is selected.
   */
  private defaultOption: HTMLOptionElement;

  /**
   * Flag to avoid multiple 'connected' callback runs.
   */
  private isInitialized = false;

  /**
   * Directory servers.
   */
  public readonly servers: SyphonServerCollection;

  /**
   * Optional canvas to render the server's frames.
   */
  private boundCanvas: SyphonClientCanvasComponent | undefined;

  constructor() {
    super();

    this.servers = new SyphonServerCollection();

    this.serverAnnounceListener = OnServerAnnounce.handle.bind(this);
    this.serverRetireListener = OnServerRetire.handle.bind(this);
    this.serverUpdateListener = OnServerUpdate.handle.bind(this);

    this.onSelectServer = this.onElementChangeEvent.bind(this);
  }

  private async updateServers(selected?: number) {
    // Passed index or already selected index.
    const index = selected || this.servers.selectedIndex;

    // Clear collection.
    this.servers.clear();

    // Get servers from main process.
    const servers = await this.syphonIpc.directory.getServers();

    let i = 0;
    for (const server of servers) {
      this.servers.add(server, i === index);
      i++;
    }
  }

  /**
   * Add an `HTMLOptionElement` to the root element when a server appears.
   *
   * @param { SyphonServerDescription } server The server's description.
   * @param { boolean } selected Is the server initially selected (defaults to false).
   */
  protected addOption(server: SyphonServerDescription, selected = false) {
    const option = document.createElement('option');
    option.text = formatServerName(server);
    option.value = server.SyphonServerDescriptionUUIDKey;
    option.selected = selected;
    this.el.appendChild(option);
  }

  /**
   * Removes the corresponding `HTMLOptionElement` from the root element when a server disappears.
   *
   * @param { SyphonServerDescription } server The server's description.
   */
  protected removeOption(server: SyphonServerDescription) {
    const option = Array.from(this.el.children).find(
      (el: HTMLOptionElement) =>
        el.value === server.SyphonServerDescriptionUUIDKey
    );
    if (option) {
      option.remove();
    }
  }

  protected onElementChangeEvent() {
    const uuid = this.el.value;
    const server = this.servers.select(uuid);
    this.bindServerToCanvas(server);
  }

  protected bindServerToCanvas(server?: SyphonServerDescriptionItem | null) {
    if (this.boundCanvas) {
      this.boundCanvas.bindServer(server);
    }
  }

  /**
   * Called when element is mounted to the DOM.
   */
  public async connectedCallback() {
    if (this.isInitialized) return;

    // Get Inter-process communication API defined in the `preload` script.
    this.syphonIpc = getSyphonIpcAPI();

    // Bootstrap main process Syphon listeners.
    SyphonServerAnnounce.subscribe(this.serverAnnounceListener);
    SyphonServerRetire.subscribe(this.serverRetireListener);
    SyphonServerUpdate.subscribe(this.serverUpdateListener);

    // Get servers from main process and add them to collection.
    await this.updateServers();

    // Create underlying select element.
    this.el = SelectComponentBuilder.addElement(this);
    SelectComponentBuilder.setItems(
      this.el,
      (item: SyphonServerDescriptionItem) => formatServerName(item),
      (item: SyphonServerDescriptionItem) =>
        item.SyphonServerDescriptionUUIDKey,
      ...this.servers
    );

    this.el.addEventListener('change', this.onSelectServer);

    this.isInitialized = true;
  }

  /**
   * Called when element is unmounted from the DOM.
   */
  public disconnectedCallback() {
    this.el.removeEventListener('change', this.onSelectServer);

    SyphonServerUpdate.unsubscribe(this.serverUpdateListener);
    SyphonServerRetire.unsubscribe(this.serverRetireListener);
    SyphonServerAnnounce.unsubscribe(this.serverAnnounceListener);
  }

  /**
   * Called when element moved to a new page.
   */
  public adoptedCallback() {
    // console.log('Custom element moved to new page.');
  }

  /**
   * Called at next tick when an observed attribute changed.
   *
   * @param { string } attribute The name of the attribute.
   * @param { any } oldValue The previous value of the attribute.
   * @param { any } newValue The new value of the attribute.
   */
  public attributeChangedCallback(attribute: string, _: any, newValue: any) {
    nextTick(async () => {
      // Update servers from main process.
      await this.updateServers();

      switch (attribute) {
        case 'placeholder': {
          SelectComponentBuilder.setPlaceholder(this.el, newValue);
          break;
        }
        case 'canvas': {
          const getCanvas = () => {
            if (newValue instanceof SyphonClientCanvasComponent) {
              return newValue;
            } else if (typeof newValue === 'string') {
              const el = document.getElementById(newValue);
              if (el instanceof SyphonClientCanvasComponent) {
                return el;
              }
            }
            return;
          };

          const canvas = getCanvas();
          if (this.boundCanvas === canvas) break;

          this.boundCanvas = canvas;
          this.bindServerToCanvas(this.servers.selected);

          break;
        }

        case 'selected': {
          // Clean selection.
          this.servers.unselect();

          // Index of the 'select' element, not the servers.
          const optionIndex = Number(newValue);

          // TODO: Add option to have a 'default option' or not on the select element.
          const serverIndex = optionIndex - 1;

          if (this.servers.length > serverIndex) {
            const server = this.servers.select(serverIndex);
            this.bindServerToCanvas(server);

            this.el.selectedIndex = optionIndex;
          }

          break;
        }

        case 'uuid': {
          // TODO: User passes a server UUID (could also be name, to be tested with app name and server name) they get from e.g. localStorage.
          // That would make us handle 'old' servers UUID / names kept in a storage.
          break;
        }
      }
    });
  }
}
