import { serve } from 'https://deno.land/std/http/server.ts';

const server = serve(
  (_req) => {
    return new Response("Hello, world");
  },
  {
    port: 3000,
  },
);

