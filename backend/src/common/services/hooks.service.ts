import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class HooksService {
  private readonly logger = new Logger(HooksService.name);
  private hooks: Map<string, Array<(data: any) => Promise<void> | void>> = new Map();

  register(event: string, handler: (data: any) => Promise<void> | void) {
    if (!this.hooks.has(event)) {
      this.hooks.set(event, []);
    }
    this.hooks.get(event)!.push(handler);
    this.logger.log(`Hook registered for event: ${event}`);
  }

  async trigger(event: string, data: any) {
    const eventHooks = this.hooks.get(event) || [];
    
    for (const hook of eventHooks) {
      try {
        await hook(data);
      } catch (error) {
        this.logger.error(`Hook ${event} failed:`, error);
      }
    }
  }

  unregister(event: string, handler: (data: any) => Promise<void> | void) {
    const eventHooks = this.hooks.get(event) || [];
    const index = eventHooks.indexOf(handler);
    if (index > -1) {
      eventHooks.splice(index, 1);
    }
  }
}
