'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { plugins as pluginsApi } from '@/lib/api';
import { apiBaseUrl } from '@/lib/runtime-config';

interface Plugin {
  id: string;
  pluginId: string;
  name: string;
  description: string;
  version: string;
  author: string;
  category: string;
  icon: string;
  enabled: boolean;
  config?: Record<string, any>;
  configSchema?: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
  features: string[];
  usageInstructions?: string;
  isInstalled?: boolean;
}

interface PluginContextType {
  installedPlugins: Plugin[];
  enabledPlugins: Plugin[];
  loading: boolean;
  refresh: () => Promise<void>;
  isPluginEnabled: (pluginId: string) => boolean;
  getPluginConfig: (pluginId: string) => Record<string, any> | undefined;
  installPlugin: (pluginId: string) => Promise<void>;
  uninstallPlugin: (pluginId: string) => Promise<void>;
  togglePlugin: (pluginId: string, enabled: boolean) => Promise<void>;
  configurePlugin: (pluginId: string, config: Record<string, any>) => Promise<void>;
}

const PluginContext = createContext<PluginContextType | undefined>(undefined);

export function PluginProvider({ children }: { children: ReactNode }) {
  const [installedPlugins, setInstalledPlugins] = useState<Plugin[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPlugins = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers: any = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);
      
      const res = await fetch(`${apiBaseUrl}/plugins/installed`, {
        headers,
        signal: controller.signal 
      });
      clearTimeout(timeout);
      
      if (res.ok) {
        const data = await res.json();
        setInstalledPlugins(data);
      }
    } catch (err) {
      // Silently fail - plugins are optional
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlugins();
  }, []);

  const enabledPlugins = installedPlugins.filter(p => p.enabled);

  const isPluginEnabled = (pluginId: string) => {
    return enabledPlugins.some(p => p.pluginId === pluginId || p.id === pluginId);
  };

  const getPluginConfig = (pluginId: string) => {
    const plugin = installedPlugins.find(p => p.pluginId === pluginId || p.id === pluginId);
    return plugin?.config;
  };

  const installPlugin = async (pluginId: string) => {
    await pluginsApi.install(pluginId);
    await loadPlugins();
  };

  const uninstallPlugin = async (pluginId: string) => {
    await pluginsApi.uninstall(pluginId);
    await loadPlugins();
  };

  const togglePlugin = async (pluginId: string, enabled: boolean) => {
    await pluginsApi.toggle(pluginId, enabled);
    await loadPlugins();
  };

  const configurePlugin = async (pluginId: string, config: Record<string, any>) => {
    await pluginsApi.configure(pluginId, config);
    await loadPlugins();
  };

  return (
    <PluginContext.Provider
      value={{
        installedPlugins,
        enabledPlugins,
        loading,
        refresh: loadPlugins,
        isPluginEnabled,
        getPluginConfig,
        installPlugin,
        uninstallPlugin,
        togglePlugin,
        configurePlugin,
      }}
    >
      {children}
    </PluginContext.Provider>
  );
}

export function usePlugins() {
  const context = useContext(PluginContext);
  if (!context) {
    throw new Error('usePlugins must be used within a PluginProvider');
  }
  return context;
}

export function usePlugin(pluginId: string) {
  const { installedPlugins, isPluginEnabled, getPluginConfig } = usePlugins();
  const plugin = installedPlugins.find(p => p.pluginId === pluginId || p.id === pluginId);
  return {
    plugin,
    isEnabled: isPluginEnabled(pluginId),
    config: getPluginConfig(pluginId),
  };
}
