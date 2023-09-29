import { Application } from 'https://deno.land/x/oak@v12.4.0/application.ts';
import router from './routes/todos.ts';

const app = new Application();

app.use(router.routes());
app.use(router.allowedMethods());

await app.listen({ port: 3000 });
