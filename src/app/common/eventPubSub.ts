export class EventPubSub {
  private static _instance: EventPubSub = null;

  constructor() {
    if (EventPubSub._instance) {
      throw new Error('Error - use userManager.getInstance()');
    }
    EventPubSub._instance = this;
  }

  public static get instance(): EventPubSub {
    if (null == EventPubSub._instance) {
      EventPubSub._instance = new EventPubSub();
    }
    return EventPubSub._instance;
  }

  private topics: { [key: string]: any } = {};
  subscribe(topic, listener): void {
    // Create the topic's object if not yet created
    if (!this.topics[topic]) {
      this.topics[topic] = { queue: [] };
    }
    // Add the listener to queue
    this.topics[topic].queue.push({ 'cb': listener, 'ps': null });
    // const index = this.topics[topic].queue.push({ 'cb': listener, 'ps': null }) - 1;
    // Provide handle back for removal of topic
    // delete this.topics[topic].queue[index];
  }

  subscribeEx(topic: any, listener: any, ...parameters: any[]): void {
    // Create the topic's object if not yet created
    if (!this.topics[topic]) {
      this.topics[topic] = { queue: [] };
    }
    // Add the listener to queue
    this.topics[topic].queue.push({ 'cb': listener, 'ps': parameters });
    // const index = this.topics[topic].queue.push({ 'cb': listener, 'ps': parameters }) - 1;
    // Provide handle back for removal of topic
    // delete this.topics[topic].queue[index];
  }

  unsubscribe(topic, listener): void {
    // If the topic doesn't exist, or there's no listeners in queue, just leave
    if (!this.topics[topic] || !this.topics[topic].queue.length) {
      return;
    }
    for (let i = 0; i < this.topics[topic].queue.length; i++) {
      if (this.topics[topic].queue[i]['cb'] === listener) {
        this.topics[topic].queue.splice(i, 1);
      }
    }
    if (this.topics[topic].queue.length === 0) {
      delete this.topics[topic];
    }
  }

  publish(topic, info): void {
    // If the topic doesn't exist, or there's no listeners in queue, just leave
    if (!this.topics[topic] || !this.topics[topic].queue.length) { return; }
    // Cycle through topics queue, fire!
    const items = this.topics[topic].queue;
    for (let i = 0, len = items.length; i < len; i++) {
      if (typeof items[i]['cb'] === 'function') {
        if (items[i]['ps'] === null) {
          items[i]['cb'](info || {});
        } else {
          items[i]['cb'](info || {}, items[i]['ps']);
        }
      }
    }
  }
}
