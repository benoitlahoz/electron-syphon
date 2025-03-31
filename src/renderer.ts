import { SyphonServerSelectComponent } from './directory/renderer';
import { SyphonClientCanvasComponent } from './client/renderer';

export * from '@/common';
export * from './directory/renderer';
export * from './client/renderer';

/**
 * Install (define) components. If no prefix is passed, components will have their default names.
 *
 * @param { string | undefined }prefix A prefix to prepend to components names.
 */
export const installSyphonComponents = (prefix?: string) => {
  SyphonServerSelectComponent.install(prefix);
  SyphonClientCanvasComponent.install(prefix);
};
