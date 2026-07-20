import { useState, useMemo } from "react";
import { 
  Search, 
  Calendar, 
  ChevronUp, 
  ChevronDown, 
  ChevronsUpDown, 
  ShieldCheck, 
  Activity, 
  AlertTriangle, 
  XCircle, 
  CheckCircle2, 
  Eye, 
  ClipboardList, 
  User, 
  Server, 
  Globe, 
  Laptop, 
  Clock, 
  Shield, 
  ArrowUpRight,
  Filter
} from "lucide-react";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription 
} from "@/components/ui/sheet";

export interface AuditLog {
  id: string;
  timestamp: string;
  isoDate: string;
  userName: string;
  userEmail: string;
  userRole: "Admin" | "Manager" | "System" | "User";
  module: "User Management" | "Recordings" | "Live Sessions" | "Rules & Policies" | "Storage" | "Authentication" | "System";
  action: string;
  details: string;
  ipAddress: string;
  deviceBrowser: string;
  status: "success" | "warning" | "failed";
  metadata: Record<string, string>;
}

const DUMMY_AUDIT_LOGS: AuditLog[] = [
  {
    id: "LOG-9821",
    timestamp: "Jul 20, 2026 16:45:12",
    isoDate: "2026-07-20T16:45:12Z",
    userName: "Admin User",
    userEmail: "admin@acmecorp.com",
    userRole: "Admin",
    module: "User Management",
    action: "User Created",
    details: "Created new employee account 'David Wallace' (david.w@acmecorp.com) with role Manager",
    ipAddress: "192.168.1.105",
    deviceBrowser: "Chrome 126.0 (Windows 11)",
    status: "success",
    metadata: {
      "Target User ID": "USR-4091",
      "Department": "Sales Engineering",
      "Assigned Group": "Region North America",
      "Session Token": "sess_89f2a491bc"
    }
  },
  {
    id: "LOG-9820",
    timestamp: "Jul 20, 2026 16:30:04",
    isoDate: "2026-07-20T16:30:04Z",
    userName: "System Agent",
    userEmail: "agent@monitorpro.internal",
    userRole: "System",
    module: "Storage",
    action: "Storage Upload Completed",
    details: "Uploaded session recording '2026-07-20_16-15-00.webm' (184.5 MB) to Supabase Cloud Storage",
    ipAddress: "10.0.4.12",
    deviceBrowser: "MonitorPro Agent 1.2.0 (Windows 11)",
    status: "success",
    metadata: {
      "Device Name": "DESKTOP-R90A7B",
      "File Size": "184.5 MB",
      "Upload Time": "4.2 seconds",
      "Storage Bucket": "recordings"
    }
  },
  {
    id: "LOG-9819",
    timestamp: "Jul 20, 2026 15:58:31",
    isoDate: "2026-07-20T15:58:31Z",
    userName: "Sarah Chen",
    userEmail: "sarah.chen@acmecorp.com",
    userRole: "Manager",
    module: "Recordings",
    action: "Recording Downloaded",
    details: "Downloaded screen recording session #1042 for user 'Michael Scott'",
    ipAddress: "192.168.1.142",
    deviceBrowser: "Firefox 127.0 (macOS Sonoma)",
    status: "success",
    metadata: {
      "Session ID": "1042",
      "File Name": "2026-07-20_14-00-00.webm",
      "Download Reason": "Routine compliance review"
    }
  },
  {
    id: "LOG-9818",
    timestamp: "Jul 20, 2026 15:42:10",
    isoDate: "2026-07-20T15:42:10Z",
    userName: "System Agent",
    userEmail: "agent@monitorpro.internal",
    userRole: "System",
    module: "Storage",
    action: "Storage Upload Failed",
    details: "Failed to upload video chunk due to network timeout (HTTP 504 Gateway Timeout)",
    ipAddress: "10.0.4.18",
    deviceBrowser: "MonitorPro Agent 1.2.0 (Linux x64)",
    status: "failed",
    metadata: {
      "Error Code": "ETIMEDOUT",
      "Retry Attempt": "3 of 3",
      "Device Name": "DEV-SERVER-04",
      "Destination": "s3.us-east-1.amazonaws.com"
    }
  },
  {
    id: "LOG-9817",
    timestamp: "Jul 20, 2026 14:15:00",
    isoDate: "2026-07-20T14:15:00Z",
    userName: "Admin User",
    userEmail: "admin@acmecorp.com",
    userRole: "Admin",
    module: "Rules & Policies",
    action: "Productivity Rule Updated",
    details: "Modified idle timeout policy threshold from 10 minutes to 5 minutes",
    ipAddress: "192.168.1.105",
    deviceBrowser: "Chrome 126.0 (Windows 11)",
    status: "success",
    metadata: {
      "Policy Name": "Default Workstation Idle Timeout",
      "Old Value": "600s",
      "New Value": "300s",
      "Scope": "All Active Devices"
    }
  },
  {
    id: "LOG-9816",
    timestamp: "Jul 20, 2026 13:50:22",
    isoDate: "2026-07-20T13:50:22Z",
    userName: "Sarah Chen",
    userEmail: "sarah.chen@acmecorp.com",
    userRole: "Manager",
    module: "Live Sessions",
    action: "Live Session Viewed",
    details: "Initiated live stream monitoring on device 'DESKTOP-SALES-02' (User: Dwight Schrute)",
    ipAddress: "192.168.1.142",
    deviceBrowser: "Firefox 127.0 (macOS Sonoma)",
    status: "success",
    metadata: {
      "Stream ID": "stream_908412",
      "Device ID": "DEV-002",
      "FPS": "30",
      "Resolution": "1080p"
    }
  },
  {
    id: "LOG-9815",
    timestamp: "Jul 20, 2026 12:10:44",
    isoDate: "2026-07-20T12:10:44Z",
    userName: "Admin User",
    userEmail: "admin@acmecorp.com",
    userRole: "Admin",
    module: "User Management",
    action: "User Deleted",
    details: "Permanently deleted user account 'Ryan Howard' (temp.user@acmecorp.com) and associated metadata",
    ipAddress: "192.168.1.105",
    deviceBrowser: "Chrome 126.0 (Windows 11)",
    status: "warning",
    metadata: {
      "Deleted User ID": "USR-1092",
      "Recordings Retained": "Yes (30-day archival policy)",
      "Approved By": "Admin User"
    }
  },
  {
    id: "LOG-9814",
    timestamp: "Jul 20, 2026 11:32:05",
    isoDate: "2026-07-20T11:32:05Z",
    userName: "Admin User",
    userEmail: "admin@acmecorp.com",
    userRole: "Admin",
    module: "Recordings",
    action: "Recording Deleted",
    details: "Manually purged expired recording file #891 (Storage cleanup policy)",
    ipAddress: "192.168.1.105",
    deviceBrowser: "Chrome 126.0 (Windows 11)",
    status: "warning",
    metadata: {
      "Recording ID": "891",
      "Age": "94 days",
      "Freed Space": "412.8 MB"
    }
  },
  {
    id: "LOG-9813",
    timestamp: "Jul 20, 2026 09:15:00",
    isoDate: "2026-07-20T09:15:00Z",
    userName: "Admin User",
    userEmail: "admin@acmecorp.com",
    userRole: "Admin",
    module: "Authentication",
    action: "Admin Login",
    details: "Successful admin authentication via session token",
    ipAddress: "192.168.1.105",
    deviceBrowser: "Chrome 126.0 (Windows 11)",
    status: "success",
    metadata: {
      "Auth Method": "Bearer JWT Token",
      "MFA Verified": "True",
      "Session ID": "sess_8910ac"
    }
  },
  {
    id: "LOG-9812",
    timestamp: "Jul 19, 2026 23:45:10",
    isoDate: "2026-07-19T23:45:10Z",
    userName: "Unknown User",
    userEmail: "intruder@external-ip.net",
    userRole: "User",
    module: "Authentication",
    action: "Admin Login Failed",
    details: "Failed authentication attempt on endpoint /api/auth/login due to invalid credentials",
    ipAddress: "185.220.101.5",
    deviceBrowser: "Python-urllib/3.11",
    status: "failed",
    metadata: {
      "Attempted Username": "administrator",
      "Failure Reason": "Invalid Password",
      "Geo Location": "Frankfurt, Germany",
      "Blocked By Rate Limiter": "False"
    }
  },
  {
    id: "LOG-9811",
    timestamp: "Jul 19, 2026 18:20:14",
    isoDate: "2026-07-19T18:20:14Z",
    userName: "Sarah Chen",
    userEmail: "sarah.chen@acmecorp.com",
    userRole: "Manager",
    module: "Authentication",
    action: "Admin Logout",
    details: "Manager user gracefully logged out of portal",
    ipAddress: "192.168.1.142",
    deviceBrowser: "Firefox 127.0 (macOS Sonoma)",
    status: "success",
    metadata: {
      "Session Duration": "4 hours 15 minutes",
      "Logout Type": "Explicit User Action"
    }
  },
  {
    id: "LOG-9810",
    timestamp: "Jul 19, 2026 15:10:00",
    isoDate: "2026-07-19T15:10:00Z",
    userName: "System Agent",
    userEmail: "agent@monitorpro.internal",
    userRole: "System",
    module: "System",
    action: "Database Backup Completed",
    details: "Automated daily snapshot database backup generated successfully (Size: 842.1 MB)",
    ipAddress: "127.0.0.1",
    deviceBrowser: "Internal Cron Job",
    status: "success",
    metadata: {
      "Backup File": "db_backup_2026-07-19.pgdump",
      "Checksum": "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
    }
  },
  {
    id: "LOG-9809",
    timestamp: "Jul 19, 2026 11:05:32",
    isoDate: "2026-07-19T11:05:32Z",
    userName: "Jim Halpert",
    userEmail: "jim.halpert@acmecorp.com",
    userRole: "User",
    module: "Live Sessions",
    action: "Live Session Viewed",
    details: "Accessed live monitoring tab for workspace 'Sales Team Alpha'",
    ipAddress: "192.168.1.118",
    deviceBrowser: "Safari 17.4 (macOS Sonoma)",
    status: "success",
    metadata: {
      "View Mode": "Grid View",
      "Devices Monitored": "4"
    }
  },
  {
    id: "LOG-9808",
    timestamp: "Jul 18, 2026 16:40:19",
    isoDate: "2026-07-18T16:40:19Z",
    userName: "Admin User",
    userEmail: "admin@acmecorp.com",
    userRole: "Admin",
    module: "User Management",
    action: "User Created",
    details: "Created new employee account 'Pam Beesly' (pam.b@acmecorp.com) with role User",
    ipAddress: "192.168.1.105",
    deviceBrowser: "Chrome 126.0 (Windows 11)",
    status: "success",
    metadata: {
      "Target User ID": "USR-4090",
      "Department": "Design & Marketing"
    }
  },
  {
    id: "LOG-9807",
    timestamp: "Jul 18, 2026 14:00:55",
    isoDate: "2026-07-18T14:00:55Z",
    userName: "System Agent",
    userEmail: "agent@monitorpro.internal",
    userRole: "System",
    module: "Storage",
    action: "Storage Upload Completed",
    details: "Uploaded session recording '2026-07-18_13-00-00.webm' (210.4 MB) to cloud storage",
    ipAddress: "10.0.4.15",
    deviceBrowser: "MonitorPro Agent 1.2.0 (Windows 11)",
    status: "success",
    metadata: {
      "Device Name": "DESKTOP-FIN-01",
      "File Size": "210.4 MB"
    }
  },
  {
    id: "LOG-9806",
    timestamp: "Jul 17, 2026 17:30:00",
    isoDate: "2026-07-17T17:30:00Z",
    userName: "Admin User",
    userEmail: "admin@acmecorp.com",
    userRole: "Admin",
    module: "Rules & Policies",
    action: "Productivity Rule Updated",
    details: "Added new category filter for website tracking: 'Social Media & Games'",
    ipAddress: "192.168.1.105",
    deviceBrowser: "Edge 125.0 (Windows 11)",
    status: "success",
    metadata: {
      "Category ID": "CAT-09",
      "Filter Type": "Non-productive"
    }
  },
  {
    id: "LOG-9805",
    timestamp: "Jul 17, 2026 10:12:40",
    isoDate: "2026-07-17T10:12:40Z",
    userName: "Sarah Chen",
    userEmail: "sarah.chen@acmecorp.com",
    userRole: "Manager",
    module: "Recordings",
    action: "Recording Downloaded",
    details: "Exported session video audit log #904 for customer support review",
    ipAddress: "192.168.1.142",
    deviceBrowser: "Firefox 127.0 (macOS Sonoma)",
    status: "success",
    metadata: {
      "Recording ID": "904",
      "Size": "142.1 MB"
    }
  },
  {
    id: "LOG-9804",
    timestamp: "Jul 16, 2026 19:05:11",
    isoDate: "2026-07-16T19:05:11Z",
    userName: "System Agent",
    userEmail: "agent@monitorpro.internal",
    userRole: "System",
    module: "Storage",
    action: "Storage Upload Failed",
    details: "Storage quota exceeded error while attempting chunk upload (403 Storage Full)",
    ipAddress: "10.0.4.99",
    deviceBrowser: "MonitorPro Agent 1.2.0 (Windows 10)",
    status: "failed",
    metadata: {
      "Quota": "500 GB",
      "Current Storage": "499.8 GB"
    }
  },
  {
    id: "LOG-9803",
    timestamp: "Jul 16, 2026 12:45:00",
    isoDate: "2026-07-16T12:45:00Z",
    userName: "Admin User",
    userEmail: "admin@acmecorp.com",
    userRole: "Admin",
    module: "Authentication",
    action: "Admin Login",
    details: "Admin User logged into dashboard from new IP address",
    ipAddress: "192.168.1.105",
    deviceBrowser: "Chrome 126.0 (Windows 11)",
    status: "success",
    metadata: {
      "MFA": "Passed",
      "Location": "Scranton, PA"
    }
  },
  {
    id: "LOG-9802",
    timestamp: "Jul 15, 2026 14:10:00",
    isoDate: "2026-07-15T14:10:00Z",
    userName: "Admin User",
    userEmail: "admin@acmecorp.com",
    userRole: "Admin",
    module: "User Management",
    action: "User Created",
    details: "Created new employee account 'Angela Martin' (angela.m@acmecorp.com) with role User",
    ipAddress: "192.168.1.105",
    deviceBrowser: "Chrome 126.0 (Windows 11)",
    status: "success",
    metadata: {
      "Target User ID": "USR-4089",
      "Department": "Accounting"
    }
  }
];

type SortField = "timestamp" | "userName" | "module" | "action" | "status";
type SortDir = "asc" | "desc";

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <ChevronsUpDown className="w-3.5 h-3.5 ml-1 text-slate-300 inline" />;
  return dir === "asc"
    ? <ChevronUp className="w-3.5 h-3.5 ml-1 text-indigo-600 inline" />
    : <ChevronDown className="w-3.5 h-3.5 ml-1 text-indigo-600 inline" />;
}

export default function AuditLogs() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState<string>("all");
  const [moduleFilter, setModuleFilter] = useState<string>("all");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("timestamp");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const limit = 10;

  // Filter logs based on search & filters
  const filteredLogs = useMemo(() => {
    return DUMMY_AUDIT_LOGS.filter((log) => {
      // Search
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchesId = log.id.toLowerCase().includes(query);
        const matchesUser = log.userName.toLowerCase().includes(query) || log.userEmail.toLowerCase().includes(query);
        const matchesDetails = log.details.toLowerCase().includes(query);
        const matchesIp = log.ipAddress.toLowerCase().includes(query);
        if (!matchesId && !matchesUser && !matchesDetails && !matchesIp) {
          return false;
        }
      }

      // Date Range Filter
      if (dateRange !== "all") {
        const logDate = new Date(log.isoDate);
        const now = new Date("2026-07-20T23:59:59Z");
        if (dateRange === "today") {
          const todayStr = "2026-07-20";
          if (!log.isoDate.startsWith(todayStr)) return false;
        } else if (dateRange === "7days") {
          const diffDays = (now.getTime() - logDate.getTime()) / (1000 * 3600 * 24);
          if (diffDays > 7) return false;
        } else if (dateRange === "30days") {
          const diffDays = (now.getTime() - logDate.getTime()) / (1000 * 3600 * 24);
          if (diffDays > 30) return false;
        }
      }

      // Module Filter
      if (moduleFilter !== "all" && log.module !== moduleFilter) {
        return false;
      }

      // Action Filter
      if (actionFilter !== "all" && log.action !== actionFilter) {
        return false;
      }

      // Status Filter
      if (statusFilter !== "all" && log.status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [search, dateRange, moduleFilter, actionFilter, statusFilter]);

  // Sort logs
  const sortedLogs = useMemo(() => {
    return [...filteredLogs].sort((a, b) => {
      let va: any, vb: any;
      if (sortField === "timestamp") {
        va = new Date(a.isoDate).getTime();
        vb = new Date(b.isoDate).getTime();
      } else if (sortField === "userName") {
        va = a.userName;
        vb = b.userName;
      } else if (sortField === "module") {
        va = a.module;
        vb = b.module;
      } else if (sortField === "action") {
        va = a.action;
        vb = b.action;
      } else if (sortField === "status") {
        va = a.status;
        vb = b.status;
      }

      if (typeof va === "string") {
        return sortDir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
      }
      return sortDir === "asc" ? va - vb : vb - va;
    });
  }, [filteredLogs, sortField, sortDir]);

  // Paginated logs
  const total = sortedLogs.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const currentLogs = useMemo(() => {
    const start = (page - 1) * limit;
    return sortedLogs.slice(start, start + limit);
  }, [sortedLogs, page, limit]);

  // Summary counts calculated from all DUMMY_AUDIT_LOGS
  const summary = useMemo(() => {
    const totalLogs = DUMMY_AUDIT_LOGS.length;
    const adminActions = DUMMY_AUDIT_LOGS.filter(l => l.userRole === "Admin").length;
    const systemEvents = DUMMY_AUDIT_LOGS.filter(l => l.userRole === "System").length;
    const failedActions = DUMMY_AUDIT_LOGS.filter(l => l.status === "failed").length;
    return { totalLogs, adminActions, systemEvents, failedActions };
  }, []);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const hasActiveFilters = Boolean(
    search || dateRange !== "all" || moduleFilter !== "all" || actionFilter !== "all" || statusFilter !== "all"
  );

  const clearFilters = () => {
    setSearch("");
    setDateRange("all");
    setModuleFilter("all");
    setActionFilter("all");
    setStatusFilter("all");
    setPage(1);
  };

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Audit Logs</h1>
          <p className="text-sm text-slate-500 mt-1">
            Track system events, administrative actions, security compliance, and user operations.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-xs font-semibold text-slate-600 bg-slate-100 px-3.5 py-2 rounded-lg border border-slate-200 shadow-sm flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-indigo-600" />
            {total} Log Entries
          </div>
        </div>
      </div>

      {/* Top Summary Cards */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Logs Card */}
        <Card className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Logs</span>
              <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                <ClipboardList className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-bold text-slate-900">{summary.totalLogs}</div>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1 font-medium">
                <span className="text-emerald-600 font-semibold flex items-center">
                  +12% <ArrowUpRight className="w-3 h-3" />
                </span> 
                vs last week
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Admin Actions Card */}
        <Card className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Admin Actions</span>
              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-bold text-slate-900">{summary.adminActions}</div>
              <p className="text-xs text-slate-500 mt-1 font-medium">Privileged user changes</p>
            </div>
          </CardContent>
        </Card>

        {/* System Events Card */}
        <Card className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">System Events</span>
              <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
                <Activity className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-bold text-slate-900">{summary.systemEvents}</div>
              <p className="text-xs text-slate-500 mt-1 font-medium">Automated agent & background tasks</p>
            </div>
          </CardContent>
        </Card>

        {/* Failed Actions Card */}
        <Card className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Failed Actions</span>
              <div className="w-9 h-9 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-bold text-slate-900">{summary.failedActions}</div>
              <p className="text-xs text-rose-600 mt-1 font-semibold flex items-center gap-1">
                Requires investigation
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table & Filters Card */}
      <Card className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden flex flex-col">
        {/* Filters Bar */}
        <div className="p-5 border-b border-slate-100 bg-white space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-[240px] max-w-md">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by log ID, user, IP, or details..."
                className="pl-9 h-10 bg-slate-50 border-slate-200 focus-visible:ring-indigo-500 rounded-lg text-sm"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
            </div>

            {/* Date Range Picker */}
            <Select value={dateRange} onValueChange={(v) => { setDateRange(v); setPage(1); }}>
              <SelectTrigger className="w-40 h-10 bg-slate-50 border-slate-200 rounded-lg text-sm text-slate-700 font-medium">
                <div className="flex items-center gap-2 truncate">
                  <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                  <SelectValue placeholder="Date Range" />
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-200">
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="7days">Last 7 Days</SelectItem>
                <SelectItem value="30days">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>

            {/* Module Filter */}
            <Select value={moduleFilter} onValueChange={(v) => { setModuleFilter(v); setPage(1); }}>
              <SelectTrigger className="w-44 h-10 bg-slate-50 border-slate-200 rounded-lg text-sm text-slate-700 font-medium">
                <SelectValue placeholder="Module" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-200">
                <SelectItem value="all">All Modules</SelectItem>
                <SelectItem value="User Management">User Management</SelectItem>
                <SelectItem value="Recordings">Recordings</SelectItem>
                <SelectItem value="Live Sessions">Live Sessions</SelectItem>
                <SelectItem value="Rules & Policies">Rules & Policies</SelectItem>
                <SelectItem value="Storage">Storage</SelectItem>
                <SelectItem value="Authentication">Authentication</SelectItem>
                <SelectItem value="System">System</SelectItem>
              </SelectContent>
            </Select>

            {/* Action Filter */}
            <Select value={actionFilter} onValueChange={(v) => { setActionFilter(v); setPage(1); }}>
              <SelectTrigger className="w-48 h-10 bg-slate-50 border-slate-200 rounded-lg text-sm text-slate-700 font-medium">
                <SelectValue placeholder="Action" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-200">
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="User Created">User Created</SelectItem>
                <SelectItem value="User Deleted">User Deleted</SelectItem>
                <SelectItem value="Recording Downloaded">Recording Downloaded</SelectItem>
                <SelectItem value="Recording Deleted">Recording Deleted</SelectItem>
                <SelectItem value="Live Session Viewed">Live Session Viewed</SelectItem>
                <SelectItem value="Productivity Rule Updated">Productivity Rule Updated</SelectItem>
                <SelectItem value="Storage Upload Completed">Storage Upload Completed</SelectItem>
                <SelectItem value="Storage Upload Failed">Storage Upload Failed</SelectItem>
                <SelectItem value="Admin Login">Admin Login</SelectItem>
                <SelectItem value="Admin Logout">Admin Logout</SelectItem>
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
              <SelectTrigger className="w-36 h-10 bg-slate-50 border-slate-200 rounded-lg text-sm text-slate-700 font-medium">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-200">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-500 hover:text-slate-900 h-10 px-4 rounded-lg font-medium"
                onClick={clearFilters}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        {/* Audit Logs Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/80">
              <TableRow className="border-slate-100 hover:bg-transparent">
                <TableHead
                  className="text-xs font-semibold text-slate-500 py-3.5 pl-6 cursor-pointer select-none group"
                  onClick={() => handleSort("timestamp")}
                >
                  <span className="flex items-center group-hover:text-slate-700 transition-colors">
                    Timestamp <SortIcon active={sortField === "timestamp"} dir={sortDir} />
                  </span>
                </TableHead>
                <TableHead
                  className="text-xs font-semibold text-slate-500 py-3.5 cursor-pointer select-none group"
                  onClick={() => handleSort("userName")}
                >
                  <span className="flex items-center group-hover:text-slate-700 transition-colors">
                    User / Admin <SortIcon active={sortField === "userName"} dir={sortDir} />
                  </span>
                </TableHead>
                <TableHead
                  className="text-xs font-semibold text-slate-500 py-3.5 cursor-pointer select-none group"
                  onClick={() => handleSort("module")}
                >
                  <span className="flex items-center group-hover:text-slate-700 transition-colors">
                    Module <SortIcon active={sortField === "module"} dir={sortDir} />
                  </span>
                </TableHead>
                <TableHead
                  className="text-xs font-semibold text-slate-500 py-3.5 cursor-pointer select-none group"
                  onClick={() => handleSort("action")}
                >
                  <span className="flex items-center group-hover:text-slate-700 transition-colors">
                    Action <SortIcon active={sortField === "action"} dir={sortDir} />
                  </span>
                </TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 py-3.5 min-w-[220px]">
                  Details
                </TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 py-3.5">
                  IP Address
                </TableHead>
                <TableHead
                  className="text-xs font-semibold text-slate-500 py-3.5 cursor-pointer select-none group"
                  onClick={() => handleSort("status")}
                >
                  <span className="flex items-center group-hover:text-slate-700 transition-colors">
                    Status <SortIcon active={sortField === "status"} dir={sortDir} />
                  </span>
                </TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 py-3.5 text-right pr-6">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-48 text-center text-slate-500 text-sm">
                    No audit logs match your search and filter criteria.
                  </TableCell>
                </TableRow>
              ) : (
                currentLogs.map((log) => (
                  <TableRow
                    key={log.id}
                    className="border-slate-100 hover:bg-slate-50/80 transition-colors group"
                  >
                    {/* Timestamp */}
                    <TableCell className="pl-6 whitespace-nowrap text-xs font-medium text-slate-600">
                      {log.timestamp}
                    </TableCell>

                    {/* User / Admin */}
                    <TableCell className="whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-bold text-[10px] shrink-0">
                          {log.userRole === "System" ? (
                            <Server className="w-3.5 h-3.5 text-purple-600" />
                          ) : (
                            <span>{log.userName.charAt(0)}</span>
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-xs text-slate-900 flex items-center gap-1.5">
                            {log.userName}
                            {log.userRole === "Admin" && (
                              <span className="text-[9px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-bold uppercase tracking-wide">
                                Admin
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400">{log.userEmail}</div>
                        </div>
                      </div>
                    </TableCell>

                    {/* Module */}
                    <TableCell className="whitespace-nowrap">
                      <Badge
                        variant="outline"
                        className="bg-slate-50 text-slate-700 border-slate-200 text-[11px] font-medium px-2.5 py-0.5 rounded-md"
                      >
                        {log.module}
                      </Badge>
                    </TableCell>

                    {/* Action */}
                    <TableCell className="whitespace-nowrap">
                      <span className="text-xs font-semibold text-slate-800">{log.action}</span>
                    </TableCell>

                    {/* Details */}
                    <TableCell className="max-w-[280px]">
                      <p className="text-xs text-slate-600 truncate" title={log.details}>
                        {log.details}
                      </p>
                    </TableCell>

                    {/* IP Address */}
                    <TableCell className="whitespace-nowrap text-xs font-mono text-slate-500">
                      {log.ipAddress}
                    </TableCell>

                    {/* Status */}
                    <TableCell className="whitespace-nowrap">
                      {log.status === "success" && (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold uppercase tracking-wider">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Success
                        </div>
                      )}
                      {log.status === "warning" && (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 border border-amber-200 text-amber-700 text-[11px] font-bold uppercase tracking-wider">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Warning
                        </div>
                      )}
                      {log.status === "failed" && (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-bold uppercase tracking-wider">
                          <XCircle className="w-3.5 h-3.5 text-rose-600" /> Failed
                        </div>
                      )}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right pr-6 whitespace-nowrap">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-3 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 font-medium text-xs rounded-lg gap-1.5"
                        onClick={() => setSelectedLog(log)}
                      >
                        <Eye className="w-3.5 h-3.5" /> View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50">
          <div className="text-xs font-medium text-slate-500">
            {total > 0
              ? `Showing ${(page - 1) * limit + 1} to ${Math.min(page * limit, total)} of ${total} entries`
              : "0 entries"}
          </div>
          <div className="flex gap-2 items-center">
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-3 rounded-lg border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-medium"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Prev
            </Button>
            <div className="flex items-center justify-center px-4 h-8 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg shadow-sm">
              Page {page} of {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-3 rounded-lg border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-medium"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      </Card>

      {/* View Details Right-Side Drawer (Sheet) */}
      <Sheet open={Boolean(selectedLog)} onOpenChange={(open) => !open && setSelectedLog(null)}>
        <SheetContent side="right" className="w-full sm:max-w-lg bg-white p-0 overflow-y-auto flex flex-col">
          {selectedLog && (
            <>
              {/* Sheet Header */}
              <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <span className="text-xs font-mono font-semibold text-slate-500 bg-slate-200/70 px-2.5 py-1 rounded">
                    {selectedLog.id}
                  </span>
                  {selectedLog.status === "success" && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold uppercase tracking-wider">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Success
                    </div>
                  )}
                  {selectedLog.status === "warning" && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 border border-amber-200 text-amber-700 text-[11px] font-bold uppercase tracking-wider">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Warning
                    </div>
                  )}
                  {selectedLog.status === "failed" && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-bold uppercase tracking-wider">
                      <XCircle className="w-3.5 h-3.5 text-rose-600" /> Failed
                    </div>
                  )}
                </div>
                <SheetTitle className="text-xl font-bold text-slate-900">
                  {selectedLog.action}
                </SheetTitle>
                <SheetDescription className="text-xs text-slate-500 mt-1">
                  Audit log record details and telemetry snapshot
                </SheetDescription>
              </div>

              {/* Sheet Body */}
              <div className="p-6 space-y-6 flex-1">
                {/* Information Grid */}
                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1">
                      Timestamp
                    </span>
                    <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {selectedLog.timestamp}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1">
                      Module
                    </span>
                    <Badge variant="outline" className="bg-white text-indigo-700 border-indigo-200 text-xs font-semibold">
                      {selectedLog.module}
                    </Badge>
                  </div>
                </div>

                {/* Performed By Section */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                    Performed By
                  </h4>
                  <div className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl">
                    <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
                      {selectedLog.userRole === "System" ? (
                        <Server className="w-5 h-5 text-purple-600" />
                      ) : (
                        selectedLog.userName.charAt(0)
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-slate-900 flex items-center gap-2">
                        {selectedLog.userName}
                        <Badge variant="secondary" className="text-[10px] uppercase font-bold px-1.5 py-0">
                          {selectedLog.userRole}
                        </Badge>
                      </div>
                      <div className="text-xs text-slate-500">{selectedLog.userEmail}</div>
                    </div>
                  </div>
                </div>

                {/* Action Details */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Description & Context
                  </h4>
                  <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-700 leading-relaxed font-normal">
                    {selectedLog.details}
                  </div>
                </div>

                {/* Network & Client telemetry */}
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Network & Client Info
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-lg">
                      <span className="text-slate-500 font-medium flex items-center gap-2">
                        <Globe className="w-4 h-4 text-slate-400" /> IP Address
                      </span>
                      <span className="font-mono font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                        {selectedLog.ipAddress}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-lg">
                      <span className="text-slate-500 font-medium flex items-center gap-2">
                        <Laptop className="w-4 h-4 text-slate-400" /> Device / Browser
                      </span>
                      <span className="font-medium text-slate-800 text-right truncate max-w-[240px]">
                        {selectedLog.deviceBrowser}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Additional Metadata */}
                {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                      Event Metadata
                    </h4>
                    <div className="bg-slate-900 text-slate-200 p-4 rounded-xl font-mono text-[11px] space-y-1.5 overflow-x-auto shadow-inner">
                      {Object.entries(selectedLog.metadata).map(([key, val]) => (
                        <div key={key} className="flex gap-2">
                          <span className="text-indigo-400 font-semibold">{key}:</span>
                          <span className="text-slate-300">"{val}"</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sheet Footer */}
              <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
                <Button
                  variant="outline"
                  className="rounded-lg text-xs font-semibold text-slate-700 border-slate-200 hover:bg-slate-100"
                  onClick={() => setSelectedLog(null)}
                >
                  Close
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
