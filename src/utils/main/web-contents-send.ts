import { webContents } from 'electron';

/**
 * Send an event to all `webContents`.
 *
 * @param { string } channel The event channel.
 * @param { any | undefined } payload The message to send.
 */
export const webContentsSend = (channel: string, payload?: any) => {
  const contents = webContents.getAllWebContents();
  for (const webContent of contents) {
    webContent.send(channel, payload);
  }
};
