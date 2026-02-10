const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const PI_API_BASE = "https://api.minepi.com";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const piApiKey = Deno.env.get("PI_API_KEY");
  if (!piApiKey) {
    return new Response(JSON.stringify({ error: "PI_API_KEY not configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const { action, paymentId, txid } = body;

    if (action === "approve") {
      // Approve a payment on Pi server
      const res = await fetch(`${PI_API_BASE}/v2/payments/${paymentId}/approve`, {
        method: "POST",
        headers: {
          Authorization: `Key ${piApiKey}`,
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      console.log("Payment approved:", data);
      return new Response(JSON.stringify({ success: true, data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "complete") {
      // Complete a payment on Pi server
      const res = await fetch(`${PI_API_BASE}/v2/payments/${paymentId}/complete`, {
        method: "POST",
        headers: {
          Authorization: `Key ${piApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ txid }),
      });
      const data = await res.json();
      console.log("Payment completed:", data);
      return new Response(JSON.stringify({ success: true, data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Pi payment error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
