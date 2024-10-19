import { namespaceWrapper, app } from "@_koii/namespace-wrapper";

export function routes() {
  app.get("/value", async (_req, res) => {
    const value = await namespaceWrapper.storeGet("value");
    console.log("value", value);
    res.status(200).json({ value: value });
  });
}