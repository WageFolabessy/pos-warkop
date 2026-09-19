/**
 * Formats a number to Indonesian Rupiah (IDR) currency string.
 * Example: 15000 -> "Rp 15.000"
 */
export function formatIDR(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Formats a Date or timestamp string to Indonesian full date & time.
 * Example: "Sabtu, 19 September 2026 • 21:16:30 WIB"
 */
export function formatIndonesianDateTime(dateInput: Date | string = new Date()): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  };

  const datePart = new Intl.DateTimeFormat('id-ID', options).format(date);
  const timePart = date.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  return `${datePart} • ${timePart} WIB`;
}

/**
 * Formats a date for thermal receipt timestamp.
 * Example: "19/09/2026 21:16"
 */
export function formatReceiptTime(dateInput: Date | string = new Date()): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

/**
 * Generates a unique sequential/timestamped Order ID.
 * Example: "RK-20260919-8472"
 */
export function generateOrderId(): string {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const randNum = Math.floor(1000 + Math.random() * 9000);
  return `RK-${dateStr}-${randNum}`;
}

/**
 * Formats an ISO date string or Date to elapsed minutes/hours.
 * Example: "Baru saja", "4 mnt lalu", "1 jam lalu"
 */
export function formatElapsedTime(dateInput?: Date | string): string {
  if (!dateInput) return 'Baru saja';
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  const now = new Date();
  const diffMs = Math.max(0, now.getTime() - date.getTime());
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Baru saja';
  if (diffMins < 60) return `${diffMins} mnt lalu`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} jam lalu`;
  return '> 1 hari';
}
