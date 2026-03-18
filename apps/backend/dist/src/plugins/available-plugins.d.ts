export interface AvailablePlugin {
    id: string;
    name: string;
    description: string;
    version: string;
    author: string;
    category: string;
    icon: string;
    features: string[];
    usageInstructions?: string;
    configSchema?: {
        type: string;
        properties: Record<string, any>;
        required?: string[];
    };
}
export declare const AVAILABLE_PLUGINS: AvailablePlugin[];
export declare const PLUGIN_CATEGORIES: {
    id: string;
    name: string;
    icon: string;
}[];
export declare const getPluginsByCategory: (category: string) => AvailablePlugin[];
