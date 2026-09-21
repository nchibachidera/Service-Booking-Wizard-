export const manifest = {
  screens: {
    scr_8ah2vt: { name: "Choose a service", route: "/", state: { "step": "service" }, position: { "x": 160, "y": 220 } },
    scr_a4p9qe: { name: "Pick a time", route: "/", state: { "step": "time", "serviceId": "cut-finish" }, position: { "x": 1560, "y": 220 } },
    scr_2ifeqo: { name: "Confirm details", route: "/", state: { "step": "confirm", "serviceId": "cut-finish", "time": "14:00", "name": "Amara Whitfield", "phone": "(415) 555 0142" }, position: { "x": 2960, "y": 220 } },
    scr_9aygva: { name: "Booking confirmed", route: "/", state: { "step": "success", "serviceId": "cut-finish", "time": "14:00", "name": "Amara Whitfield", "phone": "(415) 555 0142" }, position: { "x": 4360, "y": 220 } },
    scr_h1o0wo: { name: "Provider login", route: "/admin/login", position: { "x": 160, "y": 2200 } },
    scr_9i7ogh: { name: "Bookings overview", route: "/admin/bookings", state: { "signedIn": true }, position: { "x": 1560, "y": 2200 } },
    scr_h6pq4r: { name: "Availability", route: "/admin/availability", state: { "signedIn": true }, position: { "x": 2960, "y": 2200 } },
    scr_dzbvm9: { name: "Settings", route: "/admin/settings", state: { "signedIn": true }, position: { "x": 4360, "y": 2200 } }
  },
  sections: {
    sec_ut5ojy: { name: "Customer Booking Flow", x: 0, y: 0, width: 5720, height: 1180 },
    sec_jfkky0: { name: "Provider Dashboard", x: 0, y: 1980, width: 5720, height: 1180 }
  },
  layers: [
  { kind: "section", id: "sec_ut5ojy", children: [
    { kind: "screen", id: "scr_8ah2vt" },
    { kind: "screen", id: "scr_a4p9qe" },
    { kind: "screen", id: "scr_2ifeqo" },
    { kind: "screen", id: "scr_9aygva" }]
  },
  { kind: "section", id: "sec_jfkky0", children: [
    { kind: "screen", id: "scr_h1o0wo" },
    { kind: "screen", id: "scr_9i7ogh" },
    { kind: "screen", id: "scr_h6pq4r" },
    { kind: "screen", id: "scr_dzbvm9" }]
  }]

};