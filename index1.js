const { Network, Alchemy } = require("alchemy-sdk");
const { createClient } = require("@supabase/supabase-js");
const { Web3 } = require("web3");
require("dotenv").config();

const web3 = new Web3();

const settings = {
  apiKey: process.env.ALCHEMY_API_KEY, // Replace with your Alchemy API Key.
  network: Network.ETH_MAINNET, // Replace with your network.
};
// ALCHEMY API WEBSOCKET
const alchemy = new Alchemy(settings);

// SUBABASE CLIENT
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const transfer_topic =
  "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

// RUNS WHEN EVENT INCOMING FROM SUPABASE
// ADDS NEW EVENT LISTENER ALCHEMY WEBSOCKET
const handleInserts = (payload) => {
  console.log("Change received!", payload);

  const contract_address = payload.new.address;
  params = { address: contract_address, topics: [transfer_topic] };
  alchemy.ws.on(params, (txn) => console.log(txn));
};

// STARTS UP SUPABASE WEBSOCKET -> RUNS HANDLEINSERTS FUNCTION
supabase
  .channel("user_subscriptions")
  .on(
    "postgres_changes",
    { event: "INSERT", schema: "public", table: "user_subscriptions" },
    handleInserts
  )
  .subscribe();

async function handleTransaction(txn) {
  console.log(txn);
  const { contractAddress, transactionHash, topics } = txn;
  const fromAddress = web3.eth.abi.decodeParameter("address", topics[1]);
  const toAddress = web3.eth.abi.decodeParameter("address", topics[2]);
  const tokenId = web3.eth.abi.decodeParameter("int", topics[3]);
  console.log(
    `from: ${fromAddress} // to: ${toAddress} // tokenId: ${tokenId}`
  );
  supabase
    .from("transfer_transactions")
    .insert({
      contract_address: contractAddress,
      transaction_hash: transactionHash,
      from_address: fromAddress,
      to_address: toAddress,
      token_id: tokenId,
    });
}

// ONLY ON START UP
async function start() {
  // GET ALL CONTRACT ADDRESSES TO WATCH
  let { data } = await supabase.from("unique_contract_addresses").select("*");
  console.log(data);

  // OPENS ALCHEMY WEBSOCKET CONNECTION
  data.forEach((entry) => {
    // HANDLES EVENT FROM EACH CONTRACT ADDRESS
    params = { address: entry.contract_address, topics: [transfer_topic] };
    alchemy.ws.on(params, (txn) => handleTransaction(txn));
  });
}

start();
