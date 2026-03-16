import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
  try {
    const data = await req.json();

    const email = await resend.emails.send({
      from: "ProAir Service <onboarding@resend.dev>",
      to: ["contact@proairuk.co.uk"],
      subject: `New Service Enquiry - ${data.postcode}`,
      html: `
        <h2>New Service Enquiry</h2>

        <p><strong>Name:</strong> ${data.fullName}</p>
        <p><strong>Phone:</strong> ${data.phone}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Postcode:</strong> ${data.postcode}</p>

        <h3>System Details</h3>
        <p><strong>Indoor Units:</strong> ${data.indoorUnits}</p>
        <p><strong>Outdoor Units:</strong> ${data.outdoorUnits}</p>
        <p><strong>Brand:</strong> ${data.brand}</p>
        <p><strong>System Type:</strong> ${data.systemType}</p>
        <p><strong>Indoor Unit Type:</strong> ${data.indoorUnitType}</p>
        <p><strong>Last Serviced:</strong> ${data.lastServiced}</p>

        <h3>Notes</h3>
        <p>${data.notes || "None"}</p>

        <h3>Access</h3>
        <p>${data.accessNotes || "None"}</p>
      `,
    });

    return Response.json({ success: true });

  } catch (error) {
    console.error(error);
    return Response.json({ success: false });
  }
}
