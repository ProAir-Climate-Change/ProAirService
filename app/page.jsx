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

  const unitCount = indoorUnits === "5+" ? 5 : Number(indoorUnits);

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
      price += count * (isDeep ? 25 : 15);
    }

    return price;
  }, [indoorUnits, indoorUnitType, enquiryType]);

  const pricingBreakdown = useMemo(() => {
    const isDeep = enquiryType === "Deep clean";
    const isCassetteOrDucted =
      indoorUnitType === "Cassette" || indoorUnitType === "Ducted grille";

    const firstUnitPrice = isDeep ? 180 : 130;
    const total = servicePrice;
    const undiscountedBase = firstUnitPrice * unitCount;

    let upliftPerUnit = 0;
    if (isCassetteOrDucted) {
      upliftPerUnit = isDeep ? 25 : 15;
    }

    const undiscountedTotal = undiscountedBase + upliftPerUnit * unitCount;
    const savings = Math.max(0, undiscountedTotal - total);

    return {
      firstUnitPrice,
      total,
      savings,
      hasDiscount: unitCount > 1 && savings > 0,
      isDeep,
      isCassetteOrDucted,
    };
  }, [enquiryType, indoorUnitType, servicePrice, unitCount]);

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
    <div style={pageStyle}>
      <div style={backgroundGlowOne} />
      <div style={backgroundGlowTwo} />

      <div style={containerStyle}>
        <div style={heroStyle}>
          <div style={brandBadgeStyle}>PROAIR</div>

          <h1 style={heroTitleStyle}>Air Conditioning Service Enquiry</h1>

          <p style={heroTextStyle}>
            Get an instant estimated service price for your system and send your
            enquiry directly to ProAir.
          </p>

          <div style={heroPillRowStyle}>
            <div style={heroPillStyle}>F-Gas certified</div>
            <div style={heroPillStyle}>Domestic & commercial</div>
            <div style={heroPillStyle}>Fast response</div>
          </div>
        </div>

        <div style={cardStyle}>
          <div style={sectionIntroStyle}>
            <h2 style={cardTitleStyle}>Book a service</h2>
            <p style={cardSubtitleStyle}>
              Tell us about your system and we’ll recommend the right service
              level and next available booking slot.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={sectionTitleStyle}>Your details</div>

            <div style={responsiveGridStyle}>
              <div>
                <label style={labelStyle}>Full name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  style={inputStyle}
                  required
                />
              </div>
              <div>
                <label style={labelStyle}>Phone number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={inputStyle}
                  required
                />
              </div>
            </div>

            <div style={responsiveGridStyle}>
              <div>
                <label style={labelStyle}>Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={inputStyle}
                  required
                />
              </div>
              <div>
                <label style={labelStyle}>Postcode</label>
                <input
                  type="text"
                  value={postcode}
                  onChange={(e) => setPostcode(e.target.value)}
                  style={inputStyle}
                  required
                />
              </div>
            </div>

            <div style={sectionTitleStyle}>System details</div>

            <div style={responsiveGridStyle}>
              <div>
                <label style={labelStyle}>Number of units to service</label>
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
                <label style={labelStyle}>Number of outdoor units</label>
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

            <div style={responsiveGridStyle}>
              <div>
                <label style={labelStyle}>Brand</label>
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
                <label style={labelStyle}>System type</label>
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

            <div style={responsiveGridStyle}>
              <div>
                <label style={labelStyle}>Indoor unit type</label>
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
                <label style={labelStyle}>Approx system age</label>
                <input
                  type="text"
                  value={systemAge}
                  onChange={(e) => setSystemAge(e.target.value)}
                  placeholder="e.g. 5 years / not sure"
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={responsiveGridStyle}>
              <div>
                <label style={labelStyle}>Last serviced</label>
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
                <label style={labelStyle}>When are you looking to book?</label>
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
              <label style={labelStyle}>Reason for enquiry</label>
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
              <label style={labelStyle}>Any faults / concerns / notes?</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. not cooling properly, bad smell, noisy fan, leaking water"
                style={textAreaStyle}
                rows={4}
              />
            </div>

            <div>
              <label style={labelStyle}>Parking / access notes</label>
              <textarea
                value={accessNotes}
                onChange={(e) => setAccessNotes(e.target.value)}
                placeholder="e.g. parking restrictions, loft access, high wall access, gate code"
                style={textAreaStyle}
                rows={3}
              />
            </div>

            <div style={summaryCardStyle}>
              <div style={summaryHeaderStyle}>
                <strong>Service summary</strong>
                <span style={summaryTagStyle}>Live</span>
              </div>

              <p style={summaryTextStyle}>
                {indoorUnits} unit(s) • {brand} • {systemType} •{" "}
                {indoorUnitType}
              </p>

              <p style={summaryTextStyle}>
                Last serviced: {lastServiced}
                {timeframe ? ` • Timeframe: ${timeframe}` : ""}
              </p>
            </div>

            {customerDetailsComplete ? (
              <>
                <div style={actionRowStyle}>
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noreferrer"
                    style={waStyle}
                  >
                    📲 Send on WhatsApp
                  </a>
                </div>

                <p style={helperTextStyle}>
                  Most customers receive a reply during working hours within a
                  short time.
                </p>

                <div style={benefitsCardStyle}>
                  <div style={benefitItemStyle}>✔ F-Gas certified engineers</div>
                  <div style={benefitItemStyle}>
                    ✔ Routine servicing, deep cleans and fault callouts
                  </div>
                  <div style={benefitItemStyle}>
                    ✔ Domestic and small commercial systems
                  </div>
                </div>

                <div style={priceCardStyle}>
                  <div style={priceTopRowStyle}>
                    <div>
                      <div style={priceLabelStyle}>Estimated service price</div>
                      <div style={priceValueStyle}>
                        £{pricingBreakdown.total.toLocaleString()} + VAT
                      </div>
                    </div>

                    {pricingBreakdown.hasDiscount && (
                      <div style={discountBadgeStyle}>Discount applied</div>
                    )}
                  </div>

                  <p style={priceMetaStyle}>
                    First unit from £{pricingBreakdown.firstUnitPrice} + VAT
                  </p>

                  {pricingBreakdown.hasDiscount && (
                    <p style={savingTextStyle}>
                      Multi-unit discount applied — saving £
                      {pricingBreakdown.savings.toLocaleString()} + VAT
                    </p>
                  )}

                  {pricingBreakdown.isCassetteOrDucted && (
                    <p style={upliftTextStyle}>
                      Includes uplift for cassette / ducted style units.
                    </p>
                  )}

                  <p style={priceNoteStyle}>
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
            ) : (
              <div style={unlockCardStyle}>
                <div style={unlockTitleStyle}>🔓 Unlock your service price</div>
                <p style={unlockTextStyle}>
                  Enter your contact details at the top of the page to instantly
                  reveal your estimated service cost and send your enquiry to a
                  ProAir engineer.
                </p>
                <div style={unlockBulletsStyle}>
                  ✔ Takes less than 30 seconds
                  <br />
                  ✔ No obligation quote
                  <br />
                  ✔ Local F-Gas certified engineers
                </div>
              </div>
            )}

            {submitMessage && (
              <p
                style={{
                  ...submitMessageStyle,
                  color: submitMessage.includes("Thanks")
                    ? "#166534"
                    : "#b91c1c",
                }}
              >
                {submitMessage}
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

const pageStyle = {
  minHeight: "100vh",
  background:
    "radial-gradient(circle at top left, rgba(11,111,143,0.22), transparent 35%), linear-gradient(180deg, #06122e 0%, #081733 100%)",
  color: "white",
  padding: "32px 18px",
  fontFamily:
    'Inter, Arial, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  position: "relative",
  overflow: "hidden",
};

const backgroundGlowOne = {
  position: "absolute",
  top: "-120px",
  left: "-80px",
  width: "320px",
  height: "320px",
  borderRadius: "999px",
  background: "rgba(11, 111, 143, 0.16)",
  filter: "blur(60px)",
  pointerEvents: "none",
};

const backgroundGlowTwo = {
  position: "absolute",
  bottom: "-120px",
  right: "-80px",
  width: "360px",
  height: "360px",
  borderRadius: "999px",
  background: "rgba(37, 211, 102, 0.10)",
  filter: "blur(70px)",
  pointerEvents: "none",
};

const containerStyle = {
  maxWidth: "1080px",
  margin: "0 auto",
  position: "relative",
  zIndex: 1,
};

const heroStyle = {
  marginBottom: "22px",
};

const brandBadgeStyle = {
  display: "inline-block",
  padding: "8px 14px",
  borderRadius: "999px",
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.14)",
  fontSize: "12px",
  fontWeight: 700,
  letterSpacing: "0.12em",
  marginBottom: "14px",
};

const heroTitleStyle = {
  margin: 0,
  fontSize: "clamp(32px, 5vw, 54px)",
  lineHeight: 1.04,
  fontWeight: 800,
  letterSpacing: "-0.03em",
};

const heroTextStyle = {
  marginTop: "14px",
  marginBottom: "18px",
  maxWidth: "760px",
  color: "rgba(255,255,255,0.78)",
  fontSize: "16px",
  lineHeight: 1.6,
};

const heroPillRowStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: "10px",
};

const heroPillStyle = {
  padding: "10px 14px",
  borderRadius: "999px",
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.10)",
  color: "rgba(255,255,255,0.88)",
  fontSize: "13px",
  fontWeight: 600,
};

const cardStyle = {
  background: "rgba(243, 244, 246, 0.98)",
  color: "#0b1b3a",
  borderRadius: "28px",
  padding: "26px",
  boxShadow: "0 24px 60px rgba(2, 6, 23, 0.35)",
  border: "1px solid rgba(255,255,255,0.08)",
};

const sectionIntroStyle = {
  marginBottom: "20px",
};

const cardTitleStyle = {
  fontSize: "32px",
  marginTop: 0,
  marginBottom: "8px",
  lineHeight: 1.1,
};

const cardSubtitleStyle = {
  color: "#475569",
  marginTop: 0,
  marginBottom: 0,
  lineHeight: 1.55,
};

const sectionTitleStyle = {
  fontSize: "13px",
  fontWeight: 800,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: "#0b2e73",
  marginTop: "24px",
  marginBottom: "12px",
};

const responsiveGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: "16px",
};

const labelStyle = {
  display: "block",
  fontSize: "14px",
  fontWeight: 700,
  color: "#0f172a",
  marginBottom: "8px",
};

const inputStyle = {
  width: "100%",
  padding: "14px 15px",
  marginBottom: "18px",
  borderRadius: "16px",
  border: "1px solid #d4dbe6",
  boxSizing: "border-box",
  fontSize: "16px",
  background: "#ffffff",
  outline: "none",
  boxShadow: "inset 0 1px 2px rgba(15,23,42,0.03)",
};

const textAreaStyle = {
  width: "100%",
  padding: "14px 15px",
  marginBottom: "18px",
  borderRadius: "16px",
  border: "1px solid #d4dbe6",
  boxSizing: "border-box",
  fontSize: "16px",
  resize: "vertical",
  fontFamily:
    'Inter, Arial, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  background: "#ffffff",
  outline: "none",
};

const summaryCardStyle = {
  background: "linear-gradient(180deg, #eef4ff 0%, #f8fbff 100%)",
  border: "1px solid #dbe6ff",
  borderRadius: "18px",
  padding: "18px",
  marginBottom: "18px",
};

const summaryHeaderStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "12px",
  marginBottom: "10px",
};

const summaryTagStyle = {
  background: "#dbeafe",
  color: "#1d4ed8",
  fontSize: "12px",
  fontWeight: 700,
  borderRadius: "999px",
  padding: "6px 10px",
};

const summaryTextStyle = {
  margin: "6px 0 0 0",
  color: "#475569",
  lineHeight: 1.5,
};

const actionRowStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: "12px",
  marginTop: "8px",
};

const waStyle = {
  display: "inline-block",
  background: "#25D366",
  color: "white",
  textDecoration: "none",
  padding: "13px 18px",
  borderRadius: "14px",
  fontWeight: 800,
  boxShadow: "0 10px 24px rgba(37,211,102,0.28)",
};

const helperTextStyle = {
  fontSize: "12px",
  color: "#64748b",
  marginTop: "10px",
  marginBottom: "14px",
};

const benefitsCardStyle = {
  display: "grid",
  gap: "10px",
  background: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: "18px",
  padding: "16px",
  marginTop: "6px",
  marginBottom: "16px",
};

const benefitItemStyle = {
  fontSize: "14px",
  color: "#334155",
  fontWeight: 600,
};

const priceCardStyle = {
  background: "linear-gradient(180deg, #eef7ff 0%, #f8fbff 100%)",
  borderRadius: "20px",
  padding: "20px",
  marginTop: "20px",
  border: "1px solid #dbe6ff",
  boxShadow: "0 14px 30px rgba(30,58,138,0.08)",
};

const priceTopRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "14px",
  flexWrap: "wrap",
};

const priceLabelStyle = {
  fontSize: "14px",
  fontWeight: 800,
  color: "#0f172a",
  marginBottom: "8px",
};

const priceValueStyle = {
  fontSize: "clamp(28px, 5vw, 40px)",
  lineHeight: 1,
  fontWeight: 900,
  color: "#0b2e73",
  letterSpacing: "-0.03em",
};

const discountBadgeStyle = {
  background: "#dcfce7",
  color: "#166534",
  fontSize: "12px",
  fontWeight: 800,
  borderRadius: "999px",
  padding: "8px 12px",
  border: "1px solid #bbf7d0",
};

const priceMetaStyle = {
  fontSize: "14px",
  color: "#475569",
  margin: "12px 0 8px 0",
};

const savingTextStyle = {
  fontSize: "14px",
  fontWeight: 800,
  color: "#166534",
  margin: "0 0 8px 0",
};

const upliftTextStyle = {
  fontSize: "13px",
  color: "#92400e",
  margin: "0 0 8px 0",
};

const priceNoteStyle = {
  fontSize: "13px",
  color: "#64748b",
  marginBottom: 0,
  lineHeight: 1.55,
};

const buttonStyle = {
  width: "100%",
  background: "linear-gradient(135deg, #0b2e73 0%, #0b6f8f 100%)",
  color: "white",
  border: "none",
  borderRadius: "16px",
  padding: "16px 18px",
  fontSize: "16px",
  fontWeight: 800,
  cursor: "pointer",
  boxShadow: "0 14px 30px rgba(11,46,115,0.28)",
  marginTop: "16px",
};

const unlockCardStyle = {
  marginTop: "28px",
  padding: "20px",
  borderRadius: "20px",
  background: "linear-gradient(135deg,#eef4ff,#f8fafc)",
  border: "1px solid #dbe6ff",
  textAlign: "center",
  boxShadow: "0 12px 28px rgba(30,58,138,0.10)",
};

const unlockTitleStyle = {
  fontSize: "22px",
  fontWeight: 800,
  marginBottom: "8px",
  color: "#0f172a",
};

const unlockTextStyle = {
  margin: 0,
  fontSize: "14px",
  color: "#475569",
  lineHeight: 1.6,
};

const unlockBulletsStyle = {
  marginTop: "12px",
  fontSize: "13px",
  color: "#64748b",
  lineHeight: 1.7,
};

const submitMessageStyle = {
  marginTop: "14px",
  marginBottom: 0,
  fontWeight: 800,
};
