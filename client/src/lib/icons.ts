import {
  BarChart3,
  Camera,
  ChartLine,
  Compass,
  Globe,
  Heart,
  LayoutGrid,
  Lightbulb,
  Mail,
  Megaphone,
  MessageCircle,
  Mic,
  Palette,
  PenTool,
  Rocket,
  Search,
  Share2,
  Smartphone,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Video,
  Zap,
  type LucideIcon,
  type LucideProps,
} from 'lucide-react'
import { createElement } from 'react'

/**
 * Curated icon set for services. The admin picks from this list (Phase 5),
 * which keeps the bundle small compared with loading any lucide icon by name.
 */
export const SERVICE_ICONS: Record<string, LucideIcon> = {
  'bar-chart-3': BarChart3,
  camera: Camera,
  'chart-line': ChartLine,
  compass: Compass,
  globe: Globe,
  heart: Heart,
  'layout-grid': LayoutGrid,
  lightbulb: Lightbulb,
  mail: Mail,
  megaphone: Megaphone,
  'message-circle': MessageCircle,
  mic: Mic,
  palette: Palette,
  'pen-tool': PenTool,
  rocket: Rocket,
  search: Search,
  'share-2': Share2,
  smartphone: Smartphone,
  sparkles: Sparkles,
  target: Target,
  'trending-up': TrendingUp,
  users: Users,
  video: Video,
  zap: Zap,
}

/** Renders a service icon by name (unknown names fall back to Sparkles). */
export function ServiceIcon({
  name,
  ...props
}: LucideProps & { name: string }) {
  return createElement(SERVICE_ICONS[name] ?? Sparkles, props)
}
