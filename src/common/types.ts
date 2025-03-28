import { SyphonServerDescription } from 'node-syphon/universal';

export type SyphonGraphicLibrary = string & ('opengl' | 'metal' | 'webgpu');

interface SyphonServerDirectoryBaseDTO {
  servers: SyphonServerDescription[];
}
export interface SyphonServerDirectoryServerDTO
  extends SyphonServerDirectoryBaseDTO {
  server: SyphonServerDescription;
}

export interface SyphonServerDirectoryInfoDTO
  extends SyphonServerDirectoryBaseDTO {
  info: string;
}

export interface SyphonServerDirectoryErrorDTO
  extends SyphonServerDirectoryBaseDTO {
  error: Error;
}
