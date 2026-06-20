import { Resend } from "resend";
import { prisma } from "./prisma";

const resend = new Resend(process.env.RESEND_API_KEY);

const adminEmail = process.env.ADMIN_EMAIL || "benjaminnshimiye633@gmail.com";

// Look up service name from DB — falls back to "Service {id}" if not found
async function getServiceName(serviceId: number): Promise<string> {
  try {
    const service = await prisma.service.findUnique({ where: { id: serviceId }, select: { name: true } });
    return service?.name ?? `Service ${serviceId}`;
  } catch {
    return `Service ${serviceId}`;
  }
}

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
    const serviceName = await getServiceName(booking.serviceId);

    await resend.emails.send({
      from: "510 Cleaning <onboarding@resend.dev>",
      to: [adminEmail],
      subject: `New Booking Request #${booking.id} — ${serviceName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0891b2;">New Booking Request — 510 Cleaning</h2>
          <table style="width:100%; border-collapse: collapse;">
            <tr><td style="padding:8px; font-weight:bold; color:#475569;">Booking ID</td><td style="padding:8px;">#${booking.id}</td></tr>
            <tr style="background:#f8fafc;"><td style="padding:8px; font-weight:bold; color:#475569;">Customer</td><td style="padding:8px;">${booking.customerName || "Unknown"}</td></tr>
            <tr><td style="padding:8px; font-weight:bold; color:#475569;">Email</td><td style="padding:8px;">${booking.email || "N/A"}</td></tr>
            <tr style="background:#f8fafc;"><td style="padding:8px; font-weight:bold; color:#475569;">Phone</td><td style="padding:8px;">${booking.phone || "N/A"}</td></tr>
            <tr><td style="padding:8px; font-weight:bold; color:#475569;">Service</td><td style="padding:8px;">${serviceName}</td></tr>
            <tr style="background:#f8fafc;"><td style="padding:8px; font-weight:bold; color:#475569;">Date</td><td style="padding:8px;">${formatDate(booking.scheduledDate)}</td></tr>
            <tr><td style="padding:8px; font-weight:bold; color:#475569;">Time</td><td style="padding:8px;">${formatTime(booking.scheduledTime)}</td></tr>
            <tr style="background:#f8fafc;"><td style="padding:8px; font-weight:bold; color:#475569;">Address</td><td style="padding:8px;">${booking.address}</td></tr>
            <tr><td style="padding:8px; font-weight:bold; color:#475569;">Items to Clean</td><td style="padding:8px;">${booking.propertySize || "Not specified"}</td></tr>
            <tr style="background:#f8fafc;"><td style="padding:8px; font-weight:bold; color:#475569;">Description</td><td style="padding:8px;">${booking.quoteDescription || "No description provided."}</td></tr>
          </table>
          <p style="margin-top:16px; color:#0891b2; font-weight:bold;">Contact the customer within 2 hours.</p>
        </div>
      `,
    });
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
    const serviceName = await getServiceName(booking.serviceId);

    await resend.emails.send({
      from: "510 Cleaning <onboarding@resend.dev>",
      to: [email],
      subject: `Your Request Received — ${serviceName} | 510 Cleaning`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0891b2;">Request Received — 510 Cleaning Services</h2>
          <p>Hi <strong>${booking.customerName || "there"}</strong>,</p>
          <p>We have received your cleaning request. Our team will review it and contact you within <strong>2 hours</strong>.</p>
          <table style="width:100%; border-collapse: collapse; margin-top:16px;">
            <tr style="background:#f8fafc;"><td style="padding:8px; font-weight:bold; color:#475569;">Booking Reference</td><td style="padding:8px; font-weight:bold;">#${booking.id}</td></tr>
            <tr><td style="padding:8px; font-weight:bold; color:#475569;">Service</td><td style="padding:8px;">${serviceName}</td></tr>
            <tr style="background:#f8fafc;"><td style="padding:8px; font-weight:bold; color:#475569;">Date</td><td style="padding:8px;">${formatDate(booking.scheduledDate)}</td></tr>
            <tr><td style="padding:8px; font-weight:bold; color:#475569;">Time</td><td style="padding:8px;">${formatTime(booking.scheduledTime)}</td></tr>
            <tr style="background:#f8fafc;"><td style="padding:8px; font-weight:bold; color:#475569;">Address</td><td style="padding:8px;">${booking.address}</td></tr>
            ${booking.propertySize ? `<tr><td style="padding:8px; font-weight:bold; color:#475569;">Items to Clean</td><td style="padding:8px;">${booking.propertySize}</td></tr>` : ""}
          </table>
          <p style="margin-top:20px;">Questions? Chat with us on WhatsApp: <a href="https://wa.me/250787769046" style="color:#0891b2;">+250 787 769 046</a></p>
          <p style="color:#94a3b8; font-size:12px; margin-top:24px;">© 2026 510 Cleaning Services, Kigali Rwanda</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Error sending customer email:", error);
    // Never throw — email failure must not crash the booking
  }
}
