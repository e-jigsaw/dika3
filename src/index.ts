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
                    components: [
                      {
                        type: 3,
                        custom_id: "p1",
                        options: [
                          {
                            label: "ナワバリ",
                            value: "regular",
                            default: true,
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
                    ],
                  },
                  {
                    "type": 1,
                    components: [
                      {
                        type: 3,
                        custom_id: "p2",
                        options: [
                          {
                            label: "現在",
                            value: "now",
                            default: true,
                          },
                          {
                            label: "次",
                            value: "next",
                          },
                        ],
                      },
                    ],
                  },
                  {
                    "type": 1,
                    components: [
                      {
                        type: 2,
                        custom_id: "b",
                        style: 1,
                        label: "くれ！",
                      },
                    ],
                  },
                ],
              },
            });
          }
        }
        break;
      }
      case InteractionTypes.MessageComponent: {
        switch (payload.data.custom_id) {
          case "b": {
            console.log(payload.message.components);
            return json({
              type: InteractionResponseTypes.ChannelMessageWithSource,
              data: {
                content: "ok",
              },
            });
          }
        }
      }
    }
    console.log(payload.type, payload);
    return new Response("ok");
  },
});
