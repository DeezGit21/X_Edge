import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Target, Monitor, RotateCcw } from "lucide-react";
import { useState } from "react";

interface DetectionArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface DetectionAreaConfigProps {
  onAreaChange: (area: DetectionArea) => void;
  currentArea: DetectionArea;
}

export default function DetectionAreaConfig({ onAreaChange, currentArea }: DetectionAreaConfigProps) {
  const [localArea, setLocalArea] = useState<DetectionArea>(currentArea);

  const presets = [
    { 
      name: "PocketOption Open Trades Panel", 
      area: { x: 600, y: 150, width: 300, height: 400 },
      description: "Right-side trades panel (RECOMMENDED)"
    },
    { 
      name: "PocketOption Top Bar", 
      area: { x: 0, y: 0, width: 1920, height: 100 },
      description: "Top of screen for trade indicators"
    },
    { 
      name: "Binary Baseline Header", 
      area: { x: 0, y: 0, width: 1920, height: 120 },
      description: "Header area with trade status"
    },
    { 
      name: "Custom Center", 
      area: { x: 400, y: 200, width: 800, height: 200 },
      description: "Center area of screen"
    },
    { 
      name: "Full Screen", 
      area: { x: 0, y: 0, width: 1920, height: 1080 },
      description: "Entire screen capture"
    }
  ];

  const handleInputChange = (field: keyof DetectionArea, value: string) => {
    const numValue = parseInt(value) || 0;
    const newArea = { ...localArea, [field]: Math.max(0, numValue) };
    setLocalArea(newArea);
  };

  const applyChanges = () => {
    onAreaChange(localArea);
  };

  const resetToDefault = () => {
    const defaultArea = { x: 0, y: 0, width: 1920, height: 100 };
    setLocalArea(defaultArea);
    onAreaChange(defaultArea);
  };

  const applyPreset = (preset: DetectionArea) => {
    setLocalArea(preset);
    onAreaChange(preset);
  };

  return (
    <Card className="bg-card border border-border">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Target className="w-5 h-5" />
          <span>Detection Area Settings</span>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Configure where on your screen to look for trade status indicators
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Area Preview */}
        <div className="bg-secondary/20 p-4 rounded-lg border border-border">
          <h4 className="text-sm font-medium mb-3 flex items-center space-x-2">
            <Monitor className="w-4 h-4" />
            <span>Current Detection Area</span>
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Position:</span>
              <span className="ml-2 font-mono">X: {currentArea.x}, Y: {currentArea.y}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Size:</span>
              <span className="ml-2 font-mono">{currentArea.width} × {currentArea.height}</span>
            </div>
          </div>
          
          {/* Visual representation */}
          <div className="mt-3 relative bg-gray-800 rounded" style={{ width: '200px', height: '112px' }}>
            <div className="text-xs text-white absolute top-1 left-1">Screen (1920×1080)</div>
            <div 
              className="absolute bg-blue-500/30 border-2 border-blue-500 rounded"
              style={{
                left: `${(currentArea.x / 1920) * 200}px`,
                top: `${(currentArea.y / 1080) * 112}px`,
                width: `${Math.min((currentArea.width / 1920) * 200, 200)}px`,
                height: `${Math.min((currentArea.height / 1080) * 112, 112)}px`
              }}
            >
              <div className="text-xs text-white p-1">Detection Area</div>
            </div>
          </div>
        </div>

        {/* Manual Coordinate Input */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium">Manual Coordinates</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="area-x" className="text-sm">X Position</Label>
              <input
                id="area-x"
                type="number"
                value={localArea.x}
                onChange={(e) => handleInputChange('x', e.target.value)}
                className="mt-1 w-full p-2 bg-secondary border border-border rounded-md text-foreground text-sm"
                placeholder="0"
                data-testid="input-area-x"
              />
            </div>
            <div>
              <Label htmlFor="area-y" className="text-sm">Y Position</Label>
              <input
                id="area-y"
                type="number"
                value={localArea.y}
                onChange={(e) => handleInputChange('y', e.target.value)}
                className="mt-1 w-full p-2 bg-secondary border border-border rounded-md text-foreground text-sm"
                placeholder="0"
                data-testid="input-area-y"
              />
            </div>
            <div>
              <Label htmlFor="area-width" className="text-sm">Width</Label>
              <input
                id="area-width"
                type="number"
                value={localArea.width}
                onChange={(e) => handleInputChange('width', e.target.value)}
                className="mt-1 w-full p-2 bg-secondary border border-border rounded-md text-foreground text-sm"
                placeholder="1920"
                data-testid="input-area-width"
              />
            </div>
            <div>
              <Label htmlFor="area-height" className="text-sm">Height</Label>
              <input
                id="area-height"
                type="number"
                value={localArea.height}
                onChange={(e) => handleInputChange('height', e.target.value)}
                className="mt-1 w-full p-2 bg-secondary border border-border rounded-md text-foreground text-sm"
                placeholder="100"
                data-testid="input-area-height"
              />
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button 
              onClick={applyChanges}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              data-testid="button-apply-area"
            >
              Apply Changes
            </Button>
            <Button 
              onClick={resetToDefault}
              variant="outline"
              className="flex items-center space-x-1"
              data-testid="button-reset-area"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset</span>
            </Button>
          </div>
        </div>

        {/* Preset Options */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Quick Presets</h4>
          <div className="grid grid-cols-1 gap-2">
            {presets.map((preset, index) => (
              <button
                key={index}
                onClick={() => applyPreset(preset.area)}
                className="p-3 text-left bg-secondary/30 hover:bg-secondary/50 rounded-lg border border-border transition-colors"
                data-testid={`preset-${preset.name.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <div className="font-medium text-sm">{preset.name}</div>
                <div className="text-xs text-muted-foreground">{preset.description}</div>
                <div className="text-xs font-mono mt-1 text-blue-400">
                  {preset.area.x}, {preset.area.y} • {preset.area.width}×{preset.area.height}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Tips */}
        <div className="bg-yellow-500/10 p-3 rounded-lg border border-yellow-500/20">
          <h4 className="text-sm font-medium text-yellow-700 dark:text-yellow-400 mb-2">💡 Tips</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• <strong>RECOMMENDED:</strong> Use "PocketOption Open Trades Panel" preset for the right-side trades list</li>
            <li>• For Binary Baseline: Look for red/green status in the header area</li>
            <li>• Start with a larger area and narrow it down for better accuracy</li>
            <li>• X=0, Y=0 is the top-left corner of your screen</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}