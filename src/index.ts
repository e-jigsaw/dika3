import { json, serve, validateRequest } from "sift";
import {
  InteractionResponseTypes,
  InteractionTypes,
  verifySignature,
} from "discordeno";

const SigEd = "X-Signature-Ed25519";
const SigTime = "X-Signature-Timestamp";

const Stages = new Map([
  [1, {
    name: "ユノハナ大渓谷",
    map: "https://i.gyazo.com/20bea4fc3c0379fb73fad0b889923ed5.png",
  }],
  [2, {
    name: "ゴンズイ地区",
    map: "https://i.gyazo.com/f580626388880f561f333b275ec403a0.png",
  }],
]);

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
        const { results: [{ stages }] } = await res.json();
        const s1 = Stages.get(stages[0].id);
        const s2 = Stages.get(stages[1].id);
        return json({
          type: InteractionResponseTypes.ChannelMessageWithSource,
          data: {
            content: `${p2 === "now" ? "今の" : "次の"}${
              p1 === "regular" ? "ナワバリは" : ""
            }${p1 === "bankara-challenge" ? "バンカラ(チャレンジ)は" : ""}${
              p1 === "bankara-open" ? "バンカラ(オープン)は" : ""
            }`,
            embeds: [
              {
                title: s1?.name,
                image: {
                  url: s1?.map,
                },
              },
              {
                title: s2?.name,
                image: {
                  url: s2?.map,
                },
              },
            ],
          },
        });
      }
    }
    console.log(payload.type, payload);
    return new Response("ok");
  },
});
