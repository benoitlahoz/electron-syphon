import { SyphonServerSelectComponent } from '../directory/renderer/components/syphon-server-select';
import { SyphonCanvasComponent } from './syphon-canvas.webcomponent';

/**
 * Install (define) components with their default name.
 */
export const installSyphonComponents = () => {
  SyphonServerSelectComponent.install();
  SyphonCanvasComponent.install();
};

export { SyphonServerSelectComponent, SyphonCanvasComponent };
