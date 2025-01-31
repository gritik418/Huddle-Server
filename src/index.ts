import express from "express";

const app = express();
const port = process.env.PORT;

app.listen(port, () => {
  console.log(`App served at: http://localhost:${port}`);
});
