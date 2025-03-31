import { SyphonServerDescription } from 'node-syphon/universal';

export interface SyphonServerDescriptionItem extends SyphonServerDescription {
  selected: boolean;
}

export class SyphonServerCollection {
  /**
   * Class is indexable.
   *
   * @example
   * const collection = new SyphonServerCollection(servers);
   * const server = collection[0];
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

  public select(index?: number): SyphonServerDescriptionItem | undefined;
  public select(uuid?: string): SyphonServerDescriptionItem | undefined;
  public select(
    server?: SyphonServerDescriptionItem | SyphonServerDescription
  ): SyphonServerDescriptionItem | undefined;
  public select(
    ...args: (
      | SyphonServerDescriptionItem
      | SyphonServerDescription
      | number
      | string
      | undefined
    )[]
  ): SyphonServerDescriptionItem | undefined {
    const arg = args[0];
    let res: SyphonServerDescriptionItem | undefined;

    switch (typeof arg) {
      case 'undefined': {
        this.unselect();
        break;
      }
      case 'number': {
        const index = arg;
        if (index < this.collection.length && index > -1) {
          this.unselect();
          this.collection[index].selected = true;
          res = this.collection[index];
        }
        break;
      }
      case 'string': {
        const uuid = arg;
        res = this.withUuid(uuid);
        break;
      }
      case 'object': {
        const server = arg;
        const existing = this.withUuid(server.SyphonServerDescriptionUUIDKey);
        if (existing) {
          this.unselect();
          existing.selected = true;
          res = existing;
        }
        break;
      }
    }

    return res;
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

  public get selectedIndex(): number {
    const selected = this.selected;

    if (selected) return this.collection.indexOf(selected);

    return -1;
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
