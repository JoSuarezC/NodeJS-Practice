import { Router } from 'https://deno.land/x/oak@v12.4.0/router.ts';

const router = new Router();

interface ToDo {
  id: string;
  text: string;
};

interface TodoRequestBody {
  text: string;
};

const todos: ToDo[] = [];

router.get('/todos', (ctx) => {
  ctx.response.body = { todos: todos };
});

router.post('/todos', async (ctx) => {
  const data = await ctx.request.body().value as TodoRequestBody;
  const newTodo: ToDo = {
    id: new Date().toISOString(), 
    text: data.text,
  };

  todos.push(newTodo);

  ctx.response.body = {
    message: 'Created todo',
    todo: newTodo,
  };
});

router.put('/todos/:todoId', async (ctx) => {
  const todoId = ctx.params.todoId;
  const data = await ctx.request.body().value as TodoRequestBody;
  const todo = todos.find(todo => todo.id === todoId);

  if (todo) {
    todo.text = data.text;
  }

  ctx.response.body = {
    message: 'Updated todo',
    todo: todo,
  };
});

router.delete('/todos/:todoId', (ctx) => {
  const todoId = ctx.params.todoId;
  const todoIndex = todos.findIndex(todo => todo.id === todoId);
  todos.splice(todoIndex, 1);

  ctx.response.body = {
    message: 'Deleted todo',
  };
});

export default router;
