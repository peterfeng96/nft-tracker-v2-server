const { Network, Alchemy } = require("alchemy-sdk");
const { createClient } = require("@supabase/supabase-js");
const { Web3 } = require("web3");
require("dotenv").config();

// WEB3
const web3 = new Web3();

// ALCHEMY API WEBSOCKET
const settings = {
  apiKey: process.env.ALCHEMY_API_KEY, // Replace with your Alchemy API Key.
  network: Network.ETH_MAINNET, // Replace with your network.
};
const alchemy = new Alchemy(settings);

// SUBABASE CLIENT
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const uniqueAddresses = new Set();
const transfer_topic =
  "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

// RUNS WHEN EVENT INCOMING FROM SUPABASE
// ADDS NEW EVENT LISTENER ALCHEMY WEBSOCKET
const handleInserts = (payload) => {
  console.log("Change received!", payload);
  const contractAddress = payload.new.address;
  // Returns if new address is already in set of unique addresses
  if (uniqueAddresses.has(contractAddress)) return;

  params = { address: contractAddress, topics: [transfer_topic] };
  alchemy.ws.on(params, (txn) => handleTransaction(txn));
};

async function handleTransaction(txn) {
  console.log(txn);
  // PARSING AND DECODING TRANSACTION DATA
  const { address, transactionHash, topics } = txn;
  const fromAddress = web3.eth.abi.decodeParameter("address", topics[1]);
  const toAddress = web3.eth.abi.decodeParameter("address", topics[2]);
  const tokenId = Number(web3.eth.abi.decodeParameter("int", topics[3]));
  console.log(
    `from: ${fromAddress} // to: ${toAddress} // tokenId: ${tokenId}`
  );
  // INSERTING TRANSACTION DATA INTO SUPABASE DB
  const x = await supabase.from("transfer_transactions").insert({
    contract_address: address,
    transaction_hash: transactionHash,
    from_address: fromAddress,
    to_address: toAddress,
    token_id: tokenId,
  });
  console.log(x);
}

// ONLY ON START UP
async function start() {
  // GET ALL CONTRACT ADDRESSES TO WATCH
  let { data } = await supabase.from("unique_contract_addresses").select("*");
  console.log(data);

  data.forEach((entry) => {
    uniqueAddresses.add(entry.contract_address);
  });
  // OPENS ALCHEMY WEBSOCKET CONNECTION
  uniqueAddresses.forEach((address) => {
    // HANDLES EVENT FROM EACH CONTRACT ADDRESS
    params = { address, topics: [transfer_topic] };
    alchemy.ws.on(params, (txn) => handleTransaction(txn));
  });
  // STARTS UP SUPABASE WEBSOCKET -> RUNS HANDLEINSERTS FUNCTION
  supabase
    .channel("user_subscriptions")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "user_subscriptions" },
      handleInserts
    )
    .subscribe();
}

start();
