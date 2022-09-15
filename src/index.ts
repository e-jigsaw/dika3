import { json, serve, validateRequest } from "sift";
import {
  InteractionResponseTypes,
  InteractionTypes,
  verifySignature,
} from "discordeno";

type RuleKey = "TURF_WAR" | "AREA" | "LOFT" | "GOAL" | "CLAM";

const SigEd = "X-Signature-Ed25519";
const SigTime = "X-Signature-Timestamp";

const Stages = new Map([
  [1, {
    name: "ユノハナ大渓谷",
    maps: {
      TURF_WAR: "https://i.gyazo.com/20bea4fc3c0379fb73fad0b889923ed5.png",
      AREA: "https://i.gyazo.com/4485ca28315281a489a1e55de628205f.png",
      LOFT: "https://i.gyazo.com/cb2afbba1fd3145f8879cfe9467f4b77.png",
      GOAL: "https://i.gyazo.com/63bd51dc5682e672fdf3f55f795d2ac5.png",
      CLAM: "https://i.gyazo.com/4e412536947bc6f14c9b403b00dbfcf2.png",
    },
  }],
  [2, {
    name: "ゴンズイ地区",
    maps: {
      TURF_WAR: "https://i.gyazo.com/f580626388880f561f333b275ec403a0.png",
      AREA: "https://i.gyazo.com/5bbed3677ecf60ffaed0bf5481c30596.png",
      LOFT: "https://i.gyazo.com/6f8524f6989721a88a5715759775dfe9.png",
      GOAL: "https://i.gyazo.com/5f06fb6ba0397e9b98bbd3c7d649edec.png",
      CLAM: "https://i.gyazo.com/de123175c000078302b7327c9389c342.png",
    },
  }],
  [3, {
    name: "ヤガラ市場",
    maps: {
      TURF_WAR: "https://i.gyazo.com/9bff02b2089388de87cc734d2f9583dd.png",
      AREA: "https://i.gyazo.com/0cf32c7607c6c881c52c84d9ce803bdd.png",
      LOFT: "https://i.gyazo.com/4c0d1992d329e9e21e9cf55e097eb573.png",
      GOAL: "https://i.gyazo.com/2882ec942bd2cc052e44421579a67b05.png",
      CLAM: "https://i.gyazo.com/c7f3a95de45f8dfb5bc2a008dc918c92.png",
    },
  }],
  [4, {
    name: "マテガイ放水路",
    maps: {
      TURF_WAR: "https://i.gyazo.com/73a574724a5f8278fca8afc6f9bb7898.png",
      AREA: "https://i.gyazo.com/c784bacae08f91b2510dc9151696411f.png",
      LOFT: "https://i.gyazo.com/4d7c380c32cb13d63da638dbfeb181f1.png",
      GOAL: "https://i.gyazo.com/cd3f771a1fdd84f09d41d2cd1a90497f.png",
      CLAM: "https://i.gyazo.com/6a77ead084ca3970cad1cd9c4f21fcf5.png",
    },
  }],
  [6, {
    name: "ナメロウ金属",
    maps: {
      TURF_WAR: "https://i.gyazo.com/e69bc5797494c3718e8b8126def9ab19.png",
      AREA: "https://i.gyazo.com/330155beb5960ee7607ce2d893ec7ceb.png",
      LOFT: "https://i.gyazo.com/b902b5bc65c725638c727d1692f6640b.png",
      GOAL: "https://i.gyazo.com/bbf9aeb1647374622f82d4903cc2b944.png",
      CLAM: "https://i.gyazo.com/de69e031267679dc670b89073f4c2a2c.png",
    },
  }],
  [10, {
    name: "マサバ海峡大橋",
    maps: {
      TURF_WAR: "https://i.gyazo.com/f3c44f418e82300585f9de8b92fdbc70.png",
      AREA: "https://i.gyazo.com/65eed8236b01d15f535b5c5335179f28.png",
      LOFT: "https://i.gyazo.com/de12d316b2f485982cb529491a01d020.png",
      GOAL: "https://i.gyazo.com/6f77fd99e54551d1d151dbc306c710b6.png",
      CLAM: "https://i.gyazo.com/796bb05fb8278de43b6ea7413bf2698c.png",
    },
  }],
  [11, {
    name: "キンメダイ美術館",
    maps: {
      TURF_WAR: "https://i.gyazo.com/7b8d3ad2949e1e42c47066fdf2754d3d.png",
      AREA: "https://i.gyazo.com/686530bcf8fef34c866b583467d2f960.png",
      LOFT: "https://i.gyazo.com/e3e8687efa0e8d317d8574e99ef1ec6e.png",
      GOAL: "https://i.gyazo.com/81d2e5031da08c8bf3b63a877b7f876f.png",
      CLAM: "https://i.gyazo.com/f439b8549ca4c36aff91b5d3e85f86b8.png",
    },
  }],
  [12, {
    name: "マヒマヒリゾート＆スパ",
    maps: {
      TURF_WAR: "https://i.gyazo.com/29e3fbc4cffc08f3f61055c1a8229875.png",
      AREA: "https://i.gyazo.com/248fcf4b43d8d529fdf7434e6fe28da2.png",
      LOFT: "https://i.gyazo.com/abb675a0ab4d8a5ea49d32aea0323027.png",
      GOAL: "https://i.gyazo.com/3da257b74804a2e569302e8c2c08da08.png",
      CLAM: "https://i.gyazo.com/4b52069f8ebc219072335f974ed8e24c.png",
    },
  }],
  [13, {
    name: "海女美術大学",
    maps: {
      TURF_WAR: "https://i.gyazo.com/49f2f3f092856d6e7b1ca6a81b03bde7.png",
      AREA: "https://i.gyazo.com/c33a507289ef447779f1f3b44101e509.png",
      LOFT: "https://i.gyazo.com/d1eec6dbd53386c12a45e85e388d8049.png",
      GOAL: "https://i.gyazo.com/e0cdc1527c74221da0b948c724bc3ec0.png",
      CLAM: "https://i.gyazo.com/cd2d18b26cd4ee868ae9dbdca38651c4.png",
    },
  }],
  [14, {
    name: "チョウザメ造船",
    maps: {
      TURF_WAR: "https://i.gyazo.com/57232bc919b203de76845b12328ffb73.png",
      AREA: "https://i.gyazo.com/4130fb060666697135c1b87b36b8003a.png",
      LOFT: "https://i.gyazo.com/94e0314c6e73ec81d7c6500179ae2f75.png",
      GOAL: "https://i.gyazo.com/0ad8ae1a5656e7d6e6079eb311acbdcd.png",
      CLAM: "https://i.gyazo.com/8e19992773f03ec1f4a10a4b69bd213b.png",
    },
  }],
  [15, {
    name: "ザトウマーケット",
    maps: {
      TURF_WAR: "https://i.gyazo.com/ff18761975253f5354beb2ae4f0bcefe.png",
      AREA: "https://i.gyazo.com/38341851a27ee090b3672a4fb1727af2.png",
      LOFT: "https://i.gyazo.com/f592b7a1e08925855ec3fcbe0a5d8a03.png",
      GOAL: "https://i.gyazo.com/08dcd50e9132f64ad2f04051c44baaf1.png",
      CLAM: "https://i.gyazo.com/b650adc77663c453ad93cef94f7bdeaa.png",
    },
  }],
  [16, {
    name: "スメーシーワールド",
    maps: {
      TURF_WAR: "https://i.gyazo.com/c691f71fe53921ed4ee30e621aeae6a8.png",
      AREA: "https://i.gyazo.com/c43f5894634f02adc564854c488d56f2.png",
      LOFT: "https://i.gyazo.com/37e288709c3e02125f62713c395d12b8.png",
      GOAL: "https://i.gyazo.com/5739efbfe75c37fa19e8506a24b270e0.png",
      CLAM: "https://i.gyazo.com/cf44b1cd1fd6945db6d8ea87120f6b61.png",
    },
  }],
]);

const components = [
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
];

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
                components,
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
        const { results: [{ stages, rule }] } = await res.json();
        const s1 = Stages.get(stages[0].id);
        const s2 = Stages.get(stages[1].id);
        console.log(stages);
        return json({
          type: InteractionResponseTypes.ChannelMessageWithSource,
          data: {
            content: `${p2 === "now" ? "今の" : "次の"}${
              p1 === "regular" ? "ナワバリ" : ""
            }${p1 === "bankara-challenge" ? `バンカラ(チャレンジ)は${rule.name}` : ""}${
              p1 === "bankara-open" ? `バンカラ(オープン)は${rule.name}` : ""
            }`,
            embeds: [
              {
                title: s1?.name,
                image: {
                  url: s1?.maps[rule.key as RuleKey],
                },
              },
              {
                title: s2?.name,
                image: {
                  url: s2?.maps[rule.key as RuleKey],
                },
              },
            ],
            components,
          },
        });
      }
    }
    console.log(payload.type, payload);
    return new Response("ok");
  },
});
