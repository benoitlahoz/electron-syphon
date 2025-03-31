export class SelectComponentBuilder {
  public static addElement(parent: HTMLElement) {
    const el = document.createElement('select');
    const placeholder = parent.getAttribute('placeholder');

    if (placeholder) SelectComponentBuilder.setPlaceholder(el, placeholder);

    parent.appendChild(el);
    return el;
  }

  public static hasPlaceholder(el: HTMLSelectElement) {
    const options = Array.from(el.options);
    const firstOption = options[0];
    return firstOption && firstOption.value == 'undefined';
  }

  public static setPlaceholder(el: HTMLSelectElement, placeholder?: string) {
    if (this.hasPlaceholder(el)) el.remove(0);

    if (placeholder) {
      const newOption = document.createElement('option');
      newOption.text = placeholder.trim();
      newOption.value = 'undefined'; // A string.

      // Insert option at the beginning.
      el.add(newOption, 0);
    }
  }

  public static addItem(
    el: HTMLSelectElement,
    item: any,
    text: (item: any) => string,
    value: (item: any) => string,
    before?: number
  ) {
    const option = document.createElement('option');
    option.text = text(item);
    option.value = value(item);
    el.add(option, before);
  }

  public static removeItem(el: HTMLSelectElement, value: string) {
    const options = Array.from(el.options);
    const option = options.find((op: HTMLOptionElement) => op.value === value);

    if (option) {
      const index = options.indexOf(option);
      el.remove(index);
    }
  }

  public static updateItem(
    el: HTMLSelectElement,
    item: any,
    text: (item: any) => string,
    value: (item: any) => string
  ) {
    const options = Array.from(el.options);

    // Get option by value (e.g. uuid in case of syphon server).
    const option = options.find(
      (op: HTMLOptionElement) => op.value === value(item)
    );

    if (option) {
      option.text = text(item);
    }
  }

  public static setItems(
    el: HTMLSelectElement,
    text: (item: any) => string,
    value: (item: any) => string,
    ...items: any[]
  ) {
    let selected = el.selectedIndex;
    SelectComponentBuilder.clearOptions(el);

    for (const item of items) {
      SelectComponentBuilder.addItem(el, item, text, value);
    }

    el.selectedIndex = selected;
  }

  public static clearOptions(el: HTMLSelectElement) {
    const options = Array.from(el.options);
    for (const option of options) {
      option.remove();
    }
  }
}
