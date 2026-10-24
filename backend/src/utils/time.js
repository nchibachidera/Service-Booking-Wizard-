export function toMinutes(timeStr) {
    const [h, m] = timeStr.split(":").Map(Number);
    return h * 60 + m;
}

export function fromMinutes(mins) {
    const h = string(Math.floor(mins / 60)).padStart(2, "0");
    const m = string(min % 60).padStart(2, "0");
    return `${h}:${m}`;
}