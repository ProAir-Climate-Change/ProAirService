import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
  try {
    const data = await req.json();

    const email = await resend.emails.send({
      from: "ProAir Service <onboarding@resend.dev>",
      to: ["contact@proairuk.co.uk"],
      subject: `New Service Enquiry - ${data.postcode || "No postcode"} - ${data.brand || "Unknown brand"}`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #0b1b3a; line-height: 1.5;">
          <h2 style="margin-bottom: 8px;">New ProAir Service Enquiry</h2>
          <p style="margin-top: 0; color: #475569;">
            A new service enquiry has been submitted from the ProAir service tool.
          </p>

          <h3 style="margin-bottom: 8px;">Customer Details</h3>
          <p><strong>Full name:</strong> ${data.fullName || "Not provided"}</p>
          <p><strong>Phone:</strong> ${data.phone || "Not provided"}</p>
          <p><strong>Email:</strong> ${data.email || "Not provided"}</p>
          <p><strong>Postcode:</strong> ${data.postcode || "Not provided"}</p>
          <p><strong>Preferred timeframe:</strong> ${data.timeframe || "Not specified"}</p>

          <h3 style="margin-bottom: 8px;">System Details</h3>
          <p><strong>Number of indoor units:</strong> ${data.indoorUnits || "Not provided"}</p>
          <p><strong>Number of outdoor units:</strong> ${data.outdoorUnits || "Not provided"}</p>
          <p><strong>Brand:</strong> ${data.brand || "Not provided"}</p>
          <p><strong>System type:</strong> ${data.systemType || "Not provided"}</p>
          <p><strong>Indoor unit type:</strong> ${data.indoorUnitType || "Not provided"}</p>
          <p><strong>Approx system age:</strong> ${data.systemAge || "Not specified"}</p>
          <p><strong>Last serviced:</strong> ${data.lastServiced || "Not specified"}</p>

          <h3 style="margin-bottom: 8px;">Enquiry Type</h3>
          <p><strong>Reason for enquiry:</strong> ${data.enquiryType || "Not provided"}</p>

          <h3 style="margin-bottom: 8px;">Estimated Price</h3>
          <p><strong>Estimated service price:</strong> ${
            typeof data.servicePrice !== "undefined" && data.servicePrice !== null
              ? `£${Number(data.servicePrice).toLocaleString()} + VAT`
              : "Not provided"
          }</p>

          <h3 style="margin-bottom: 8px;">Fault / Service Notes</h3>
          <p>${data.notes ? data.notes.replace(/\n/g, "<br/>") : "No additional notes provided"}</p>

          <h3 style="margin-bottom: 8px;">Parking / Access Notes</h3>
          <p>${data.accessNotes ? data.accessNotes.replace(/\n/g, "<br/>") : "No access notes provided"}</p>
        </div>
      `,
    });

    console.log("Service enquiry email sent:", email);

    return Response.json({
      success: true,
      email,
    });
  } catch (error) {
    console.error("Service enquiry email failed:", error);

    return Response.json(
      {
        success: false,
        error: String(error),
      },
      { status: 500 }
    );
