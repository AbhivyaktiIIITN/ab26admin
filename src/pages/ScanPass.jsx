import { useState, useRef } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import api from "../api/api";
export default function ScanPass() {
  const lastScan = useRef(0);
  const [scanResult, setScanResult] = useState(null);

  const handleScan = async (result) => {
    if (scanResult) return;
    if (!result?.length) return;

    const now = Date.now();
    if (now - lastScan.current < 1500) return;
    lastScan.current = now;

    try {
      const parsed = JSON.parse(result[0].rawValue);
      console.log("QR:", parsed);
      const type = parsed.type;
      const qrToken = parsed.token || parsed.qrToken;
      if (type === "pass") {
        try {
          const res = await api.post("/scan-pass", { qrToken: qrToken });
          if (res.status === 200 || res.status === 201) {
            setScanResult({ type: 'success', message: res.data.message || "Pass scanned successfully!" });
          } else {
            setScanResult({ type: 'error', message: res.data.error || "Unknown error occurred" });
          }
        } catch (error) {
          if (error.response?.data?.error) {
            setScanResult({ type: 'error', message: error.response.data.error });
          } else {
            setScanResult({ type: 'error', message: "Error scanning pass." });
          }
        }
      } else if (type === "accommodation") {
        try {
          const res = await api.post("/scan-accommodation", { qrToken: qrToken });
          if (res.status === 200 || res.status === 201) {
            setScanResult({ type: 'success', message: res.data.message || "Accommodation scanned successfully!" });
          } else {
            setScanResult({ type: 'error', message: res.data.error || "Unknown error occurred" });
          }
        } catch (error) {
          if (error.response?.data?.error) {
            setScanResult({ type: 'error', message: error.response.data.error });
          } else {
            setScanResult({ type: 'error', message: "Error scanning accommodation." });
          }
        }
      } else {
        setScanResult({ type: 'error', message: "Invalid QR code type!" });
      }
    } catch (e) {
      console.log("Invalid QR");
      setScanResult({ type: 'error', message: "Invalid QR format." });
    }
  };

  const resetScanner = () => {
    setScanResult(null);
  }

  if (scanResult) {
    return (
      <div style={{ maxWidth: 400, margin: "auto", textAlign: "center", padding: "2rem" }}>
        <div style={{
          padding: "1.5rem",
          borderRadius: "8px",
          marginBottom: "1.5rem",
          backgroundColor: scanResult.type === 'success' ? '#d4edda' : '#f8d7da',
          color: scanResult.type === 'success' ? '#155724' : '#721c24',
          border: `1px solid ${scanResult.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`
        }}>
          <h2 style={{ marginTop: 0 }}>
            {scanResult.type === 'success' ? '✅ Success' : '❌ Error'}
          </h2>
          <p style={{ fontSize: "1.1rem", margin: 0 }}>{scanResult.message}</p>
        </div>
        <button
          onClick={resetScanner}
          style={{
            padding: "10px 20px",
            fontSize: "1rem",
            cursor: "pointer",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px"
          }}
        >
          Scan Another Pass
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 400, margin: "auto", marginTop: "2rem" }}>
      <h2 style={{ textAlign: "center", marginBottom: "1rem" }}>Scan Pass QR</h2>
      <Scanner
        onScan={handleScan}
        constraints={{ facingMode: "environment" }}
        styles={{ video: { transform: "none" } }} // Changed to "none" assuming the default scaleX(-1) or scaleX(1) caused mirroring. Let's specifically use "none" for environment cameras in react-qr-scanner to show correct unflipped view.
      />
    </div>
  );
}