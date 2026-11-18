// The studio's own clock, so the rules don't depend on where the server runs.
// Africa/Lagos is UTC+1 all year, with no daylight saving.
// Set STUDIO_TIMEZONE in .env to use a different time zone.
const DEFAULT_TIMEZONE = "Africa/Lagos";

function wallClock(timeZone) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23"
  }).formatToParts(new Date());

  const get = (type) => parts.find((part) => part.type === type).value;
  return {
    date: `${get("year")}-${get("month")}-${get("day")}`,
    minutes: Number(get("hour")) * 60 + Number(get("minute"))
  };
}

// Today's date (yyyy-mm-dd) and minutes since midnight, on the studio's clock
export function studioNow() {
  try {
    return wallClock(process.env.STUDIO_TIMEZONE || DEFAULT_TIMEZONE);
  } catch {
    // An unknown time zone name in .env: fall back to Lagos
    return wallClock(DEFAULT_TIMEZONE);
  }
}

function dayNumber(dateIso) {
  const [year, month, day] = dateIso.split("-").map(Number);
  return Math.round(Date.UTC(year, month - 1, day) / 86400000);
}

// True when a slot starting at dateIso + startMinutes is in the future by at
// least the minimum notice. A slot in the past, or starting this minute, never is.
export function isFarEnoughAhead(
  dateIso,
  startMinutes,
  minNoticeHours,
  now = studioNow()
) {
  const current = dayNumber(now.date) * 1440 + now.minutes;
  const slot = dayNumber(dateIso) * 1440 + startMinutes;
  const earliest = current + Math.max(0, Number(minNoticeHours) || 0) * 60;
  return slot >= earliest && slot > current;
}