const express = require("express");
const cors = require("cors");
require("dotenv").config();

// INITIATE EXPRESS SERVER
const app = express();
// Default on port 3000
const PORT = 3001;

const apiRouter = require("./routes/api");

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.status(200).json({
    response:
      "This is a default when there is a GET request to your express server at http://localhost:3000/",
  });
});

// ROUTES

// Example route - All requests that go to http://localhost:3000/api go to apiRouter
app.use("/api", apiRouter);

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
