export class SyphonCanvasComponent extends HTMLElement {
  /**
   * Install the web component.
   *
   * @param { string } name The name of the component (defaults to `syphon-canvas`).
   */
  public static install(name = 'syphon-canvas') {
    customElements.define(name, SyphonCanvasComponent);
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
   * Flag to avoid multiple 'connected' callback runs.
   */
  private isInitialized = false;

  constructor() {
    super();
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
    // @ts-ignore
  ): RenderingContext | GPUCanvasContext | null {
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
