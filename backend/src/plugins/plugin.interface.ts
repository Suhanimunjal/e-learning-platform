import { INestApplication } from '@nestjs/common';

export interface PluginContext {
  tenantId: string | null;
  logger: {
    log: (message: string, data?: any) => void;
    error: (message: string, error?: any) => void;
    warn: (message: string, data?: any) => void;
  };
  db: {
    find: (model: string, query: any) => Promise<any[]>;
    findOne: (model: string, query: any) => Promise<any | null>;
    create: (model: string, data: any) => Promise<any>;
    update: (model: string, id: string, data: any) => Promise<any>;
    delete: (model: string, id: string) => Promise<any>;
  };
  hooks: {
    trigger: (event: string, data: any) => Promise<void>;
    register: (event: string, handler: (data: any) => Promise<void> | void) => void;
  };
  features: {
    isEnabled: (flag: string) => boolean;
  };
}

export interface LMSPlugin {
  name: string;
  version: string;
  description?: string;
  author?: string;
  
  init: (context: PluginContext) => Promise<void> | void;
  destroy?: () => Promise<void> | void;
  
  routes?: {
    path: string;
    module: any;
  }[];
  
  hooks?: {
    [key: string]: (data: any) => Promise<void> | void;
  };
  
  features?: {
    [key: string]: boolean;
  };
}
