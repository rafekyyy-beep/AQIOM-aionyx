interface PushMessage {
  title: string;
  body: string;
  data?: Record<string, any>;
}

export class PushManager {
  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) return false;
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  send(message: PushMessage): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(message.title, { body: message.body });
    }
  }

  async sendToUser(userId: string, message: PushMessage): Promise<void> {
    console.log(`[Push] To ${userId}:`, message);
  }
}

export const pushManager = new PushManager();
