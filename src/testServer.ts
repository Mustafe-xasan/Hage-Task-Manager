import app from "./App";

const PORT = Number(process.env.TEST_PORT ?? 4000);

app.listen(PORT, () => {
  console.log(`Test server listening at http://localhost:${PORT}`);
});
