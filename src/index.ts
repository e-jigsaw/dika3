import { json, serve, validateRequest } from "sift";
import { verifySignature } from "discordeno";

const SigEd = "X-Signature-Ed25519";
const SigTime = "X-Signature-Timestamp";

serve({
  "/": async (req) => {
    const { error } = await validateRequest(req, {
      POST: {
        headers: [SigEd, SigTime],
      },
    });
    if (error) {
      return json({ error: error.message }, { status: error.status });
    }
    const publicKey = Deno.env.get("DISCORD_PUBLIC_KEY")!;
    const signature = req.headers.get(SigEd)!;
    const timestamp = req.headers.get(SigTime)!;
    const { body, isValid } = verifySignature({
      publicKey,
      signature,
      timestamp,
      body: await req.text(),
    });
    if (!isValid) {
      return json({ error: "Invalid request" }, { status: 401 });
    }
    const payload = JSON.parse(body);
    console.log(payload);
    return new Response("ok");
  },
});
