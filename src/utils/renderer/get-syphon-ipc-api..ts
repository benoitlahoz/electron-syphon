import { SyphonAPIName } from '@/common';

export const getSyphonIpcAPI = () => {
  if (!window[SyphonAPIName]) {
    throw new Error(
      `Syphon inter-process communicatiin API with name '${SyphonAPIName}' was not installed on 'window'.`
    );
  }

  return window[SyphonAPIName];
};
