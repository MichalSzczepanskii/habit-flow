export function getLogicalDate(): Date {
  const now = new Date();
  const hour = now.getHours();

  // If it's before 3 AM, treat it as "yesterday"
  if (hour < 3) {
    now.setDate(now.getDate() - 1);
  }

  return now;
}

export function formatLogicalDate(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function getLogicalDateString(): string {
  return formatLogicalDate(getLogicalDate());
}

export function formatDateForDisplay(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  }).format(date);
}

export function isYesterday(date: Date): boolean {
    const today = new Date(); // Real today
    const checkDate = new Date(date);

    // Reset times to compare dates only
    today.setHours(0,0,0,0);
    checkDate.setHours(0,0,0,0);
    
    // Create yesterday from today
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    return checkDate.getTime() === yesterday.getTime();
}

/**
 * Returns "Today" or "Yesterday" based on the logical date vs real calendar date logic
 * effectively. However, the requirement is "Today/Yesterday" based on the *Logical* date context.
 * If logical date is Jan 24 (because it's 2 AM Jan 25), display might just need to say "Yesterday" relative to *real* today?
 * Or just "Today" if we consider the "Logical Day" as "Today".
 * The plan says: "h1 for 'Today/Yesterday'". 
 * If it is 2 AM on Jan 25, the logical date is Jan 24.
 * Jan 24 is technically yesterday relative to the calendar date Jan 25.
 * So if logicalDate != calendarDate, maybe show "Yesterday"?
 * Wait, usually "Today" in these apps means "The active day".
 * If I'm up at 2 AM, I'm still completing "Today's" habits (which is physically yesterday).
 * Let's assume we label it based on standard expectations: 
 * If logical date == calendar date -> "Today"
 * If logical date == calendar date - 1 -> "Yesterday" (or maybe just "Late Night"?)
 * Let's stick to standard "Today" / "Yesterday" relative to wall clock if that helps, 
 * OR, more simply, if I am working on the logical date, that IS my "Today".
 * 
 * Update: Re-reading plan: "h1 for 'Today/Yesterday'".
 * Let's implement a helper that returns the label.
 */
export function getDateLabel(logicalDate: Date): string {
  const now = new Date();
  const isActuallyToday = logicalDate.getDate() === now.getDate() && 
                          logicalDate.getMonth() === now.getMonth() && 
                          logicalDate.getFullYear() === now.getFullYear();
  
  // If logical date is same as real date, it's "Today".
  if (isActuallyToday) {
    return "Today";
  }

  // If logical date is yesterday (e.g. it's 2 AM), we might still want to call it "Today" for the user's mental model?
  // Or "Yesterday"?
  // If it is 2 AM on Tuesday (logical Monday), usually users think "I'm finishing Monday".
  // So displaying "Monday" or "Yesterday" is appropriate.
  // Let's check if it is exactly 1 day before.
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const isActuallyYesterday = logicalDate.getDate() === yesterday.getDate() &&
                              logicalDate.getMonth() === yesterday.getMonth() &&
                              logicalDate.getFullYear() === yesterday.getFullYear();

  if (isActuallyYesterday) {
    return "Yesterday";
  }

  return formatDateForDisplay(logicalDate);
}
