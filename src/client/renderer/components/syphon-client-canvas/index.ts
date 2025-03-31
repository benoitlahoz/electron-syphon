import { SyphonServerDescription } from 'node-syphon/universal';

export class SyphonClientCanvasComponent extends HTMLElement {
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
    let name = `syphon-client-canvas`;
    if (prefix) name = `${prefix}-${name}`;
    customElements.define(name, SyphonClientCanvasComponent);
  }

  /**
   * Element's attributes.
   */
  public static observedAttributes = ['width', 'height'];

  /**
   * The underlying `HTMLCanvasElement`.
   */
  private canvas: HTMLCanvasElement;

  /**
   * The bound server.
   */
  private boundServer: SyphonServerDescription | undefined;

  /**
   * Flag to avoid multiple 'connected' callback runs.
   */
  private isInitialized = false;

  constructor() {
    super();
  }

  public get server(): SyphonServerDescription {
    return this.boundServer;
  }

  public bindServer(server?: SyphonServerDescription | null): void {
    console.log('BIIIND', server);
    // TODO checkif changed.
    // Do nothing if not.

    if (!server) {
      // TODO: Unbind server and clean connection.
      return;
    }

    this.boundServer = server;
    // TODO: Ask for frames to main process / worker with node integration.
  }

  /**
   * Get the canvas context.
   *
   * @param { '2d' | 'webgl' | 'webgl2' | 'webgpu' | 'bitmaprenderer' } contextType The canvas context type.
   * @param { any } options The canvas context options.
   * @returns { RenderingContext | GPUCanvasContext | null } The canvas context or `null`.
   */
  public getContext(
    contextType: '2d' | 'webgl' | 'webgl2' | 'webgpu' | 'bitmaprenderer',
    options?: any
  ):
    | RenderingContext
    // @ts-ignore
    | GPUCanvasContext
    | null {
    return this.canvas.getContext(contextType, options);
  }

  /**
   * Called when element is mounted to the DOM.
   */
  public connectedCallback() {
    if (this.isInitialized) return;

    this.canvas = document.createElement('canvas');
    this.appendChild(this.canvas);

    this.canvas.width = this.clientWidth;
    this.canvas.height = this.clientHeight;

    this.isInitialized = true;
  }

  /**
   * Called when element is unmounted from the DOM.
   */
  public disconnectedCallback() {
    this.canvas.remove();
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
    if (!this.canvas) {
      this.canvas = document.createElement('canvas');
      this.appendChild(this.canvas);

      this.isInitialized = true;
    }

    switch (name) {
      case 'width': {
        // this.style.width = `${newValue}px`;
        this.canvas.width = newValue;
        break;
      }
      case 'height': {
        // this.style.height = `${newValue}px`;
        this.canvas.height = newValue;
        break;
      }
    }
  }
}
