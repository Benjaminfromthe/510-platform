import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const adminEmail = process.env.ADMIN_EMAIL || "benjamin@510cleaning.com";

function formatDate(value: Date | string) {
  return new Date(value).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(value: Date | string) {
  return new Date(value).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export async function sendBookingNotificationToAdmin(booking: {
  id: number;
  customerName?: string | null;
  email?: string | null;
  phone?: string | null;
  serviceId: number;
  scheduledDate: Date | string;
  scheduledTime: Date | string;
  address: string;
  quoteDescription?: string | null;
  urgency?: string | null;
  propertySize?: string | null;
}) {
  try {
    const serviceName = `Service ${booking.serviceId}`;

    const response = await resend.emails.send({
      from: "510 Platform <onboarding@resend.dev>",
      to: [adminEmail],
      subject: "New Booking Request - 510 Platform",
      html: `
        <h2>New Booking Request - 510 Platform</h2>
        <p><strong>Booking ID:</strong> ${booking.id}</p>
        <p><strong>Customer:</strong> ${booking.customerName || "Unknown"}</p>
        <p><strong>Email:</strong> ${booking.email || "N/A"}</p>
        <p><strong>Phone:</strong> ${booking.phone || "N/A"}</p>
        <p><strong>Service:</strong> ${serviceName}</p>
        <p><strong>Date:</strong> ${formatDate(booking.scheduledDate)}</p>
        <p><strong>Time:</strong> ${formatTime(booking.scheduledTime)}</p>
        <p><strong>Address:</strong> ${booking.address}</p>
        <p><strong>Property Size:</strong> ${booking.propertySize || "N/A"}</p>
        <p><strong>Urgency:</strong> ${booking.urgency || "N/A"}</p>
        <p><strong>Description:</strong> ${booking.quoteDescription || "No description provided."}</p>
      `,
    });

    return response;
  } catch (error) {
    console.error("Error sending admin email:", error);
    // Never throw — email failure must not crash the booking
  }
}

export async function sendBookingConfirmationToCustomer(
  booking: {
    id: number;
    customerName?: string | null;
    serviceId: number;
    scheduledDate: Date | string;
    scheduledTime: Date | string;
    address: string;
    quoteDescription?: string | null;
    urgency?: string | null;
    propertySize?: string | null;
  },
  email: string,
) {
  try {
    const serviceName = `Service ${booking.serviceId}`;

    const response = await resend.emails.send({
      from: "510 Platform <onboarding@resend.dev>",
      to: [email],
      subject: "Your 510 Booking Request Received",
      html: `
        <h2>Thank you for your booking request</h2>
        <p>Hi ${booking.customerName || "there"},</p>
        <p>We have received your booking request for <strong>${serviceName}</strong>.</p>
        <p><strong>Date:</strong> ${formatDate(booking.scheduledDate)}</p>
        <p><strong>Time:</strong> ${formatTime(booking.scheduledTime)}</p>
        <p><strong>Address:</strong> ${booking.address}</p>
        <p><strong>Property Size:</strong> ${booking.propertySize || "N/A"}</p>
        <p><strong>Urgency:</strong> ${booking.urgency || "N/A"}</p>
        <p><strong>Description:</strong> ${booking.quoteDescription || "No description provided."}</p>
        <p>We will contact you within 2 hours to confirm and discuss pricing.</p>
      `,
    });

    return response;
  } catch (error) {
    console.error("Error sending customer email:", error);
    // Never throw — email failure must not crash the booking
  }
}
