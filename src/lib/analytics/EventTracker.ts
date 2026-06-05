interface Event {
  id: string;
  type: string;
  properties: Record<string, any>;
  timestamp: Date;
}

export class EventTracker {
  private events: Event[] = [];

  track(type: string, properties: Record<string, any>): void {
    const event: Event = {
      id: crypto.randomBytes(8).toString('hex'),
      type,
      properties,
      timestamp: new Date(),
    };
    this.events.push(event);
    
    if (this.events.length > 500) {
      this.events = this.events.slice(-500);
    }
  }

  getEvents(): Event[] {
    return this.events;
  }
}

export const eventTracker = new EventTracker();
