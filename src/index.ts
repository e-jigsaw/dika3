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
                        type: 2,
                        custom_id: "regular,now",
                        style: 3,
                        label: "今のナワバリ",
                      },
                      {
                        type: 2,
                        custom_id: "bankara-challenge,now",
                        style: 4,
                        label: "バンカラ(チャレンジ)",
                      },
                      {
                        type: 2,
                        custom_id: "bankara-open,now",
                        style: 4,
                        label: "バンカラ(オープン)",
                      },
                    ],
                  },
                  {
                    "type": 1,
                    components: [
                      {
                        type: 2,
                        custom_id: "regular,next",
                        style: 3,
                        label: "次のナワバリ",
                      },
                      {
                        type: 2,
                        custom_id: "bankara-challenge,next",
                        style: 4,
                        label: "バンカラ(チャレンジ)",
                      },
                      {
                        type: 2,
                        custom_id: "bankara-open,next",
                        style: 4,
                        label: "バンカラ(オープン)",
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
        const [p1, p2] = payload.data.custom_id.split(",");
        const res = await fetch(`https://spla3.yuu26.com/api/${p1}/${p2}`, {
          headers: {
            "User-Agent": "dika3 (twitter @neo6120)",
          },
        });
        const { results: { stages } } = await res.json();
        console.log(stages);
        return json({
          type: InteractionResponseTypes.ChannelMessageWithSource,
          data: {
            content: "ok",
          },
        });
      }
    }
    console.log(payload.type, payload);
    return new Response("ok");
  },
});
