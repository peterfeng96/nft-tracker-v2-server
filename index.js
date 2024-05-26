const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { Network, Alchemy } = require("alchemy-sdk");
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const settings = {
  apiKey: process.env.ALCHEMY_API_KEY, // Replace with your Alchemy API Key.
  network: Network.ETH_MAINNET, // Replace with your network.
};

// INITIATE EXPRESS SERVER
const app = express();
// Default on port 3000
const PORT = 3001;

const apiRouter = require("./routes/api");

app.use(express.json());
app.use(cors());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.status(200).json({
    response:
      "This is a default when there is a GET request to your express server at http://localhost:3000/",
  });
});

// ROUTES

// Example route - All requests that go to http://localhost:3000/api go to apiRouter
app.use("/api", apiRouter);

// ALCHEMY API WEBSOCKET
const alchemy = new Alchemy(settings);

// SUBABASE CLIENT
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const handleInserts = (payload) => {
  console.log("Change received!", payload);

  const contract_address = payload.new.contract_id;
  const transfer_topic =
    "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
  alchemy.ws.on(contract_address, transfer_topic);
};

supabase
  .channel("user_subscriptions")
  .on(
    "postgres_changes",
    { event: "INSERT", schema: "public", table: "user_subscriptions" },
    handleInserts
  )
  .subscribe();

async function x() {
  let { data } = await supabase.from("unique_contract_addresses").select("*");
  console.log(data);
}
x();
/*
GLOBAL ERROR HANDLER
https://expressjs.com/en/guide/error-handling.html#writing-error-handlers
Any non-accounted for errors will be logged and sent as a response with this error handler
*/
app.use((err, req, res, next) => {
  const defaultErr = {
    log: "Express error handler caught unknown middleware error",
    status: 400,
    message: { err: "An error occured" },
  };
  const errorObj = Object.assign(defaultErr, err);
  console.log(errorObj.log);
  res
    .status(errorObj.status)
    .json({ status: errorObj.status, message: errorObj.message });
});

// Start up the server on port $PORT
app.listen(PORT, () => {
  console.log(`Server listening on port: ${PORT}`);
});
