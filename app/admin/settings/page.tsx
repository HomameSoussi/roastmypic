'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Setting {
  id: number;
  key: string;
  value: any;
  description: string;
  updated_at: string;
}

interface GroupedSettings {
  [group: string]: Setting[];
}

export default function AdminSettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<GroupedSettings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('content');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings');
      if (response.status === 401) {
        router.push('/admin/login');
        return;
      }
      const data = await response.json();
      setSettings(data.settings);
      if (Object.keys(data.settings).length > 0) {
        setActiveTab(Object.keys(data.settings)[0]);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');

    try {
      // Flatten all settings into updates array
      const updates = Object.values(settings)
        .flat()
        .map((setting) => ({
          key: setting.key,
          value: setting.value,
        }));

      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates }),
      });

      if (response.ok) {
        setMessage('✅ Settings saved successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('❌ Error saving settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage('❌ Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (group: string, key: string, newValue: any) => {
    setSettings((prev) => ({
      ...prev,
      [group]: prev[group].map((setting) =>
        setting.key === key ? { ...setting, value: newValue } : setting
      ),
    }));
  };

  const renderInput = (group: string, setting: Setting) => {
    const { key, value, description } = setting;

    // Boolean toggle
    if (typeof value.enabled === 'boolean') {
      return (
        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={value.enabled}
            onChange={(e) =>
              updateSetting(group, key, { enabled: e.target.checked })
            }
            className="w-5 h-5 text-pink-500 rounded focus:ring-2 focus:ring-pink-500"
          />
          <span className="text-sm text-gray-300">{description}</span>
        </label>
      );
    }

    // Text input
    if (typeof value.text === 'string') {
      return (
        <div>
          <label className="block text-sm text-gray-400 mb-2">{description}</label>
          <input
            type="text"
            value={value.text}
            onChange={(e) => updateSetting(group, key, { text: e.target.value })}
            className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
        </div>
      );
    }

    // Color picker
    if (typeof value.hex === 'string') {
      return (
        <div>
          <label className="block text-sm text-gray-400 mb-2">{description}</label>
          <div className="flex items-center space-x-3">
            <input
              type="color"
              value={value.hex}
              onChange={(e) => updateSetting(group, key, { hex: e.target.value })}
              className="w-12 h-12 rounded cursor-pointer"
            />
            <input
              type="text"
              value={value.hex}
              onChange={(e) => updateSetting(group, key, { hex: e.target.value })}
              className="flex-1 px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
              placeholder="#FFFFFF"
            />
          </div>
        </div>
      );
    }

    // Number input
    if (typeof value.limit === 'number') {
      return (
        <div>
          <label className="block text-sm text-gray-400 mb-2">{description}</label>
          <input
            type="number"
            value={value.limit}
            onChange={(e) =>
              updateSetting(group, key, { limit: parseInt(e.target.value) })
            }
            className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
            min="0"
          />
        </div>
      );
    }

    // URL input
    if (typeof value.url === 'string') {
      return (
        <div>
          <label className="block text-sm text-gray-400 mb-2">{description}</label>
          <input
            type="text"
            value={value.url}
            onChange={(e) => updateSetting(group, key, { url: e.target.value })}
            className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
            placeholder="/logo.png"
          />
        </div>
      );
    }

    // Complex object (announcement banner)
    if (value.text && value.color && value.link) {
      return (
        <div className="space-y-3">
          <label className="block text-sm text-gray-400">{description}</label>
          <input
            type="text"
            value={value.text}
            onChange={(e) =>
              updateSetting(group, key, { ...value, text: e.target.value })
            }
            placeholder="Banner text"
            className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
          <div className="flex space-x-3">
            <input
              type="color"
              value={value.color}
              onChange={(e) =>
                updateSetting(group, key, { ...value, color: e.target.value })
              }
              className="w-12 h-10 rounded cursor-pointer"
            />
            <input
              type="text"
              value={value.link}
              onChange={(e) =>
                updateSetting(group, key, { ...value, link: e.target.value })
              }
              placeholder="Link URL"
              className="flex-1 px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>
        </div>
      );
    }

    // Array (roast styles) - show as JSON editor
    if (Array.isArray(value)) {
      return (
        <div>
          <label className="block text-sm text-gray-400 mb-2">{description}</label>
          <textarea
            value={JSON.stringify(value, null, 2)}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                updateSetting(group, key, parsed);
              } catch (err) {
                // Invalid JSON, don't update
              }
            }}
            rows={12}
            className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
        </div>
      );
    }

    // Fallback: JSON editor
    return (
      <div>
        <label className="block text-sm text-gray-400 mb-2">{description}</label>
        <textarea
          value={JSON.stringify(value, null, 2)}
          onChange={(e) => {
            try {
              const parsed = JSON.parse(e.target.value);
              updateSetting(group, key, parsed);
            } catch (err) {
              // Invalid JSON, don't update
            }
          }}
          rows={4}
          className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
        />
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Platform Settings</h1>
            <p className="text-gray-400">
              Control every aspect of your platform without touching code
            </p>
          </div>
          <button
            onClick={() => router.push('/admin/dashboard')}
            className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* Save Message */}
        {message && (
          <div className="mb-6 p-4 bg-slate-800/50 border border-slate-700 rounded-lg text-white">
            {message}
          </div>
        )}

        {/* Tabs */}
        <div className="flex space-x-2 mb-6 overflow-x-auto">
          {Object.keys(settings).map((group) => (
            <button
              key={group}
              onClick={() => setActiveTab(group)}
              className={`px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap ${
                activeTab === group
                  ? 'bg-pink-500 text-white'
                  : 'bg-slate-800/50 text-gray-400 hover:bg-slate-700/50'
              }`}
            >
              {group.charAt(0).toUpperCase() + group.slice(1)}
            </button>
          ))}
        </div>

        {/* Settings Panel */}
        <div className="bg-slate-800/30 backdrop-blur-xl border border-slate-700 rounded-2xl p-8">
          <div className="space-y-6">
            {settings[activeTab]?.map((setting) => (
              <div
                key={setting.key}
                className="p-6 bg-slate-800/50 rounded-xl border border-slate-700"
              >
                <h3 className="text-lg font-semibold text-white mb-4">
                  {setting.key.replace(/_/g, ' ').toUpperCase()}
                </h3>
                {renderInput(activeTab, setting)}
                <div className="mt-3 text-xs text-gray-500">
                  Last updated: {new Date(setting.updated_at).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save All Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
