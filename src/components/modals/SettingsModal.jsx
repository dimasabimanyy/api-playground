"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { getThemeClasses } from "@/lib/theme";

export default function SettingsModal({
  open,
  onOpenChange,
}) {
  const { toggleTheme, isDark } = useTheme();
  const themeClasses = getThemeClasses(isDark);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`max-w-2xl max-h-[80vh] overflow-y-auto ${
          isDark ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"
        }`}
      >
        <DialogHeader>
          <DialogTitle
            className={`text-xl font-semibold ${themeClasses.text.primary}`}
          >
            Settings & Preferences
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* Appearance Section */}
          <div>
            <h3
              className={`text-sm font-semibold mb-3 ${themeClasses.text.primary}`}
            >
              Appearance
            </h3>
            <div className="space-y-3">
              <div className={`p-4 rounded-lg ${themeClasses.card.base}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p
                      className={`text-sm font-medium ${themeClasses.text.primary}`}
                    >
                      Theme
                    </p>
                    <p className={`text-xs ${themeClasses.text.tertiary}`}>
                      Choose your preferred color scheme
                    </p>
                  </div>
                  <button
                    onClick={toggleTheme}
                    className={`p-2 rounded transition-all duration-200 ${themeClasses.button.ghost}`}
                  >
                    {isDark ? (
                      <Sun className="h-4 w-4" />
                    ) : (
                      <Moon className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Editor Section */}
          <div>
            <h3
              className={`text-sm font-semibold mb-3 ${themeClasses.text.primary}`}
            >
              Editor
            </h3>
            <div className="space-y-3">
              <div className={`p-4 rounded-lg ${themeClasses.card.base}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p
                      className={`text-sm font-medium ${themeClasses.text.primary}`}
                    >
                      Font Size
                    </p>
                    <p className={`text-xs ${themeClasses.text.tertiary}`}>
                      Adjust the editor font size
                    </p>
                  </div>
                  <select
                    className={`px-3 py-1 rounded text-sm ${themeClasses.input.base}`}
                  >
                    <option value="12">12px</option>
                    <option value="14" defaultSelected>
                      14px
                    </option>
                    <option value="16">16px</option>
                  </select>
                </div>
              </div>
              <div className={`p-4 rounded-lg ${themeClasses.card.base}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p
                      className={`text-sm font-medium ${themeClasses.text.primary}`}
                    >
                      Auto-save
                    </p>
                    <p className={`text-xs ${themeClasses.text.tertiary}`}>
                      Automatically save changes
                    </p>
                  </div>
                  <button
                    className={`w-10 h-6 rounded-full transition-colors ${
                      isDark ? "bg-blue-600" : "bg-blue-500"
                    } relative`}
                  >
                    <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1 transition-transform"></div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* API Section */}
          <div>
            <h3
              className={`text-sm font-semibold mb-3 ${themeClasses.text.primary}`}
            >
              API Defaults
            </h3>
            <div className="space-y-3">
              <div className={`p-4 rounded-lg ${themeClasses.card.base}`}>
                <label
                  className={`text-sm font-medium ${themeClasses.text.primary}`}
                >
                  Default Base URL
                </label>
                <input
                  type="text"
                  placeholder="https://api.example.com"
                  className={`w-full mt-2 px-3 py-2 text-sm rounded ${themeClasses.input.base}`}
                />
              </div>
              <div className={`p-4 rounded-lg ${themeClasses.card.base}`}>
                <label
                  className={`text-sm font-medium ${themeClasses.text.primary}`}
                >
                  Request Timeout (ms)
                </label>
                <input
                  type="number"
                  placeholder="5000"
                  className={`w-full mt-2 px-3 py-2 text-sm rounded ${themeClasses.input.base}`}
                />
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}