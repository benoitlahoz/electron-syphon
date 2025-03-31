import { SyphonServerDescription } from 'node-syphon/universal';

export const formatServerName = (server: SyphonServerDescription) => {
  return `${server.SyphonServerDescriptionAppNameKey}${
    server.SyphonServerDescriptionNameKey
      ? ` - ${server.SyphonServerDescriptionNameKey}`
      : ''
  }`;
};
