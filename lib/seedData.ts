export const fallbackServices = [
  {
    id: 1,
    name: "Deep Home Cleaning",
    description: "Detailed cleaning for kitchens, bathrooms, floors, and living areas.",
    price: 0,
    duration: 120,
    category: "OTHER",
    imageUrl: "",
  },
  {
    id: 2,
    name: "Office Sanitization",
    description: "Professional sanitization for desks, meeting rooms, and common areas.",
    price: 0,
    duration: 90,
    category: "OTHER",
    imageUrl: "",
  },
  {
    id: 3,
    name: "Furniture Dusting & Polishing",
    description: "Gentle furniture cleaning, polishing, and stain care for wooden and fabric pieces.",
    price: 0,
    duration: 60,
    category: "FURNITURE",
    imageUrl: "",
  },
  {
    id: 4,
    name: "Electronics Surface Care",
    description: "Safe cleaning for screens, keyboards, and electronic surfaces.",
    price: 0,
    duration: 45,
    category: "ELECTRONICS",
    imageUrl: "",
  },
] as const;

export function buildFallbackAvailability(month: string) {
  const [yearValue, monthValue] = month.split("-").map(Number);
  const year = Number.isFinite(yearValue) ? yearValue : new Date().getFullYear();
  const monthIndex = Number.isFinite(monthValue) ? monthValue : new Date().getMonth() + 1;
  const start = new Date(Date.UTC(year, monthIndex - 1, 1, 0, 0, 0));
  const end = new Date(Date.UTC(year, monthIndex, 1, 0, 0, 0));
  const availability = [] as Array<{ date: string; bookings: number; status: "available" | "limited" | "full" }>;
  const cursor = new Date(start);

  while (cursor < end) {
    availability.push({
      date: cursor.toISOString().slice(0, 10),
      bookings: 0,
      status: "available",
    });
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return availability;
}
