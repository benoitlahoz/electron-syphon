import { SyphonServerDescription } from 'node-syphon/universal';

export interface SyphonServerDescriptionItem extends SyphonServerDescription {
  selected: boolean;
}

export class SyphonServerCollection {
  /**
   * Class is indexable.
   */
  [key: number]: SyphonServerDescriptionItem[] | any;

  public readonly collection: SyphonServerDescriptionItem[];

  constructor(servers: SyphonServerDescription[] = [], selected?: number) {
    this.collection = servers.map(
      (server: SyphonServerDescription, index: number) => {
        return { ...server, selected: index === selected ? true : false };
      }
    );
  }

  public get items(): SyphonServerDescriptionItem[] {
    return [...this.collection];
  }

  public get length(): number {
    return this.collection.length;
  }

  public set length(length: number) {
    this.collection.length = length;
  }

  public add(
    server: SyphonServerDescription,
    selected = false
  ): SyphonServerDescriptionItem | undefined {
    if (!this.hasUuid(server.SyphonServerDescriptionUUIDKey)) {
      const item = { ...server, selected };
      this.collection.push(item);
      return item;
    }
    return;
  }

  public remove(server: SyphonServerDescription): string | undefined {
    const uuid = server.SyphonServerDescriptionUUIDKey;
    const existing = this.withUuid(uuid);
    if (existing) {
      const index = this.collection.indexOf(existing);
      this.collection.splice(index, 1);
      return uuid;
    }
    return;
  }

  public update(
    server: SyphonServerDescription
  ): SyphonServerDescriptionItem | undefined {
    const uuid = server.SyphonServerDescriptionUUIDKey;
    const existing = this.withUuid(uuid);
    if (existing) {
      existing.SyphonServerDescriptionAppNameKey =
        server.SyphonServerDescriptionAppNameKey;
      existing.SyphonServerDescriptionNameKey =
        server.SyphonServerDescriptionNameKey;
      return existing;
    }
    return;
  }

  public select(index: number): SyphonServerDescriptionItem | undefined {
    if (index < this.collection.length && index > -1) {
      this.unselect();
      this.collection[index].selected = true;
      return this.collection[index];
    }
    return;
  }

  public unselect(index?: number): void {
    if (typeof index === 'undefined') {
      for (const server of this.collection) {
        server.selected = false;
      }
      return;
    }

    if (index < this.collection.length && index > -1) {
      this.collection[index].selected = false;
    }
  }

  public get selected(): SyphonServerDescriptionItem | undefined {
    return this.collection.find(
      (server: SyphonServerDescriptionItem) => server.selected === true
    );
  }

  public clear(): void {
    this.collection.length = 0;
  }

  public find(
    fn: (
      server: SyphonServerDescription | SyphonServerDescriptionItem,
      index: number,
      servers: SyphonServerDescriptionItem[]
    ) => boolean
  ) {
    return this.collection.find(fn);
  }

  public hasUuid(uuid: string): boolean {
    return typeof this.withUuid(uuid) !== 'undefined';
  }

  public withUuid(uuid: string): SyphonServerDescriptionItem | undefined {
    return this.collection.find(
      (server: SyphonServerDescriptionItem) =>
        server.SyphonServerDescriptionUUIDKey === uuid
    );
  }

  public [Symbol.iterator](): Iterator<SyphonServerDescriptionItem> {
    let index = -1;
    const data: SyphonServerDescriptionItem[] = this.collection;
    return {
      next: () => ({
        value: data[++index],
        done: !(index in data),
      }),
    };
  }
}
