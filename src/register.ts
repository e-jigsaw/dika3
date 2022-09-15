import "dotenv";

fetch(
  `https://discord.com/api/v10/applications/${
    Deno.env.get("DISCORD_APPLICATION_ID")
  }/guilds/${Deno.env.get("DISCORD_GUILD_ID")}/commands`,
  {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bot ${Deno.env.get("DISCORD_TOKEN")}`,
    },
    method: "PUT",
    body: JSON.stringify([{
      name: "イカ3 マップおしえて",
      type: 3,
    }]),
  },
).then(async (res) => {
  const json = await res.json();
  console.log(json);
});
