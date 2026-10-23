// lib/utils.ts
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import {
  format,
  formatDistanceToNow,
  formatDuration,
  intervalToDuration,
  isValid,
  parse,
  parseISO,
} from "date-fns"
import { enUS } from "date-fns/locale"
import { FILTER_ALL_VALUE } from "@/hooks/global"
import type {
  LandingServicePromotionResponse,
  ServicePromotionInput,
} from "@/interface/response"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ─── DATE / TIME ─────────────────────────────────────────────────

/**
 * Format date → "Jan 15, 2026"
 */
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—"
  const d = typeof date === "string" ? parseISO(date) : date
  if (!isValid(d)) return "Invalid date"
  return format(d, "MMM dd, yyyy", { locale: enUS })
}
export function formatDateToWeekday(
  date: Date | string | null | undefined
): string {
  if (!date) return "—"
  const d = typeof date === "string" ? parseISO(date) : date
  if (!isValid(d)) return "Invalid date"
  return format(d, "EEEE", { locale: enUS })
}

/**
 * Format date → "Jan 15, 2025 · 08:30 AM"
 */
export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "—"
  const d = typeof date === "string" ? parseISO(date) : date
  if (!isValid(d)) return "Invalid date"
  return format(d, "MMM dd, yyyy · hh:mm a", { locale: enUS })
}

/**
 * Format time only → "08:30 AM"
 */
export function formatTime(date: Date | string | null | undefined): string {
  if (!date) return "—"
  const d = typeof date === "string" ? parseISO(date) : date
  if (!isValid(d)) return "Invalid date"
  return format(d, "hh:mm a", { locale: enUS })
}

/**
 * Relative time → "3 hours ago", "in 2 days"
 */
export function formatRelativeTime(
  date: Date | string | null | undefined
): string {
  if (!date) return "—"
  const d = typeof date === "string" ? parseISO(date) : date
  if (!isValid(d)) return "Invalid date"
  return formatDistanceToNow(d, { addSuffix: true, locale: enUS })
}

/**
 * Format duration từ seconds → "1h 23m 45s"
 */
export function formatDurationFromSeconds(seconds: number): string {
  const duration = intervalToDuration({ start: 0, end: seconds * 1000 })
  return formatDuration(duration, {
    format: ["hours", "minutes", "seconds"],
    locale: enUS,
  })
}

/**
 * Format date → "YYYY-MM-DD" để gửi lên API
 */
export function toApiDate(date: Date | null | undefined): string {
  if (!date || !isValid(date)) return ""
  return format(date, "yyyy-MM-dd")
}

// ─── CURRENCY ────────────────────────────────────────────────────

/**
 * Format VND → "1.500.000 ₫"
 */
export function formatVND(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return "—"
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount)
}

/**
 * Format USD → "$1,500.00"
 */
export function formatUSD(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return "—"
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

/**
 * Format currency linh hoạt
 * formatCurrency(1500000, "VND") → "1.500.000 ₫"
 * formatCurrency(1500, "USD")    → "$1,500.00"
 */
export function formatCurrency(
  amount: number | null | undefined,
  currency: "VND" | "USD" = "USD"
): string {
  if (amount === null || amount === undefined) return "—"
  const locale = currency === "VND" ? "vi-VN" : "en-US"
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(amount)
}

/**
 * Compact number → "1.5M", "3.2K"
 */
export function formatCompactNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—"
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value)
}

export function buildQueryParams(params?: Record<string, any>): string {
  if (!params) return ""

  const parts: string[] = []

  Object.entries(params).forEach(([key, value]) => {
    if (
      value === undefined ||
      value === null ||
      value === "" ||
      value === false ||
      value === FILTER_ALL_VALUE ||
      Number.isNaN(value)
    )
      return

    if (Array.isArray(value)) {
      value.forEach((v) => {
        if (
          v !== undefined &&
          v !== null &&
          v !== "" &&
          v !== FILTER_ALL_VALUE
        ) {
          parts.push(`${key}=${v}`)
        }
      })
      return
    }

    parts.push(`${key}=${value}`)
  })

  return parts.join("&")
}

export const formatDateToApi = (
  date: Date | string | null | undefined,
  pattern: "dd/MM/yyyy" | "HH:mm dd/MM/yyyy" = "dd/MM/yyyy"
): string => {
  if (!date) return ""
  const d = typeof date === "string" ? parseISO(date) : date
  if (!isValid(d)) return ""
  return format(d, pattern)
}

/**
 * Format number → "1,500", "25,000", ...
 */
export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—"

  return new Intl.NumberFormat("en-US").format(value)
}

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=1200&auto=format&fit=crop"

export const getImageUrl = (path: string | null | undefined): string => {
  if (!path) return FALLBACK_IMAGE

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path
  }

  return `${process.env.NEXT_PUBLIC_API_BASE_URL}${path}`
}

export function getInitials(name: string | undefined | null): string {
  if (!name) return ""
  return name
    .split(" ")
    .slice(-2)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
}

/**
 * Parse a date string using a custom pattern (date-fns format tokens)
 * @param value  - The date string to parse
 * @param pattern - date-fns format pattern (e.g. "dd/MM/yyyy", "yyyy-MM-dd HH:mm")
 * @param referenceDate - Base date for parsing (defaults to now)
 * @returns Date object or null if invalid
 *
 * @example
 * parseDate("15/01/2025", "dd/MM/yyyy")          // → Date(2025-01-15)
 * parseDate("2025-01-15 08:30", "yyyy-MM-dd HH:mm") // → Date(2025-01-15T08:30)
 * parseDate("Jan 15, 2025", "MMM dd, yyyy")       // → Date(2025-01-15)
 */
export function parseDate(
  value: string | null | undefined,
  pattern: string,
  referenceDate: Date = new Date()
): Date | null {
  if (!value) return null

  const parsed = parse(value, pattern, referenceDate, { locale: enUS })

  return isValid(parsed) ? parsed : null
}

export const normalizeServices = (value: unknown): ServicePromotionInput[] => {
  if (!Array.isArray(value)) return []

  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null

      const service = item as Partial<ServicePromotionInput>

      if (typeof service.id !== "string" || typeof service.name !== "string")
        return null

      return {
        id: service.id,
        name: service.name,
        description:
          typeof service.description === "string" ? service.description : "",
      }
    })
    .filter((service): service is ServicePromotionInput => service !== null)
    .slice(0, 3)
}

export const fallbackPromotions = (
  services: ServicePromotionInput[]
): LandingServicePromotionResponse =>
  services.reduce<LandingServicePromotionResponse>((result, service) => {
    result[service.id] = service.description ? [service.description] : []
    return result
  }, {})

export const normalizePromotions = (
  value: unknown,
  services: ServicePromotionInput[]
): LandingServicePromotionResponse => {
  if (!value || typeof value !== "object" || Array.isArray(value))
    return fallbackPromotions(services)

  const rawPromotions = value as Record<string, unknown>

  return services.reduce<LandingServicePromotionResponse>((result, service) => {
    const features = rawPromotions[service.id]
    result[service.id] = Array.isArray(features)
      ? features
          .filter((feature): feature is string => typeof feature === "string")
          .slice(0, 3)
      : fallbackPromotions([service])[service.id]

    return result
  }, {})
}
