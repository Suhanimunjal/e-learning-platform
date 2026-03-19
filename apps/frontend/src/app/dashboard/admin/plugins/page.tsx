'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { plugins as pluginsApi } from '@/lib/api';
import {
  Plug,
  Loader2,
  Power,
  Trash2,
  Settings,
  Download,
  Search,
  Grid,
  FileText,
  Trophy,
  BarChart3,
  Users,
  MessageSquare,
  CreditCard,
  Zap,
  Sparkles,
  Code,
  Calendar,
  Video,
  Star,
  Award,
  Search as SearchIcon,
  Bot,
  Palette,
  Globe,
  Link,
  Webhook,
  Hash,
  HelpCircle,
  GitBranch,
  Package,
  Shield,
  Wand,
  Database,
  Wallet,
  CalendarCheck,
  Brain,
  Activity,
  UserCheck,
  GraduationCap,
  Upload,
  UserPlus,
  Home,
  MessageCircle,
  Megaphone,
  Bell,
  RefreshCw,
  Tag,
  Play,
  Lightbulb,
  CheckCircle,
  Languages,
  FormInput,
  Flame,
  Route,
  File,
  ChevronDown,
  ChevronUp,
  Info,
  ExternalLink,
} from 'lucide-react';

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
  configSchema?: any;
  features?: string[];
  usageInstructions?: string;
  isInstalled?: boolean;
}

interface Category {
  id: string;
  name: string;
  icon: string;
}

const iconMap: Record<string, any> = {
  FileText,
  HelpCircle,
  GitBranch,
  Package,
  Users,
  Video,
  Award,
  Trophy,
  Star,
  BarChart3,
  Brain,
  Activity,
  UserCheck,
  GraduationCap,
  Upload,
  Shield,
  UserPlus,
  Home,
  MessageSquare,
  MessageCircle,
  Megaphone,
  Bell,
  CreditCard,
  RefreshCw,
  Tag,
  Plug,
  Play,
  Calendar,
  Hash,
  Webhook,
  Sparkles,
  Lightbulb,
  CheckCircle,
  Bot,
  Languages,
  Search: SearchIcon,
  Database,
  Palette,
  Wand,
  FormInput,
  Code,
  CalendarCheck,
  Wallet,
  Flame,
  Route,
  File,
  Link,
};

const categoryIconMap: Record<string, any> = {
  Grid,
  FileText,
  Trophy,
  BarChart3,
  Users,
  MessageSquare,
  CreditCard,
  Zap,
  Sparkles,
  Settings,
};

const categoryColors: Record<string, string> = {
  CONTENT: 'bg-blue-100 text-blue-600',
  GAMIFICATION: 'bg-yellow-100 text-yellow-600',
  ANALYTICS: 'bg-purple-100 text-purple-600',
  USERMGMT: 'bg-green-100 text-green-600',
  COMMUNICATION: 'bg-pink-100 text-pink-600',
  PAYMENTS: 'bg-orange-100 text-orange-600',
  INTEGRATIONS: 'bg-cyan-100 text-cyan-600',
  AI: 'bg-indigo-100 text-indigo-600',
  UTILITY: 'bg-gray-100 text-gray-600',
};

const categoryBadgeColors: Record<string, string> = {
  CONTENT: 'bg-blue-100 text-blue-700',
  GAMIFICATION: 'bg-yellow-100 text-yellow-700',
  ANALYTICS: 'bg-purple-100 text-purple-700',
  USERMGMT: 'bg-green-100 text-green-700',
  COMMUNICATION: 'bg-pink-100 text-pink-700',
  PAYMENTS: 'bg-orange-100 text-orange-700',
  INTEGRATIONS: 'bg-cyan-100 text-cyan-700',
  AI: 'bg-indigo-100 text-indigo-700',
  UTILITY: 'bg-gray-100 text-gray-700',
};

const categoryNames: Record<string, string> = {
  CONTENT: 'Content & Activities',
  GAMIFICATION: 'Gamification',
  ANALYTICS: 'Analytics & Reporting',
  USERMGMT: 'User & Role Management',
  COMMUNICATION: 'Communication',
  PAYMENTS: 'Payments & eCommerce',
  INTEGRATIONS: 'Integrations',
  AI: 'AI & Automation',
  UTILITY: 'Utility & Admin',
};

function PluginCard({
  plugin,
  onInstall,
  onUninstall,
  onToggle,
  onConfigure,
  actionLoading,
}: {
  plugin: Plugin;
  onInstall: () => void;
  onUninstall: () => void;
  onToggle: (enabled: boolean) => void;
  onConfigure: () => void;
  actionLoading: string | null;
}) {
  const [showDetails, setShowDetails] = useState(false);
  const Icon = iconMap[plugin.icon] || Plug;
  const colorClass = categoryColors[plugin.category] || 'bg-gray-100 text-gray-600';
  const isInstalled = 'isInstalled' in plugin ? plugin.isInstalled : true;

  return (
    <div className="rounded-lg bg-white shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className={`flex h-14 w-14 items-center justify-center rounded-xl ${colorClass}`}>
            <Icon className="h-7 w-7" />
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge
              variant={
                isInstalled
                  ? plugin.enabled
                    ? 'success'
                    : 'warning'
                  : 'info'
              }
              className="text-xs"
            >
              {isInstalled
                ? plugin.enabled
                  ? 'Active'
                  : 'Disabled'
                : 'Available'}
            </Badge>
            <span className="text-xs text-gray-400">v{plugin.version}</span>
          </div>
        </div>

        <div className="mt-4">
          <h3 className="font-semibold text-gray-900 text-lg">{plugin.name}</h3>
          <p className="mt-1 text-sm text-gray-500 line-clamp-2">{plugin.description}</p>
        </div>

        <span className={`inline-block mt-3 rounded-full px-3 py-1 text-xs font-medium ${categoryBadgeColors[plugin.category] || 'bg-gray-100 text-gray-700'}`}>
          {categoryNames[plugin.category] || plugin.category}
        </span>

        {plugin.features && plugin.features.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {plugin.features.slice(0, 4).map((feature, i) => (
              <span
                key={i}
                className="rounded-full bg-gray-50 border border-gray-200 px-2.5 py-0.5 text-xs text-gray-600"
                title={feature}
              >
                {feature}
              </span>
            ))}
            {plugin.features.length > 4 && (
              <span className="rounded-full bg-gray-50 border border-gray-200 px-2.5 py-0.5 text-xs text-gray-500">
                +{plugin.features.length - 4} more
              </span>
            )}
          </div>
        )}

        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-gray-500">by {plugin.author}</span>
        </div>
      </div>

      {showDetails && plugin.usageInstructions && (
        <div className="px-6 pb-6">
          <div className="rounded-lg bg-blue-50 border border-blue-100 p-4">
            <div className="flex items-start gap-2">
              <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-blue-900 text-sm">How to Use</h4>
                <p className="mt-1 text-sm text-blue-700 whitespace-pre-line">
                  {plugin.usageInstructions}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="px-6 pb-6 pt-2">
        <div className="flex gap-2">
          {isInstalled ? (
            <>
              <Button
                variant={plugin.enabled ? 'outline' : 'primary'}
                size="sm"
                className="flex-1"
                onClick={() => onToggle(!plugin.enabled)}
                disabled={actionLoading === (plugin.pluginId || plugin.id)}
              >
                <Power className="mr-1 h-4 w-4" />
                {plugin.enabled ? 'Disable' : 'Enable'}
              </Button>
              {plugin.configSchema && (
                <Button variant="outline" size="sm" onClick={onConfigure}>
                  <Settings className="h-4 w-4" />
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={onUninstall}>
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </>
          ) : (
            <Button
              variant="primary"
              size="sm"
              className="flex-1"
              onClick={onInstall}
              disabled={actionLoading === plugin.id}
            >
              <Download className="mr-1 h-4 w-4" />
              Install
            </Button>
          )}
        </div>

        {plugin.usageInstructions && (
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="mt-3 w-full flex items-center justify-center gap-1 text-sm text-gray-500 hover:text-gray-700"
          >
            {showDetails ? (
              <>
                <ChevronUp className="h-4 w-4" />
                Hide instructions
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                Show usage instructions
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

function ConfigureModal({
  plugin,
  isOpen,
  onClose,
  onSave,
}: {
  plugin: Plugin | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: Record<string, any>) => void;
}) {
  const [configValues, setConfigValues] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (plugin) {
      setConfigValues(plugin.config || {});
    }
  }, [plugin]);

  const handleSave = async () => {
    setSaving(true);
    await onSave(configValues);
    setSaving(false);
    onClose();
  };

  if (!plugin) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Configure ${plugin.name}`} size="lg">
      <div className="space-y-6">
        <div className="flex items-start gap-3 rounded-lg bg-amber-50 border border-amber-100 p-4">
          <Settings className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-amber-900 text-sm">Configuration Required</p>
            <p className="mt-1 text-sm text-amber-700">
              This plugin requires configuration before it can be enabled.
            </p>
          </div>
        </div>

        {plugin.configSchema && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Fill in the fields below. Fields marked with <span className="text-red-500">*</span> are required.
            </p>

            {Object.entries(plugin.configSchema.properties || {}).map(([key, schema]: [string, any]) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  {plugin.configSchema?.required?.includes(key) && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </label>
                {schema.type === 'boolean' ? (
                  <label className="mt-2 flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={configValues[key] ?? schema.default ?? false}
                      onChange={(e) => setConfigValues({ ...configValues, [key]: e.target.checked })}
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-500">Enable {key.replace(/([A-Z])/g, ' $1').toLowerCase()}</span>
                  </label>
                ) : (
                  <input
                    type={schema.type === 'number' ? 'number' : schema.type === 'string' && key.toLowerCase().includes('key') ? 'password' : 'text'}
                    value={configValues[key] ?? schema.default ?? ''}
                    onChange={(e) => setConfigValues({
                      ...configValues,
                      [key]: schema.type === 'number' ? Number(e.target.value) : e.target.value,
                    })}
                    placeholder={schema.default ? `Default: ${schema.default}` : `Enter ${key.replace(/([A-Z])/g, ' $1').toLowerCase()}`}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                )}
                {schema.description && (
                  <p className="mt-1 text-xs text-gray-400">{schema.description}</p>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} loading={saving}>
            Save Configuration
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default function AdminPluginsPage() {
  const [installedPlugins, setInstalledPlugins] = useState<Plugin[]>([]);
  const [availablePlugins, setAvailablePlugins] = useState<Plugin[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'installed' | 'available'>('installed');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [selectedPlugin, setSelectedPlugin] = useState<Plugin | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [installed, available, cats] = await Promise.all([
        pluginsApi.getInstalled(),
        pluginsApi.getAvailable(),
        pluginsApi.getCategories(),
      ]);
      setInstalledPlugins(installed);
      setAvailablePlugins(available);
      setCategories(cats);
    } catch (err) {
      console.error('Failed to load plugins:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInstall = async (pluginId: string) => {
    try {
      setActionLoading(pluginId);
      await pluginsApi.install(pluginId);
      await loadData();
    } catch (err) {
      console.error('Failed to install:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleUninstall = async (pluginId: string) => {
    if (!confirm('Are you sure you want to uninstall this plugin? This will disable all features.')) return;
    try {
      setActionLoading(pluginId);
      await pluginsApi.uninstall(pluginId);
      await loadData();
    } catch (err) {
      console.error('Failed to uninstall:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggle = async (plugin: Plugin, enabled: boolean) => {
    const pluginId = plugin.pluginId || plugin.id;
    
    if (enabled && plugin.configSchema) {
      if (!plugin.config || Object.keys(plugin.config).length === 0) {
        setSelectedPlugin(plugin);
        setShowConfigModal(true);
        return;
      }
    }

    try {
      setActionLoading(pluginId);
      await pluginsApi.toggle(pluginId, enabled);
      await loadData();
    } catch (err) {
      console.error('Failed to toggle:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const openConfigModal = (plugin: Plugin) => {
    setSelectedPlugin(plugin);
    setShowConfigModal(true);
  };

  const handleConfigure = async (config: Record<string, any>) => {
    if (!selectedPlugin) return;
    try {
      const pluginId = selectedPlugin.pluginId || selectedPlugin.id;
      await pluginsApi.configure(pluginId, config);
      await pluginsApi.toggle(pluginId, true);
      await loadData();
    } catch (err) {
      console.error('Failed to configure:', err);
    }
  };

  const filteredPlugins = activeTab === 'installed'
    ? installedPlugins.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.features?.some(f => f.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : availablePlugins.filter(p => {
        const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.features?.some(f => f.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesCategory && matchesSearch;
      });

  const installedCount = installedPlugins.length;
  const enabledCount = installedPlugins.filter((p: any) => p.enabled).length;
  const availableCount = availablePlugins.filter((p: any) => !p.isInstalled).length;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          <span className="ml-2 text-gray-600">Loading plugins...</span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Plug className="h-7 w-7 text-indigo-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Plugin Management</h1>
              <p className="text-sm text-gray-500">Extend your LMS with powerful plugins</p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg bg-white p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                <Plug className="h-6 w-6" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">{installedCount}</p>
                <p className="text-sm text-gray-500">Installed</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg bg-white p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-green-600">
                <Power className="h-6 w-6" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">{enabledCount}</p>
                <p className="text-sm text-gray-500">Active</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg bg-white p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                <Download className="h-6 w-6" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">{availableCount}</p>
                <p className="text-sm text-gray-500">Available</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg bg-white p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">{availablePlugins.length}</p>
                <p className="text-sm text-gray-500">Total Plugins</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('installed')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'installed'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Installed ({installedCount})
          </button>
          <button
            onClick={() => setActiveTab('available')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'available'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Available ({availableCount})
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {activeTab === 'available' && (
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => {
                const CatIcon = categoryIconMap[cat.icon] || Grid;
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      isSelected
                        ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <CatIcon className="h-4 w-4" />
                    {cat.name}
                  </button>
                );
              })}
            </div>
          )}
          <div className="relative flex-1 min-w-[200px] max-w-xs ml-auto">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search plugins..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {filteredPlugins.length === 0 ? (
          <div className="rounded-lg bg-gray-50 p-12 text-center">
            <Plug className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-4 text-gray-500 font-medium">No plugins found</p>
            <p className="mt-1 text-sm text-gray-400">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPlugins.map((plugin) => (
              <PluginCard
                key={plugin.pluginId || plugin.id}
                plugin={plugin}
                onInstall={() => handleInstall(plugin.id)}
                onUninstall={() => handleUninstall(plugin.pluginId || plugin.id)}
                onToggle={(enabled) => handleToggle(plugin, enabled)}
                onConfigure={() => openConfigModal(plugin)}
                actionLoading={actionLoading}
              />
            ))}
          </div>
        )}

        <ConfigureModal
          plugin={selectedPlugin}
          isOpen={showConfigModal}
          onClose={() => {
            setShowConfigModal(false);
            setSelectedPlugin(null);
          }}
          onSave={handleConfigure}
        />
      </div>
    </DashboardLayout>
  );
}
