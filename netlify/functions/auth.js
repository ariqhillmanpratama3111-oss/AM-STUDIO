const { createClient } = require("@supabase/supabase-js");

exports.handler = async (event) => {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin":
      process.env.ALLOWED_ORIGIN || "https://anita-studio.netlify.app",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const { email } = JSON.parse(event.body || "{}");

    if (
      typeof email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Email tidak valid" }),
      };
    }

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );

    const { error } = await supabase.auth.signInWithOtp({
  email: email.trim(),
  options: {
    shouldCreateUser: false,
    emailRedirectTo: process.env.ALLOWED_ORIGIN,
  },
});
    if (error) throw error;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: "Jika akun terdaftar, instruksi login akan dikirim melalui email.",
      }),
    };
  } catch (error) {
    console.error("Auth error:", error.message);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "Permintaan login gagal diproses.",
      }),
    };
  }
};
