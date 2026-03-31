"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const brandOptions = [
  "Daikin",
  "Mitsubishi Electric",
  "Fujitsu",
  "Panasonic",
  "Midea",
  "Toshiba",
  "Samsung",
  "LG",
  "Other / Not sure",
];

const systemOptions = [
  "Single split",
  "Multi split",
  "Ducted",
  "VRF / VRV",
  "Not sure",
];

const indoorUnitOptions = [
  "Wall mounted",
  "Cassette",
  "Ducted grille",
  "Floor mounted",
  "Mixed",
  "Not sure",
];

const enquiryOptions = [
  "Routine service",
  "Deep clean",
  "Fault / not cooling properly",
  "Leak / water issue",
  "Bad smell",
  "Noise issue",
  "Not sure",
];

const lastServiceOptions = [
  "Within 6 months",
  "Within 12 months",
  "1+ years ago",
  "Never / not sure",
];

const timeframeOptions = [
  "ASAP",
  "Within 1 month",
  "Just researching",
];

function formatWhatsAppMessage(data) {
  return `Hi ProAir,

I’d like help with servicing / maintenance for my air conditioning system.

Name: ${data.fullName}
Phone: ${data.phone}
Email: ${data.email}
Postcode: ${data.postcode}

Number of indoor units: ${data.indoorUnits}
Outdoor units: ${data.outdoorUnits}
Brand: ${data.brand}
System type: ${data.systemType}
Indoor unit type: ${data.indoorUnitType}
Approx system age: ${data.systemAge || "Not specified"}
Last serviced: ${data.lastServiced}
Reason for enquiry: ${data.enquiryType}
Install timeframe: ${data.timeframe || "Not specified"}

Notes:
${data.notes || "None"}

Parking / access:
${data.accessNotes || "None"}

Please let me know the next available date and price.

Thank you.`;
}

export default function Page() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [postcode, setPostcode] = useState("");

  const [indoorUnits, setIndoorUnits] = useState("1");
  const [outdoorUnits, setOutdoorUnits] = useState("1");
  const [brand, setBrand] = useState("Daikin");
  const [systemType, setSystemType] = useState("Single split");
  const [indoorUnitType, setIndoorUnitType] = useState("Wall mounted");
  const [systemAge, setSystemAge] = useState("");
  const [lastServiced, setLastServiced] = useState("Within 12 months");
  const [enquiryType, setEnquiryType] = useState("Routine service");
  const [timeframe, setTimeframe] = useState("");
  const [notes, setNotes] = useState("");
  const [accessNotes, setAccessNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");

  const leadSentRef = useRef(false);

  const customerDetailsComplete =
    fullName.trim() &&
    phone.trim() &&
    email.trim() &&
    postcode.trim();

  const detailsComplete =
    fullName.trim() &&
    phone.trim() &&
    email.trim() &&
    postcode.trim();

  const servicePrice = useMemo(() => {
    const count = indoorUnits === "5+" ? 5 : Number(indoorUnits);
    const isDeep = enquiryType === "Deep clean";
    const isCassetteOrDucted =
      indoorUnitType === "Cassette" || indoorUnitType === "Ducted grille";

    let price = 0;

    if (!isDeep) {
      if (count === 1) price = 130;
      else if (count === 2) price = 230;
      else if (count === 3) price = 315;
      else if (count === 4) price = 400;
      else price = count * 95;
    } else {
      if (count === 1) price = 180;
      else if (count === 2) price = 340;
      else if (count === 3) price = 480;
      else if (count === 4) price = 600;
      else price = count * 145;
    }

    if (isCassetteOrDucted) {
      if (!isDeep) {
        price += count * 15;
      } else {
        price += count * 25;
      }
    }

    return price;
  }, [indoorUnits, indoorUnitType, enquiryType]);

  const serviceSummary = useMemo(() => {
    return {
      fullName,
      phone,
      email,
      postcode,
      indoorUnits,
      outdoorUnits,
      brand,
      systemType,
      indoorUnitType,
      systemAge,
      lastServiced,
      enquiryType,
      timeframe,
      notes,
      accessNotes,
    };
  }, [
    fullName,
    phone,
    email,
    postcode,
    indoorUnits,
    outdoorUnits,
    brand,
    systemType,
    indoorUnitType,
    systemAge,
    lastServiced,
    enquiryType,
    timeframe,
    notes,
    accessNotes,
  ]);

  const whatsappHref = `https://wa.me/447833679777?text=${encodeURIComponent(
    formatWhatsAppMessage(serviceSummary)
  )}`;

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setSubmitMessage("");

    try {
      const response = await fetch("/api/service-lead", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(serviceSummary),
      });

      if (!response.ok) {
        throw new Error("Failed to send");
      }

      setSubmitMessage("Thanks. Your service enquiry has been sent.");
    } catch (error) {
      console.error(error);
      setSubmitMessage("Something went wrong sending your enquiry.");
    } finally {
      setSubmitting(false);
    }
  }

  useEffect(() => {
    if (!customerDetailsComplete || leadSentRef.current) return;

    const sendLead = async () => {
      try {
        const response = await fetch("/api/service-lead", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(serviceSummary),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || "Service lead request failed");
        }

        leadSentRef.current = true;
        console.log("Service lead sent successfully");
      } catch (error) {
        console.error("Service lead send failed", error);
      }
    };

    sendLead();
  }, [customerDetailsComplete, serviceSummary]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#07153a",
        color: "white",
        padding: "24px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ maxWidth: "980px", margin: "0 auto" }}>
        <div style={{ marginBottom: "24px" }}>
          <h1 style={{ margin: 0, fontSize: "42px", fontWeight: 700 }}>
            <span style={{ color: "#666a73" }}>PRO</span>
            <span style={{ color: "#0b6f8f" }}>AIR</span>
          </h1>
          <p style={{ marginTop: "8px", fontSize: "20px", color: "#ffffff" }}>
            Air Conditioning Service Enquiry
          </p>
        </div>

        <div
          style={{
            background: "#f3f4f6",
            color: "#0b1b3a",
            borderRadius: "24px",
            padding: "26px",
          }}
        >
          <h2 style={{ fontSize: "32px", marginTop: 0 }}>Book a service</h2>
          <p style={{ color: "#475569", marginTop: 0 }}>
            Tell us about your system and we’ll come back with the right service
            recommendation and next available booking slot.
          </p>

          <form onSubmit={handleSubmit}>
            <div style={twoColGridStyle}>
              <div>
                <label>Full name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  style={inputStyle}
                  required
                />
              </div>
              <div>
                <label>Phone number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={inputStyle}
                  required
                />
              </div>
            </div>

            <div style={twoColGridStyle}>
              <div>
                <label>Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={inputStyle}
                  required
                />
              </div>
              <div>
                <label>Postcode</label>
                <input
                  type="text"
                  value={postcode}
                  onChange={(e) => setPostcode(e.target.value)}
                  style={inputStyle}
                  required
                />
              </div>
            </div>

            <div style={twoColGridStyle}>
              <div>
                <label>Number of indoor units</label>
                <select
                  value={indoorUnits}
                  onChange={(e) => setIndoorUnits(e.target.value)}
                  style={inputStyle}
                >
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5+">5+</option>
                </select>
              </div>
              <div>
                <label>Number of outdoor units</label>
                <select
                  value={outdoorUnits}
                  onChange={(e) => setOutdoorUnits(e.target.value)}
                  style={inputStyle}
                >
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3+">3+</option>
                  <option value="Not sure">Not sure</option>
                </select>
              </div>
            </div>

            <div style={twoColGridStyle}>
              <div>
                <label>Brand</label>
                <select
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  style={inputStyle}
                >
                  {brandOptions.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label>System type</label>
                <select
                  value={systemType}
                  onChange={(e) => setSystemType(e.target.value)}
                  style={inputStyle}
                >
                  {systemOptions.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={twoColGridStyle}>
              <div>
                <label>Indoor unit type</label>
                <select
                  value={indoorUnitType}
                  onChange={(e) => setIndoorUnitType(e.target.value)}
                  style={inputStyle}
                >
                  {indoorUnitOptions.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label>Approx system age</label>
                <input
                  type="text"
                  value={systemAge}
                  onChange={(e) => setSystemAge(e.target.value)}
                  placeholder="e.g. 5 years / not sure"
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={twoColGridStyle}>
              <div>
                <label>Last serviced</label>
                <select
                  value={lastServiced}
                  onChange={(e) => setLastServiced(e.target.value)}
                  style={inputStyle}
                >
                  {lastServiceOptions.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label>When are you looking to book?</label>
                <select
                  value={timeframe}
                  onChange={(e) => setTimeframe(e.target.value)}
                  style={inputStyle}
                >
                  <option value="">Select timeframe</option>
                  {timeframeOptions.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label>Reason for enquiry</label>
              <select
                value={enquiryType}
                onChange={(e) => setEnquiryType(e.target.value)}
                style={inputStyle}
              >
                {enquiryOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>Any faults / concerns / notes?</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. not cooling properly, bad smell, noisy fan, leaking water"
                style={textAreaStyle}
                rows={4}
              />
            </div>

            <div>
              <label>Parking / access notes</label>
              <textarea
                value={accessNotes}
                onChange={(e) => setAccessNotes(e.target.value)}
                placeholder="e.g. parking restrictions, loft access, high wall access, gate code"
                style={textAreaStyle}
                rows={3}
              />
            </div>

            <div
              style={{
                background: "#eef4ff",
                border: "1px solid #dbe6ff",
                borderRadius: "14px",
                padding: "16px",
                marginBottom: "18px",
              }}
            >
              <strong>Service summary</strong>
              <p style={{ margin: "10px 0 0 0", color: "#475569" }}>
                {indoorUnits} indoor unit(s) • {brand} • {systemType} •{" "}
                {indoorUnitType}
              </p>
              <p style={{ margin: "8px 0 0 0", color: "#475569" }}>
                Last serviced: {lastServiced}
                {timeframe ? ` • Timeframe: ${timeframe}` : ""}
              </p>
            </div>

            {customerDetailsComplete && (
              <>
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noreferrer"
                  style={waStyle}
                >
                  📲 Send this service enquiry to ProAir on WhatsApp
                </a>

                <p
                  style={{
                    fontSize: "12px",
                    color: "#64748b",
                    marginTop: "8px",
                  }}
                >
                  Most customers receive a reply during working hours within a
                  short time.
                </p>

                <div
                  style={{
                    marginTop: "12px",
                    marginBottom: "10px",
                    fontSize: "13px",
                    color: "#374151",
                  }}
                >
                  ✔ F-Gas certified engineers
                  <br />
                  ✔ Routine servicing, deep cleans and fault callouts
                  <br />
                  ✔ Domestic and small commercial systems
                </div>

                <div
                  style={{
                    background: "#eef4ff",
                    borderRadius: "12px",
                    padding: "16px",
                    marginTop: "20px",
                  }}
                >
                  <strong>Estimated service price</strong>

                  <p style={{ fontSize: "22px", marginTop: "6px" }}>
                    £{servicePrice.toLocaleString()} + VAT
                  </p>

                  <p style={{ fontSize: "13px", color: "#64748b" }}>
                    Estimated price based on the details provided. Final price
                    may vary depending on access, unit type, system condition
                    and location.
                  </p>
                </div>

                <button
                  type="submit"
                  style={buttonStyle}
                  disabled={!detailsComplete || submitting}
                >
                  {submitting ? "Sending..." : "Send service enquiry"}
                </button>
              </>
            )}

            {submitMessage && (
              <p
                style={{
                  marginTop: "12px",
                  marginBottom: 0,
                  fontWeight: 700,
                  color: submitMessage.includes("Thanks")
                    ? "#166534"
                    : "#b91c1c",
                }}
              >
                {submitMessage}
              </p>
            )}

            {!customerDetailsComplete && (
              <div
                style={{
                  marginTop: "28px",
                  padding: "18px",
                  borderRadius: "16px",
                  background: "linear-gradient(135deg,#eef4ff,#f8fafc)",
                  border: "1px solid #dbe6ff",
                  textAlign: "center",
                  boxShadow: "0 8px 18px rgba(30,58,138,0.12)",
                }}
              >
                <div style={{ fontSize: "22px", marginBottom: "6px" }}>
                  🔓 Unlock your service price
                </div>

                <p style={{ margin: "0", fontSize: "14px", color: "#475569" }}>
                  Enter your contact details at the top of the page to instantly
                  reveal your estimated service cost and send your enquiry to a
                  ProAir engineer.
                </p>

                <p
                  style={{
                    marginTop: "10px",
                    fontSize: "13px",
                    color: "#64748b",
                  }}
                >
                  ✔ Takes less than 30 seconds
                  <br />
                  ✔ No obligation quote
                  <br />
                  ✔ Local F-Gas certified engineers
                </p>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "14px",
  marginTop: "8px",
  marginBottom: "18px",
  borderRadius: "14px",
  border: "1px solid #c8ced8",
  boxSizing: "border-box",
  fontSize: "16px",
};

const textAreaStyle = {
  width: "100%",
  padding: "14px",
  marginTop: "8px",
  marginBottom: "18px",
  borderRadius: "14px",
  border: "1px solid #c8ced8",
  boxSizing: "border-box",
  fontSize: "16px",
  resize: "vertical",
  fontFamily: "Arial, sans-serif",
};

const buttonStyle = {
  width: "100%",
  background: "#0b2e73",
  color: "white",
  border: "none",
  borderRadius: "14px",
  padding: "14px 16px",
  fontSize: "16px",
  fontWeight: 700,
  cursor: "pointer",
  boxShadow: "0 8px 20px rgba(30,58,138,0.25)",
};

const waStyle = {
  display: "inline-block",
  marginTop: "8px",
  marginBottom: "8px",
  background: "#25D366",
  color: "white",
  textDecoration: "none",
  padding: "12px 18px",
  borderRadius: "12px",
  fontWeight: 700,
};

const twoColGridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "16px",
};
