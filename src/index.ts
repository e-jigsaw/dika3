import { serve } from "https://deno.land/std@0.155.0/http/server.ts";

serve((req) => {
  console.log(req);
  return new Response("ok", {
    headers: { "content-type": "text/plain" },
  });
});
