import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
  try {
    const data = await req.json();

    const email = await resend.emails.send({
      from: "ProAir Service <onboarding@resend.dev>",
      to: ["contact@proairuk.co.uk"],

      subject: "New ProAir Service Enquiry",

      html: `
  <h2>New Service Enquiry</h2>

  <h3>Customer Details</h3>
  <p><strong>Name:</strong> ${data.fullName}</p>
  <p><strong>Phone:</strong> ${data.phone}</p>
  <p><strong>Email:</strong> ${data.email}</p>
  <p><strong>Postcode:</strong> ${data.postcode}</p>
  <p><strong>Preferred timeframe:</strong> ${data.timeframe || "Not specified"}</p>

  <h3>System Information</h3>
  <p><strong>Brand:</strong> ${data.brand}</p>
  <p><strong>System type:</strong> ${data.systemType}</p>
  <p><strong>Indoor unit type:</strong> ${data.indoorUnitType}</p>
  <p><strong>Indoor units:</strong> ${data.indoorUnits}</p>
  <p><strong>Outdoor units:</strong> ${data.outdoorUnits}</p>

  <h3>Service Details</h3>
  <p><strong>Service type:</strong> ${data.serviceType}</p>
  <p><strong>Units to service:</strong> ${data.unitCount}</p>
  <p><strong>Last serviced:</strong> ${data.lastServiced}</p>
  <p><strong>System age:</strong> ${data.systemAge || "Unknown"}</p>

  <h3>Estimated Price</h3>
  <p><strong>Guide price:</strong> £${Number(data.servicePrice || 0).toLocaleString()} + VAT</p>

  <h3>Customer Notes</h3>
  <p>${data.notes ? data.notes : "No additional notes provided"}</p>
`
    });

    return Response.json({ success: true, email });

  } catch (error) {
    console.error("Email send failed:", error);
    return Response.json({ success: false, error });
  }
}
