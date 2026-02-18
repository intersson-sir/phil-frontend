import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Manager } from "@/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Resolve manager (object or id/name string) to display name; optional managers list for fallback */
export function getManagerDisplayName(
  manager: Manager | string | null | undefined,
  managers?: Manager[]
): string {
  if (manager == null) return "—"
  if (typeof manager === "object" && "name" in manager) return (manager as Manager).name
  const str = String(manager)
  if (!str) return "—"
  const m = managers?.find((x) => x.id === str || x.name === str)
  return m ? m.name : str
}
