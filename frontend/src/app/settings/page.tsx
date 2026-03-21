'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { useRouter } from 'next/navigation';
import { usePlugins } from '@/contexts/PluginContext';
import { useAuth } from '@/contexts/AuthContext';
import { 
  ArrowLeft, 
  Globe, 
  Palette, 
  Bell, 
  Shield, 
  Plug,
  Database,
  Sparkles,
  Video,
  Mail,
} from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { isPluginEnabled, installedPlugins } = usePlugins();
  const isAdmin = user?.role === 'ADMIN';

  const hasMultiLanguage = isPluginEnabled('multi-language');
  const hasCustomThemes = isPluginEnabled('custom-themes');
  const hasNotifications = isPluginEnabled('notifications');
  const hasRolePermissions = isPluginEnabled('role-permissions');
  const hasBackupRestore = isPluginEnabled('backup-restore');
  const hasApiAccess = isPluginEnabled('api-access');
  const hasCustomFields = isPluginEnabled('custom-fields');

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="rounded-lg bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="mt-2 text-gray-500">
            Manage your preferences and platform configuration
          </p>
          
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div className="rounded-lg border p-4">
              <h3 className="font-medium text-gray-900 flex items-center gap-2">
                <Shield className="h-5 w-5 text-gray-400" />
                Profile Settings
              </h3>
              <p className="mt-1 text-sm text-gray-500">Update your profile information</p>
              <Button variant="outline" size="sm" className="mt-3">
                Edit Profile
              </Button>
            </div>
            
            <div className="rounded-lg border p-4">
              <h3 className="font-medium text-gray-900 flex items-center gap-2">
                <Shield className="h-5 w-5 text-gray-400" />
                Account Security
              </h3>
              <p className="mt-1 text-sm text-gray-500">Change password and security settings</p>
              <Button variant="outline" size="sm" className="mt-3">
                Change Password
              </Button>
            </div>
            
            {hasNotifications ? (
              <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                <h3 className="font-medium text-gray-900 flex items-center gap-2">
                  <Bell className="h-5 w-5 text-green-600" />
                  Notifications
                  <Badge variant="success" className="ml-2">Plugin Active</Badge>
                </h3>
                <p className="mt-1 text-sm text-gray-500">Manage notification preferences with templates</p>
                <Button variant="outline" size="sm" className="mt-3">
                  Configure
                </Button>
              </div>
            ) : (
              <div className="rounded-lg border p-4">
                <h3 className="font-medium text-gray-900">Notifications</h3>
                <p className="mt-1 text-sm text-gray-500">Manage notification preferences</p>
                <Button variant="outline" size="sm" className="mt-3" disabled>
                  Configure
                </Button>
              </div>
            )}
            
            <div className="rounded-lg border p-4">
              <h3 className="font-medium text-gray-900">Privacy</h3>
              <p className="mt-1 text-sm text-gray-500">Control your privacy settings</p>
              <Button variant="outline" size="sm" className="mt-3">
                Manage
              </Button>
            </div>
          </div>

          {/* Admin Plugin Settings */}
          {isAdmin && (
            <>
              <div className="mt-10 border-t pt-8">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Plug className="h-5 w-5 text-indigo-600" />
                  Platform Settings
                  {installedPlugins.length > 0 && (
                    <Badge variant="info">{installedPlugins.length} plugins</Badge>
                  )}
                </h2>
              </div>

              <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {hasMultiLanguage ? (
                  <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                    <h3 className="font-medium text-gray-900 flex items-center gap-2">
                      <Globe className="h-5 w-5 text-green-600" />
                      Languages
                      <Badge variant="success" className="ml-auto text-xs">Active</Badge>
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">100+ languages available</p>
                    <Button variant="outline" size="sm" className="mt-3">
                      Manage Languages
                    </Button>
                  </div>
                ) : (
                  <Link href="/dashboard/admin/plugins">
                    <div className="rounded-lg border border-dashed p-4 hover:border-indigo-300 hover:bg-indigo-50 transition-colors">
                      <h3 className="font-medium text-gray-900 flex items-center gap-2">
                        <Globe className="h-5 w-5 text-gray-400" />
                        Languages
                        <Badge variant="warning" className="ml-auto text-xs">Install</Badge>
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">Add multi-language support</p>
                    </div>
                  </Link>
                )}

                {hasCustomThemes ? (
                  <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                    <h3 className="font-medium text-gray-900 flex items-center gap-2">
                      <Palette className="h-5 w-5 text-green-600" />
                      Appearance
                      <Badge variant="success" className="ml-auto text-xs">Active</Badge>
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">Custom themes and branding</p>
                    <Button variant="outline" size="sm" className="mt-3">
                      Customize Theme
                    </Button>
                  </div>
                ) : (
                  <Link href="/dashboard/admin/plugins">
                    <div className="rounded-lg border border-dashed p-4 hover:border-indigo-300 hover:bg-indigo-50 transition-colors">
                      <h3 className="font-medium text-gray-900 flex items-center gap-2">
                        <Palette className="h-5 w-5 text-gray-400" />
                        Appearance
                        <Badge variant="warning" className="ml-auto text-xs">Install</Badge>
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">Add custom themes</p>
                    </div>
                  </Link>
                )}

                {hasBackupRestore ? (
                  <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                    <h3 className="font-medium text-gray-900 flex items-center gap-2">
                      <Database className="h-5 w-5 text-green-600" />
                      Backup
                      <Badge variant="success" className="ml-auto text-xs">Active</Badge>
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">Backup and restore data</p>
                    <Button variant="outline" size="sm" className="mt-3">
                      Manage Backup
                    </Button>
                  </div>
                ) : (
                  <Link href="/dashboard/admin/plugins">
                    <div className="rounded-lg border border-dashed p-4 hover:border-indigo-300 hover:bg-indigo-50 transition-colors">
                      <h3 className="font-medium text-gray-900 flex items-center gap-2">
                        <Database className="h-5 w-5 text-gray-400" />
                        Backup
                        <Badge variant="warning" className="ml-auto text-xs">Install</Badge>
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">Add backup system</p>
                    </div>
                  </Link>
                )}

                {hasApiAccess ? (
                  <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                    <h3 className="font-medium text-gray-900 flex items-center gap-2">
                      <Plug className="h-5 w-5 text-green-600" />
                      API Access
                      <Badge variant="success" className="ml-auto text-xs">Active</Badge>
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">REST API for integrations</p>
                    <Button variant="outline" size="sm" className="mt-3">
                      Manage API Keys
                    </Button>
                  </div>
                ) : (
                  <Link href="/dashboard/admin/plugins">
                    <div className="rounded-lg border border-dashed p-4 hover:border-indigo-300 hover:bg-indigo-50 transition-colors">
                      <h3 className="font-medium text-gray-900 flex items-center gap-2">
                        <Plug className="h-5 w-5 text-gray-400" />
                        API Access
                        <Badge variant="warning" className="ml-auto text-xs">Install</Badge>
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">Add API access</p>
                    </div>
                  </Link>
                )}

                {hasCustomFields ? (
                  <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                    <h3 className="font-medium text-gray-900 flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-green-600" />
                      Custom Fields
                      <Badge variant="success" className="ml-auto text-xs">Active</Badge>
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">Custom profile fields</p>
                    <Button variant="outline" size="sm" className="mt-3">
                      Manage Fields
                    </Button>
                  </div>
                ) : (
                  <Link href="/dashboard/admin/plugins">
                    <div className="rounded-lg border border-dashed p-4 hover:border-indigo-300 hover:bg-indigo-50 transition-colors">
                      <h3 className="font-medium text-gray-900 flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-gray-400" />
                        Custom Fields
                        <Badge variant="warning" className="ml-auto text-xs">Install</Badge>
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">Add custom fields</p>
                    </div>
                  </Link>
                )}
              </div>

              <div className="mt-6 text-center">
                <Link href="/dashboard/admin/plugins">
                  <Button variant="outline">
                    <Plug className="mr-2 h-4 w-4" />
                    Manage All Plugins
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
