class EventBus {
  private eventTarget: EventTarget;

  constructor() {
    this.eventTarget = new EventTarget();
  }

  on(event: string, callback: (event: CustomEvent) => void) {
    this.eventTarget.addEventListener(event, (evt: Event) => {
      callback(evt as CustomEvent);
    });
  }

  off(event: string, callback: (event: CustomEvent) => void) {
    this.eventTarget.removeEventListener(event, callback as EventListener);
  }

  emit(event: string, detail: any = null) {
    this.eventTarget.dispatchEvent(new CustomEvent(event, { detail }));
  }
}

const eventBus = new EventBus();
export default eventBus;
