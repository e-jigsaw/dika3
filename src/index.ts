import { json, serve, validateRequest } from "sift";
import {
  InteractionResponseTypes,
  InteractionTypes,
  verifySignature,
} from "discordeno";

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
    switch (payload.type) {
      case InteractionTypes.Ping: {
        return json({
          type: InteractionResponseTypes.Pong,
        });
      }
      case InteractionTypes.ApplicationCommand: {
        switch (payload.data.name) {
          case "ping1": {
            return json({
              type: InteractionResponseTypes.ChannelMessageWithSource,
              data: {
                content: "pong",
                components: [
                  {
                    "type": 1,
                    components: {
                      type: 3,
                      costom_id: "select1",
                      options: [
                        {
                          label: "ナワバリ",
                          value: "regular",
                        },
                        {
                          label: "バンカラ(チャレンジ)",
                          value: "bankara-challenge",
                        },
                        {
                          label: "バンカラ(オープン)",
                          value: "bankara-open",
                        },
                      ],
                    },
                  },
                ],
              },
            });
          }
        }
      }
    }
    console.log(payload);
    return new Response("ok");
  },
});
