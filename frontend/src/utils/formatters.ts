/**
 * Formatters
 * Data formatting utilities
 */

/**
 * Format number with thousands separator
 */
export function formatNumber(num: number, decimals: number = 0): string {
  return num.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Format currency
 */
export function formatCurrency(num: number, currency: string = 'USD'): string {
  return num.toLocaleString('en-US', {
    style: 'currency',
    currency,
  });
}

/**
 * Format percentage
 */
export function formatPercentage(num: number, decimals: number = 1): string {
  return `${(num * 100).toFixed(decimals)}%`;
}

/**
 * Format date
 */
export function formatDate(date: string | Date, format: 'short' | 'long' | 'time' = 'short'): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  switch (format) {
    case 'short':
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    case 'long':
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    case 'time':
      return d.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    default:
      return d.toLocaleDateString();
  }
}

/**
 * Format datetime
 */
export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return `${formatDate(d, 'short')} ${formatDate(d, 'time')}`;
}

/**
 * Format risk score
 */
export function formatRiskScore(score: number): string {
  return `${(score * 100).toFixed(0)}%`;
}

/**
 * Get risk level from score
 */
export function getRiskLevel(score: number): 'Low' | 'Medium' | 'High' | 'Critical' {
  if (score < 0.25) return 'Low';
  if (score < 0.5) return 'Medium';
  if (score < 0.75) return 'High';
  return 'Critical';
}

/**
 * Get risk color
 */
export function getRiskColor(score: number): string {
  if (score < 0.25) return '#10B981'; // green
  if (score < 0.5) return '#F59E0B'; // orange
  if (score < 0.75) return '#EF4444'; // red
  return '#7F1D1D'; // dark red
}

/**
 * Format duration
 */
export function formatDuration(days: number): string {
  if (days === 1) return '1 day';
  if (days === 0) return '0 days';
  return `${days} days`;
}

/**
 * Format coordinate
 */
export function formatCoordinate(lat: number, lon: number, precision: number = 4): string {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lonDir = lon >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(precision)}°${latDir}, ${Math.abs(lon).toFixed(precision)}°${lonDir}`;
}

/**
 * Truncate text
 */
export function truncateText(text: string, maxLength: number = 50): string {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength - 3)}...`;
}

/**
 * Format JSON for display
 */
export function formatJson(obj: any, indent: number = 2): string {
  return JSON.stringify(obj, null, indent);
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

/**
 * Format boolean
 */
export function formatBoolean(value: boolean): string {
  return value ? 'Yes' : 'No';
}

/**
 * Format array as comma-separated list
 */
export function formatArray(arr: any[], maxLength: number = 5): string {
  const display = arr.slice(0, maxLength);
  let result = display.map(String).join(', ');
  if (arr.length > maxLength) {
    result += ` (+${arr.length - maxLength} more)`;
  }
  return result;
}

/**
 * Format null/undefined
 */
export function formatNullish(value: any): string {
  if (value === null || value === undefined) {
    return 'N/A';
  }
  return String(value);
}

/**
 * Format duration from timestamp
 */
export function formatTimeAgo(timestamp: string | Date): string {
  const now = new Date();
  const then = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  const diffMs = now.getTime() - then.getTime();

  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return formatDate(then, 'short');
}

/**
 * Format capability type
 */
export function formatCapabilityType(type: string): string {
  switch (type) {
    case 'LogicFunction':
      return 'Logic Function';
    case 'PredictModel':
      return 'Predictive Model';
    default:
      return type;
  }
}

/**
 * Format order priority
 */
export function formatPriority(priority: string): string {
  switch (priority) {
    case 'Critical':
      return '🔴 Critical';
    case 'High':
      return '🟠 High';
    case 'Standard':
      return '🔵 Standard';
    default:
      return priority;
  }
}

/**
 * Format status with emoji
 */
export function formatStatus(status: string): string {
  switch (status) {
    case 'Active':
      return '✅ Active';
    case 'Down':
      return '❌ Down';
    case 'Critical':
      return '⚠️ Critical';
    case 'Pending':
      return '⏳ Pending';
    case 'Allocated':
      return '📦 Allocated';
    case 'InTransit':
      return '🚚 In Transit';
    case 'Delivered':
      return '✅ Delivered';
    case 'Cancelled':
      return '🚫 Cancelled';
    case 'Split':
      return '🔀 Split';
    default:
      return status;
  }
}
