import {
  Gauge, Layers, Inbox, Users, ListTodo, Rocket, GitBranch, AlertTriangle,
  CheckCircle, Target, CreditCard, Smartphone, Monitor, Briefcase, Database,
  TrendingUp, Server, BarChart3, Flag, Compass, Settings, Activity, Search,
  Clock,
  Home, ChevronLeft, ChevronRight, XCircle,
} from 'lucide-react';

const ICONS = {
  Gauge,
  Layers,
  Inbox,
  Users,
  ListTodo,
  Rocket,
  GitBranch,
  AlertTriangle,
  CheckCircle,
  Target,
  CreditCard,
  Smartphone,
  Monitor,
  Briefcase,
  Database,
  TrendingUp,
  Server,
  BarChart3,
  Flag,
  Compass,
  Settings,
  Activity,
  Search,
  Clock,
  Home,
  ChevronLeft,
  ChevronRight,
  XCircle,
};

export function resolveIcon(key, fallback = Layers) {
  if (typeof key === 'function') return key;
  return ICONS[key] || fallback;
}

export function iconOptions() {
  return Object.keys(ICONS).sort();
}

export default ICONS;
