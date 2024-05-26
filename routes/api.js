/* 
ALL REQUESTS THROUGH /API
*/
const express = require("express");

const router = express.Router();

const collectionController = require("../controllers/collectionController");

// Options to change exact routing and insert middleware in between routes and final callback function
// Shown in user.js

// GET REQUEST
router.get("/", (req, res) => {
  console.log("getting");
  res.send("GET request to /api");
});
// POST REQUEST
router.post("/", collectionController.addUserCollection, (req, res) => {
  res.send("POST request to /api");
});
// PUT REQUEST
router.put("/", (req, res) => {
  res.send("PUT request to /api");
});
// DELETE REQUEST
router.delete("/", (req, res) => {
  res.send("DELETE request to /api");
});

module.exports = router;
