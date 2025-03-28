import { SyphonServerSelectComponent } from './syphon-server-select.webcomponent';
import { SyphonCanvasComponent } from './syphon-canvas.webcomponent';

/**
 * Install (define) components with their default name.
 */
export const installSyphonComponents = () => {
  SyphonServerSelectComponent.install();
  SyphonCanvasComponent.install();
};

export {
  SyphonServerSelectComponent as SyphonServerMenuComponent,
  SyphonCanvasComponent,
};
