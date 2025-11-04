import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings as SettingsIcon, Save, RotateCcw } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const [settings, setSettings] = useState({
    captureRate: '1000',
    sensitivity: 'medium',
    targetApp: 'binary_baseline',
    autoStart: false,
    notifications: true,
    darkMode: true,
    defaultMode: 'demo',
    minConfidence: '70'
  });

  const { toast } = useToast();

  const handleSave = () => {
    // Save settings logic here
    toast({
      title: "Settings Saved",
      description: "Your preferences have been updated successfully",
    });
  };

  const handleReset = () => {
    setSettings({
      captureRate: '1000',
      sensitivity: 'medium',
      targetApp: 'binary_baseline',
      autoStart: false,
      notifications: true,
      darkMode: true,
      defaultMode: 'demo',
      minConfidence: '70'
    });
    toast({
      title: "Settings Reset",
      description: "All settings have been reset to defaults",
    });
  };

  const handleInputChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Configure your trading analysis preferences</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            variant="outline" 
            onClick={handleReset}
            data-testid="button-reset-settings"
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            Reset
          </Button>
          <Button 
            onClick={handleSave}
            data-testid="button-save-settings"
          >
            <Save className="w-4 h-4 mr-1" />
            Save Settings
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card border border-border">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <SettingsIcon className="w-5 h-5" />
              <span>Capture Settings</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">Target Trading Platform</label>
              <select 
                className="mt-1 w-full p-2 bg-secondary border border-border rounded-md text-foreground"
                value={settings.targetApp}
                onChange={(e) => handleInputChange('targetApp', e.target.value)}
                data-testid="select-target-app"
              >
                <option value="binary_baseline">Binary Baseline</option>
                <option value="pocket_option">Pocket Option</option>
                <option value="iq_option">IQ Option</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">Capture Rate (milliseconds)</label>
              <select 
                className="mt-1 w-full p-2 bg-secondary border border-border rounded-md text-foreground"
                value={settings.captureRate}
                onChange={(e) => handleInputChange('captureRate', e.target.value)}
                data-testid="select-capture-rate"
              >
                <option value="500">500ms (High frequency)</option>
                <option value="1000">1000ms (Normal)</option>
                <option value="2000">2000ms (Low frequency)</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">Detection Sensitivity</label>
              <select 
                className="mt-1 w-full p-2 bg-secondary border border-border rounded-md text-foreground"
                value={settings.sensitivity}
                onChange={(e) => handleInputChange('sensitivity', e.target.value)}
                data-testid="select-sensitivity"
              >
                <option value="high">High (More sensitive)</option>
                <option value="medium">Medium (Balanced)</option>
                <option value="low">Low (Less sensitive)</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">Minimum Confidence Level (%)</label>
              <input 
                type="number"
                min="0"
                max="100"
                className="mt-1 w-full p-2 bg-secondary border border-border rounded-md text-foreground"
                value={settings.minConfidence}
                onChange={(e) => handleInputChange('minConfidence', e.target.value)}
                data-testid="input-min-confidence"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border border-border">
          <CardHeader>
            <CardTitle>Application Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">Default Trading Mode</label>
              <select 
                className="mt-1 w-full p-2 bg-secondary border border-border rounded-md text-foreground"
                value={settings.defaultMode}
                onChange={(e) => handleInputChange('defaultMode', e.target.value)}
                data-testid="select-default-mode"
              >
                <option value="demo">Demo Mode</option>
                <option value="live">Live Mode</option>
              </select>
            </div>

            <div className="space-y-3">
              <label className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  className="rounded"
                  checked={settings.autoStart}
                  onChange={(e) => handleInputChange('autoStart', e.target.checked)}
                  data-testid="checkbox-auto-start"
                />
                <span className="text-sm text-foreground">Auto-start monitoring on app launch</span>
              </label>

              <label className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  className="rounded"
                  checked={settings.notifications}
                  onChange={(e) => handleInputChange('notifications', e.target.checked)}
                  data-testid="checkbox-notifications"
                />
                <span className="text-sm text-foreground">Enable desktop notifications</span>
              </label>

              <label className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  className="rounded"
                  checked={settings.darkMode}
                  onChange={(e) => handleInputChange('darkMode', e.target.checked)}
                  data-testid="checkbox-dark-mode"
                />
                <span className="text-sm text-foreground">Dark mode theme</span>
              </label>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border border-border">
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-foreground">Clear Trade History</h3>
              <p className="text-xs text-muted-foreground">Remove all stored trade data</p>
            </div>
            <Button variant="destructive" size="sm" data-testid="button-clear-history">
              Clear Data
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-foreground">Export All Data</h3>
              <p className="text-xs text-muted-foreground">Download complete trading history as CSV</p>
            </div>
            <Button variant="outline" size="sm" data-testid="button-export-data">
              Export CSV
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-foreground">Reset Analysis</h3>
              <p className="text-xs text-muted-foreground">Clear all analysis results and recommendations</p>
            </div>
            <Button variant="destructive" size="sm" data-testid="button-reset-analysis">
              Reset Analysis
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}