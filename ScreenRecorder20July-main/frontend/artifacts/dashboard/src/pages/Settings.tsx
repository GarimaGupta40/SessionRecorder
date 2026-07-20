import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Save, Loader2, Terminal, Settings as SettingsIcon, BookOpen, Building, ShieldAlert, Laptop, Play } from "lucide-react";
import ApiConsole from "@/components/ApiConsole";

// ─── Settings API helpers ─────────────────────────────────────────────────────

async function fetchSettings(): Promise<Record<string, string>> {
  const token = localStorage.getItem("token");
  const res = await fetch("/api/settings", {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error("Failed to load settings");
  return res.json();
}

async function saveSettings(data: Record<string, string>): Promise<Record<string, string>> {
  const token = localStorage.getItem("token");
  const res = await fetch("/api/settings", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to save settings");
  return res.json();
}

// ─── Tab system ───────────────────────────────────────────────────────────────

type Tab = "configuration" | "api-console" | "documentation";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "configuration", label: "Configuration",  icon: SettingsIcon },
  { id: "api-console",   label: "API Console",    icon: Terminal },
  { id: "documentation", label: "Documentation",  icon: BookOpen },
];

// ─── Configuration panel ─────────────────────────────────────────────────────

function ConfigurationPanel() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<Record<string, string>>({
    company_name: "",
    support_email: "",
    record_audio: "true",
    stealth_mode: "false",
    video_quality: "1080p",
    retention_days: "90",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings()
      .then(setSettings)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const set = (key: string, val: string) =>
    setSettings((s) => ({ ...s, [key]: val }));

  const handleSave = async (subset: Record<string, string>) => {
    setSaving(true);
    try {
      const updated = await saveSettings(subset);
      setSettings(updated);
      toast({ title: "Settings saved", description: "Configuration updated successfully." });
    } catch {
      toast({ title: "Error", description: "Failed to save settings.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-3 p-8 text-slate-500 font-medium">
        <Loader2 className="w-5 h-5 animate-spin text-indigo-500" /> Loading configuration...
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl pb-8">
      {/* Organization Info */}
      <Card className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
          <CardTitle className="text-sm font-semibold flex items-center gap-2 text-slate-800">
            <Building className="w-4 h-4 text-indigo-500" /> Organization Info
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">Basic information about your deployment</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5 pt-6 bg-white">
          <div className="grid gap-2">
            <Label className="text-xs font-semibold text-slate-700">Company Name</Label>
            <Input
              value={settings.company_name || ""}
              onChange={(e) => set("company_name", e.target.value)}
              className="bg-slate-50 border-slate-200 max-w-md h-10 text-sm focus-visible:ring-indigo-500 rounded-lg"
              placeholder="Acme Corp"
            />
          </div>
          <div className="grid gap-2">
            <Label className="text-xs font-semibold text-slate-700">Support Email</Label>
            <Input
              value={settings.support_email || ""}
              onChange={(e) => set("support_email", e.target.value)}
              type="email"
              className="bg-slate-50 border-slate-200 max-w-md h-10 text-sm focus-visible:ring-indigo-500 rounded-lg"
              placeholder="it-support@company.com"
            />
          </div>
          <div className="grid gap-2">
            <Label className="text-xs font-semibold text-slate-700">Data Retention (days)</Label>
            <Input
              value={settings.retention_days || "90"}
              onChange={(e) => set("retention_days", e.target.value)}
              type="number"
              className="bg-slate-50 border-slate-200 max-w-md h-10 text-sm focus-visible:ring-indigo-500 rounded-lg"
              placeholder="90"
            />
          </div>
          <div className="pt-2">
            <Button
              className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm font-medium rounded-lg h-10 px-5"
              disabled={saving}
              onClick={() =>
                handleSave({
                  company_name: settings.company_name,
                  support_email: settings.support_email,
                  retention_days: settings.retention_days,
                })
              }
            >
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Agent Configuration */}
      <Card className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
          <CardTitle className="text-sm font-semibold flex items-center gap-2 text-slate-800">
            <Laptop className="w-4 h-4 text-indigo-500" /> Agent Configuration
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">Default recording policies pushed to all endpoints</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6 bg-white">
          <div className="flex items-center justify-between py-1">
            <div className="space-y-1">
              <Label className="text-sm font-semibold text-slate-800">Record System Audio</Label>
              <p className="text-xs text-slate-500">
                Capture speaker output during sessions
              </p>
            </div>
            <Switch
              checked={settings.record_audio === "true"}
              onCheckedChange={(v) => set("record_audio", String(v))}
              className="data-[state=checked]:bg-indigo-600"
            />
          </div>
          <div className="flex items-center justify-between py-1">
            <div className="space-y-1">
              <Label className="text-sm font-semibold text-slate-800">Stealth Mode</Label>
              <p className="text-xs text-slate-500">
                Hide tray icon on user endpoints (Requires Admin)
              </p>
            </div>
            <Switch
              checked={settings.stealth_mode === "true"}
              onCheckedChange={(v) => set("stealth_mode", String(v))}
              className="data-[state=checked]:bg-indigo-600"
            />
          </div>
          <div className="grid gap-2 max-w-md pt-2">
            <Label className="text-xs font-semibold text-slate-700">Default Video Quality</Label>
            <Select
              value={settings.video_quality || "1080p"}
              onValueChange={(v) => set("video_quality", v)}
            >
              <SelectTrigger className="bg-slate-50 border-slate-200 h-10 text-sm focus:ring-indigo-500 rounded-lg">
                <SelectValue placeholder="Select quality" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-200">
                <SelectItem value="720p">720p (Storage Optimized)</SelectItem>
                <SelectItem value="1080p">1080p (Standard)</SelectItem>
                <SelectItem value="1440p">1440p (High Quality)</SelectItem>
                <SelectItem value="4k">4K (Maximum Quality)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="pt-2">
            <Button
              className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm font-medium rounded-lg h-10 px-5"
              disabled={saving}
              onClick={() =>
                handleSave({
                  record_audio: settings.record_audio,
                  stealth_mode: settings.stealth_mode,
                  video_quality: settings.video_quality,
                })
              }
            >
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Update Policy
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="bg-white border border-red-200 shadow-sm rounded-xl overflow-hidden">
        <CardHeader className="bg-red-50/30 border-b border-red-100 pb-4">
          <CardTitle className="text-sm font-bold flex items-center gap-2 text-red-600">
            <ShieldAlert className="w-4 h-4" /> Danger Zone
          </CardTitle>
          <CardDescription className="text-xs text-red-400">Irreversible destructive actions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-6 bg-white">
          <div className="flex items-center justify-between p-5 border border-red-100 bg-red-50/50 rounded-xl">
            <div>
              <h4 className="font-bold text-sm text-red-900">Purge All Recordings</h4>
              <p className="text-xs text-red-600/80 mt-1 font-medium">
                Permanently delete all session videos older than{" "}
                {settings.retention_days || 90} days.
              </p>
            </div>
            <Button variant="destructive" className="bg-red-600 hover:bg-red-700 font-bold rounded-lg shadow-sm">Purge Data</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Documentation panel ──────────────────────────────────────────────────────

function DocumentationPanel() {
  return (
    <div className="space-y-6 max-w-4xl pb-8">
      <Card className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
          <CardTitle className="text-sm font-semibold flex items-center gap-2 text-slate-800">
            <BookOpen className="w-4 h-4 text-indigo-500" /> API Documentation
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Interactive Swagger UI with live try-it-out for all 13 endpoints
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6 bg-white">
          <p className="text-sm text-slate-600 leading-relaxed">
            The full OpenAPI 3.0 specification is hosted at{" "}
            <code className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md">/api/docs</code>.
            Open it in a new tab to explore all endpoints, schemas, and try them
            out with the Swagger UI.
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            <a
              href="/api/docs"
              target="_blank"
              rel="noreferrer"
              className="flex flex-col gap-3 p-5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all shadow-sm group"
            >
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Play className="w-5 h-5 text-indigo-600 ml-0.5" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900 mb-1">Swagger UI</div>
                <div className="text-xs text-slate-500 font-medium leading-relaxed">
                  Interactive browser — try any endpoint live
                </div>
              </div>
            </a>
            <a
              href="/api/docs/spec.json"
              target="_blank"
              rel="noreferrer"
              className="flex flex-col gap-3 p-5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all shadow-sm group"
            >
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Terminal className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900 mb-1">OpenAPI Spec (JSON)</div>
                <div className="text-xs text-slate-500 font-medium leading-relaxed">
                  Import into Postman, Insomnia, or generate SDKs
                </div>
              </div>
            </a>
            <div className="flex flex-col gap-3 p-5 rounded-xl border border-slate-200 bg-slate-50/50">
              <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
                <SettingsIcon className="w-5 h-5 text-slate-500" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-400 mb-1">Agent SDKs</div>
                <div className="text-xs text-slate-400 font-medium leading-relaxed">
                  Electron, .NET, Python — coming soon
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 font-mono text-[13px] space-y-2 shadow-inner">
            <div className="text-slate-500 font-bold mb-3"># Agent quickstart (curl)</div>
            <div><span className="text-indigo-400 font-bold"># 1. Register device</span></div>
            <div className="text-emerald-400 break-all">
              {`curl -X POST /api/agent/register -H "Content-Type: application/json" \\`}
            </div>
            <div className="text-emerald-400 pl-4 break-all">
              {`-d '{"hostname":"MY-PC","operatingSystem":"Windows","agentVersion":"2.4.1","userId":1}'`}
            </div>
            <div className="mt-4"><span className="text-indigo-400 font-bold"># 2. Login</span></div>
            <div className="text-emerald-400 break-all">
              {`curl -X POST /api/agent/login -d '{"deviceId":42,"apiToken":"csr_live_..."}'`}
            </div>
            <div className="mt-4"><span className="text-indigo-400 font-bold"># 3. Start session</span></div>
            <div className="text-emerald-400 break-all">
              {`curl -X POST /api/session/start -H "Authorization: Bearer <JWT>" \\`}
            </div>
            <div className="text-emerald-400 pl-4 break-all">{`-d '{"deviceId":42}'`}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Main Settings page ───────────────────────────────────────────────────────

export default function Settings() {
  const [activeTab, setActiveTab] = useState<Tab>("configuration");

  return (
    <div className="space-y-8 pb-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Settings</h2>
        <p className="text-slate-500 text-sm mt-1">
          System configuration, API console, and documentation.
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-all -mb-px ${
              activeTab === id
                ? "border-indigo-600 text-indigo-700 bg-indigo-50/50 rounded-t-lg"
                : "border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-t-lg"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="pt-2">
        {activeTab === "configuration" && <ConfigurationPanel />}
        {activeTab === "api-console"   && <ApiConsole />}
        {activeTab === "documentation" && <DocumentationPanel />}
      </div>
    </div>
  );
}
