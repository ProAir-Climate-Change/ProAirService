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

function StepPill({ number, title, active, complete, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        ...stepPillStyle,
        ...(active ? stepPillActiveStyle : {}),
        ...(complete ? stepPillCompleteStyle : {}),
      }}
    >
      <span
        style={{
          ...stepNumberStyle,
          ...(active ? stepNumberActiveStyle : {}),
          ...(complete ? stepNumberCompleteStyle : {}),
        }}
      >
        {complete ? "✓" : number}
      </span>
      <span>{title}</span>
    </button>
  );
}

function DetailChip({ icon, label, value }) {
  return (
    <div style={detailChipStyle}>
      <span style={detailChipIconStyle}>{icon}</span>
      <div>
        <div style={detailChipLabelStyle}>{label}</div>
        <div style={detailChipValueStyle}>{value || "—"}</div>
      </div>
    </div>
  );
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
  const [currentStep, setCurrentStep] = useState(1);
  const [isDesktop, setIsDesktop] = useState(false);

  const leadSentRef = useRef(false);

  useEffect(() => {
    const updateLayout = () => {
      setIsDesktop(window.innerWidth >= 980);
    };

    updateLayout();
    window.addEventListener("resize", updateLayout);
    return () => window.removeEventListener("resize", updateLayout);
  }, []);

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

  const step1Complete = detailsComplete;
 const step2Complete =
  indoorUnits !== "1" ||
  outdoorUnits !== "1" ||
  brand !== "Daikin" ||
  systemType !== "Single split" ||
  indoorUnitType !== "Wall mounted" ||
  lastServiced !== "Within 12 months" ||
  enquiryType !== "Routine service";

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

  const goNext = () => {
    if (currentStep === 1 && !step1Complete) return;
    if (currentStep < 3) setCurrentStep((prev) => prev + 1);
  };

  const goBack = () => {
    if (currentStep > 1) setCurrentStep((prev) => prev - 1);
  };

  return (
    <div style={pageStyle}>
      <div style={backgroundGlowOne} />
      <div style={backgroundGlowTwo} />

      <div style={containerStyle}>
        <div style={heroWrapStyle}>
          <div style={heroBadgeStyle}>PROAIR • SERVICE CALCULATOR</div>
          <h1 style={heroTitleStyle}>Air conditioning service enquiry</h1>
          <p style={heroTextStyle}>
            Get an instant estimated service price, show customers their
            multi-unit discount, and send the enquiry straight to ProAir.
          </p>

          <div style={heroFeatureRowStyle}>
            <div style={heroFeatureStyle}>❄️ Routine service & deep cleans</div>
            <div style={heroFeatureStyle}>🛠 Faults, leaks & breakdowns</div>
            <div style={heroFeatureStyle}>✅ F-Gas certified engineers</div>
          </div>
        </div>

        <div
          style={{
            ...mainGridStyle,
            gridTemplateColumns: isDesktop ? "minmax(0, 1.3fr) 380px" : "1fr",
          }}
        >
          <div style={mainCardStyle}>
            <div style={cardHeaderStyle}>
              <div>
                <h2 style={cardTitleStyle}>Book a service</h2>
                <p style={cardSubtitleStyle}>
                  Complete the form below and we’ll recommend the right service
                  level and next available slot.
                </p>
              </div>
            </div>

            <div style={stepBarStyle}>
              <StepPill
                number="1"
                title="Your details"
                active={currentStep === 1}
                complete={step1Complete}
                onClick={() => setCurrentStep(1)}
              />
              <StepPill
                number="2"
                title="System details"
                active={currentStep === 2}
                complete={step2Complete}
                onClick={() => setCurrentStep(2)}
              />
              <StepPill
                number="3"
                title="Notes & send"
                active={currentStep === 3}
                complete={false}
                onClick={() => setCurrentStep(3)}
              />
            </div>

            <form onSubmit={handleSubmit}>
              {currentStep === 1 && (
                <div>
                  <div style={sectionHeadingStyle}>Your details</div>
                  <div style={sectionTextStyle}>
                    Enter your contact details to unlock the estimated price.
                  </div>

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

                  <div style={infoBoxStyle}>
                    <div style={infoBoxTitleStyle}>Lead capture active</div>
                    <p style={infoBoxTextStyle}>
                      As soon as contact details are entered, the enquiry can be
                      logged so ProAir can follow up even if the form is not
                      fully submitted.
                    </p>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div>
                  <div style={sectionHeadingStyle}>System details</div>
                  <div style={sectionTextStyle}>
                    Tell us what type of system needs servicing.
                  </div>

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
                      <label style={labelStyle}>
                        When are you looking to book?
                      </label>
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
                </div>
              )}

              {currentStep === 3 && (
                <div>
                  <div style={sectionHeadingStyle}>Notes & send</div>
                  <div style={sectionTextStyle}>
                    Add anything useful for access, faults, smells, leaks or
                    general concerns.
                  </div>

                  <div>
                    <label style={labelStyle}>Any faults / concerns / notes?</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="e.g. not cooling properly, bad smell, noisy fan, leaking water"
                      style={textAreaStyle}
                      rows={5}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>Parking / access notes</label>
                    <textarea
                      value={accessNotes}
                      onChange={(e) => setAccessNotes(e.target.value)}
                      placeholder="e.g. parking restrictions, loft access, high wall access, gate code"
                      style={textAreaStyle}
                      rows={4}
                    />
                  </div>

                  {!isDesktop && (
                    <>
                      <div style={mobileSidebarCardStyle}>
                        <div style={sidebarSectionTitleStyle}>Service summary</div>

                        <div style={detailChipGridStyle}>
                          <DetailChip icon="👤" label="Customer" value={fullName} />
                          <DetailChip icon="📍" label="Postcode" value={postcode} />
                          <DetailChip
                            icon="❄️"
                            label="Units"
                            value={`${indoorUnits} unit(s)`}
                          />
                          <DetailChip icon="🏷️" label="Brand" value={brand} />
                          <DetailChip icon="🧰" label="System" value={systemType} />
                          <DetailChip
                            icon="📦"
                            label="Unit type"
                            value={indoorUnitType}
                          />
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
                          Estimated price based on the details provided. Final
                          price may vary depending on access, unit type, system
                          condition and location.
                        </p>
                      </div>
                    </>
                  )}
                </div>
              )}

              <div style={navButtonRowStyle}>
                {currentStep > 1 ? (
                  <button type="button" onClick={goBack} style={secondaryButtonStyle}>
                    Back
                  </button>
                ) : (
                  <div />
                )}

                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={goNext}
                    style={{
                      ...primaryButtonStyle,
                      opacity:
                        currentStep === 1 && !step1Complete ? 0.6 : 1,
                      cursor:
                        currentStep === 1 && !step1Complete
                          ? "not-allowed"
                          : "pointer",
                    }}
                    disabled={currentStep === 1 && !step1Complete}
                  >
                    Continue
                  </button>
                ) : (
                  <button
                    type="submit"
                    style={primaryButtonStyle}
                    disabled={!detailsComplete || submitting}
                  >
                    {submitting ? "Sending..." : "Send service enquiry"}
                  </button>
                )}
              </div>

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

          {isDesktop && (
            <div style={stickySidebarWrapStyle}>
              <div style={stickySidebarStyle}>
                <div style={sidebarCardStyle}>
                  <div style={sidebarLogoStyle}>
                    <span style={{ color: "#7c8593" }}>PRO</span>
                    <span style={{ color: "#0b6f8f" }}>AIR</span>
                  </div>
                  <div style={sidebarMiniTextStyle}>
                    Live service estimate
                  </div>

                  {customerDetailsComplete ? (
                    <div style={sidebarLivePillStyle}>Lead captured</div>
                  ) : (
                    <div style={sidebarLockedPillStyle}>Enter details to unlock</div>
                  )}

                  <div style={sidebarSectionStyle}>
                    <div style={sidebarSectionTitleStyle}>Service summary</div>

                    <div style={detailChipGridStyle}>
                      <DetailChip icon="👤" label="Customer" value={fullName} />
                      <DetailChip icon="📞" label="Phone" value={phone} />
                      <DetailChip icon="📍" label="Postcode" value={postcode} />
                      <DetailChip
                        icon="❄️"
                        label="Units"
                        value={`${indoorUnits} unit(s)`}
                      />
                      <DetailChip icon="🏷️" label="Brand" value={brand} />
                      <DetailChip icon="🧰" label="System" value={systemType} />
                      <DetailChip
                        icon="📦"
                        label="Unit type"
                        value={indoorUnitType}
                      />
                      <DetailChip
                        icon="🕒"
                        label="Last serviced"
                        value={lastServiced}
                      />
                    </div>
                  </div>

                  {customerDetailsComplete ? (
                    <>
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
                          Estimated price based on the details provided. Final
                          price may vary depending on access, unit type, system
                          condition and location.
                        </p>
                      </div>

                      <a
                        href={whatsappHref}
                        target="_blank"
                        rel="noreferrer"
                        style={waSidebarStyle}
                      >
                        📲 Send on WhatsApp
                      </a>

                      <div style={sidebarChecklistStyle}>
                        <div style={sidebarChecklistItemStyle}>
                          ✔ F-Gas certified engineers
                        </div>
                        <div style={sidebarChecklistItemStyle}>
                          ✔ Domestic & small commercial
                        </div>
                        <div style={sidebarChecklistItemStyle}>
                          ✔ Routine service, deep clean & fault calls
                        </div>
                      </div>
                    </>
                  ) : (
                    <div style={unlockCardStyle}>
                      <div style={unlockTitleStyle}>🔓 Unlock your service price</div>
                      <p style={unlockTextStyle}>
                        Enter your contact details in step 1 to instantly reveal
                        the estimated service cost.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
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
  padding: "32px 18px 60px",
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
  maxWidth: "1220px",
  margin: "0 auto",
  position: "relative",
  zIndex: 1,
};

const heroWrapStyle = {
  marginBottom: "22px",
};

const heroBadgeStyle = {
  display: "inline-block",
  padding: "8px 14px",
  borderRadius: "999px",
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.14)",
  fontSize: "12px",
  fontWeight: 800,
  letterSpacing: "0.12em",
  marginBottom: "16px",
};

const heroTitleStyle = {
  margin: 0,
  fontSize: "clamp(34px, 5.5vw, 58px)",
  lineHeight: 1.02,
  fontWeight: 900,
  letterSpacing: "-0.04em",
};

const heroTextStyle = {
  marginTop: "14px",
  marginBottom: "18px",
  maxWidth: "760px",
  color: "rgba(255,255,255,0.78)",
  fontSize: "16px",
  lineHeight: 1.6,
};

const heroFeatureRowStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: "10px",
};

const heroFeatureStyle = {
  padding: "10px 14px",
  borderRadius: "999px",
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.10)",
  color: "rgba(255,255,255,0.88)",
  fontSize: "13px",
  fontWeight: 700,
};

const mainGridStyle = {
  display: "grid",
  gap: "22px",
  alignItems: "start",
};

const mainCardStyle = {
  background: "rgba(243, 244, 246, 0.98)",
  color: "#0b1b3a",
  borderRadius: "28px",
  padding: "26px",
  boxShadow: "0 24px 60px rgba(2, 6, 23, 0.35)",
  border: "1px solid rgba(255,255,255,0.08)",
};

const cardHeaderStyle = {
  marginBottom: "18px",
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

const stepBarStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: "10px",
  marginBottom: "24px",
};

const stepPillStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  background: "#ffffff",
  border: "1px solid #dbe3ee",
  borderRadius: "16px",
  padding: "12px",
  fontWeight: 700,
  color: "#475569",
  cursor: "pointer",
  textAlign: "left",
};

const stepPillActiveStyle = {
  border: "1px solid #93c5fd",
  background: "#eff6ff",
  color: "#0b2e73",
  boxShadow: "0 8px 20px rgba(59,130,246,0.10)",
};

const stepPillCompleteStyle = {
  border: "1px solid #bbf7d0",
  background: "#f0fdf4",
  color: "#166534",
};

const stepNumberStyle = {
  minWidth: "28px",
  height: "28px",
  borderRadius: "999px",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#e2e8f0",
  color: "#334155",
  fontSize: "13px",
  fontWeight: 800,
};

const stepNumberActiveStyle = {
  background: "#0b2e73",
  color: "#ffffff",
};

const stepNumberCompleteStyle = {
  background: "#16a34a",
  color: "#ffffff",
};

const sectionHeadingStyle = {
  fontSize: "22px",
  fontWeight: 900,
  color: "#0f172a",
  marginBottom: "6px",
};

const sectionTextStyle = {
  fontSize: "14px",
  color: "#64748b",
  marginBottom: "18px",
  lineHeight: 1.55,
};

const responsiveGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: "16px",
};

const labelStyle = {
  display: "block",
  fontSize: "14px",
  fontWeight: 800,
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

const infoBoxStyle = {
  background: "linear-gradient(180deg, #eef4ff 0%, #f8fbff 100%)",
  border: "1px solid #dbe6ff",
  borderRadius: "18px",
  padding: "16px",
  marginTop: "4px",
};

const infoBoxTitleStyle = {
  fontWeight: 800,
  color: "#0b2e73",
  marginBottom: "6px",
};

const infoBoxTextStyle = {
  margin: 0,
  color: "#475569",
  lineHeight: 1.55,
  fontSize: "14px",
};

const navButtonRowStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "12px",
  marginTop: "12px",
};

const primaryButtonStyle = {
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
};

const secondaryButtonStyle = {
  width: "100%",
  background: "#ffffff",
  color: "#0f172a",
  border: "1px solid #d4dbe6",
  borderRadius: "16px",
  padding: "16px 18px",
  fontSize: "16px",
  fontWeight: 800,
  cursor: "pointer",
};

const submitMessageStyle = {
  marginTop: "14px",
  marginBottom: 0,
  fontWeight: 800,
};

const stickySidebarWrapStyle = {
  position: "relative",
};

const stickySidebarStyle = {
  position: "sticky",
  top: "24px",
};

const sidebarCardStyle = {
  background: "rgba(243, 244, 246, 0.98)",
  color: "#0b1b3a",
  borderRadius: "28px",
  padding: "20px",
  boxShadow: "0 24px 60px rgba(2, 6, 23, 0.28)",
  border: "1px solid rgba(255,255,255,0.08)",
};

const mobileSidebarCardStyle = {
  background: "rgba(243, 244, 246, 0.98)",
  color: "#0b1b3a",
  borderRadius: "22px",
  padding: "18px",
  border: "1px solid #e2e8f0",
  marginBottom: "16px",
};

const sidebarLogoStyle = {
  fontSize: "32px",
  fontWeight: 900,
  lineHeight: 1,
  letterSpacing: "-0.04em",
};

const sidebarMiniTextStyle = {
  marginTop: "8px",
  color: "#64748b",
  fontSize: "13px",
  fontWeight: 700,
};

const sidebarLivePillStyle = {
  marginTop: "14px",
  display: "inline-block",
  background: "#dcfce7",
  color: "#166534",
  border: "1px solid #bbf7d0",
  borderRadius: "999px",
  padding: "8px 12px",
  fontSize: "12px",
  fontWeight: 800,
};

const sidebarLockedPillStyle = {
  marginTop: "14px",
  display: "inline-block",
  background: "#eff6ff",
  color: "#1d4ed8",
  border: "1px solid #bfdbfe",
  borderRadius: "999px",
  padding: "8px 12px",
  fontSize: "12px",
  fontWeight: 800,
};

const sidebarSectionStyle = {
  marginTop: "18px",
};

const sidebarSectionTitleStyle = {
  fontSize: "14px",
  fontWeight: 900,
  color: "#0f172a",
  marginBottom: "12px",
};

const detailChipGridStyle = {
  display: "grid",
  gap: "10px",
};

const detailChipStyle = {
  display: "grid",
  gridTemplateColumns: "34px 1fr",
  gap: "10px",
  alignItems: "start",
  background: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: "16px",
  padding: "12px",
};

const detailChipIconStyle = {
  width: "34px",
  height: "34px",
  borderRadius: "12px",
  background: "#eef4ff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "16px",
};

const detailChipLabelStyle = {
  fontSize: "12px",
  fontWeight: 800,
  color: "#64748b",
  marginBottom: "3px",
};

const detailChipValueStyle = {
  fontSize: "14px",
  fontWeight: 700,
  color: "#0f172a",
  lineHeight: 1.4,
  wordBreak: "break-word",
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
  fontWeight: 900,
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

const waSidebarStyle = {
  display: "block",
  marginTop: "16px",
  textAlign: "center",
  background: "#25D366",
  color: "white",
  textDecoration: "none",
  padding: "13px 18px",
  borderRadius: "14px",
  fontWeight: 800,
  boxShadow: "0 10px 24px rgba(37,211,102,0.28)",
};

const sidebarChecklistStyle = {
  marginTop: "16px",
  display: "grid",
  gap: "10px",
};

const sidebarChecklistItemStyle = {
  background: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: "14px",
  padding: "12px",
  fontSize: "14px",
  fontWeight: 700,
  color: "#334155",
};

const unlockCardStyle = {
  marginTop: "18px",
  padding: "18px",
  borderRadius: "18px",
  background: "linear-gradient(135deg,#eef4ff,#f8fafc)",
  border: "1px solid #dbe6ff",
  textAlign: "center",
};

const unlockTitleStyle = {
  fontSize: "20px",
  fontWeight: 900,
  marginBottom: "8px",
  color: "#0f172a",
};

const unlockTextStyle = {
  margin: 0,
  fontSize: "14px",
  color: "#475569",
  lineHeight: 1.6,
};
