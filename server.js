const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(express.json());
const corsOptions = {
    origin: "*", 
    methods: "GET,POST",
    allowedHeaders: "Content-Type",
  };
  
  app.use(cors(corsOptions));


const PLAID_API_BASE = "https://sandbox.plaid.com";
const PLAID_CLIENT_ID = 'x';
const PLAID_SECRET = 'x';
const ANDROID_PACKAGE_NAME = "com.moneymind"; 

app.post("/api/create_link_token", async (req, res) => {
    console.log("ssd")
  try {
    const response = await axios.post(`${PLAID_API_BASE}/link/token/create`, {
      client_id: PLAID_CLIENT_ID,
      secret: PLAID_SECRET,
      user: { client_user_id: "user-123" },
      client_name: "AI Personal Finance Manager",
      products: ["transactions"],
      country_codes: ["US"],
      language: "en",
      android_package_name: ANDROID_PACKAGE_NAME,
    });

    res.json({ link_token: response.data.link_token });
  } catch (error) {
    console.error("Error creating Plaid link token:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to create link token" });
  }
});

app.post("/api/exchange_public_token", async (req, res) => {
  const { public_token } = req.body;
  try {
    const response = await axios.post(`${PLAID_API_BASE}/item/public_token/exchange`, {
      client_id: PLAID_CLIENT_ID,
      secret: PLAID_SECRET,
      public_token: public_token,
    });

    res.json({ access_token: response.data.access_token });
  } catch (error) {
    console.error("Error exchanging token:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to exchange token" });
  }
});

app.post("/api/get_transactions", async (req, res) => {
    const { access_token } = req.body;
  
    if (!access_token) {
      return res.status(400).json({ error: "Missing access_token" });
    }
  
    try {
      const response = await axios.post(`${PLAID_API_BASE}/transactions/get`, {
        client_id: PLAID_CLIENT_ID,
        secret: PLAID_SECRET,
        access_token: access_token,
        start_date: "2022-01-01", 
        end_date: "2025-02-01",
      });
      
      res.json(response.data.transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error.response?.data || error.message);
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  });

  
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
