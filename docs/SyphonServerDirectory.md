# Syphon Server Directory

## Usage

### Main Process

```typescript
import {
  // SyphonServerDirectory is a singleton: importing is instantiating.
  SyphonServerDirectory,
  SyphonServerDirectoryListenerChannel,
  SyphonServerDescription,
} from './directory/server-directory';

// Add main process listeners.
// Note that all events are forwarded by default to all windows via `webContents.send`.
SyphonServerDirectory.on(
  SyphonServerDirectoryListenerChannel.SyphonServerAnnounceNotification,
  (message: SyphonServerDescription) => {
    console.log('Server announce:', message);
  }
);

// Listen: is called only once but triggers all servers announces if event subcribing is called after first `listen` call.
SyphonServerDirectory.listen();
```
