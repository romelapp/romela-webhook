import { createServer } from "node:http";
import { createClient } from "@supabase/supabase-js";

const port = process.env.PORT || 10000;

// 🔐 Supabase config (use your real values later)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

createServer(async (req, res) => {
    // TEST ROUTE
  if (req.method === "GET" && req.url === "/health") {
    console.log("Health check hit");
    res.writeHead(200);
    res.end("OK");
    return;
  }
  // ✅ PAYFAST WEBHOOK
  if (req.method === "POST" && req.url === "/payfast-itn") {
    let body = "";

    req.on("data", chunk => {
      body += chunk.toString();
    });

    req.on("end", async () => {
      const params = new URLSearchParams(body);

      const requestId = params.get("custom_str1");
      const paymentStatus = params.get("payment_status");

      console.log("🔥 PayFast ITN received");
      console.log("Request ID:", requestId);
      console.log("Status:", paymentStatus);

      if (paymentStatus === "COMPLETE") {
        const { error } = await supabase
          .from("payment_requests")
          .update({
  status: "paid"
})
          .eq("id", requestId);

        if (error) {
          console.log("❌ Supabase update error:", error);
        } else {
          console.log("✅ Payment marked as paid");
        }
      }

      res.writeHead(200);
      res.end("OK");
    });

    return;
  }

  // fallback
  res.writeHead(200);
  res.end("Server running");
}).listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
