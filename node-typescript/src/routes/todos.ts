import { Router } from 'express';
import { ToDo } from '../models/todo';

type RequestBody = {
  text: string,
};

const router = Router();

const toDos: ToDo[] = [];

router.get('/', (req, res, next) => {
  res.status(200).json({
    todos: toDos,
  });
});

router.post('/todo', (req, res, next) => {
  const newTodo: ToDo = {
    id: new Date().toISOString(),
    text: (req.body as RequestBody).text,
  };

  toDos.push(newTodo);

  return res.status(201).json({
    message: 'Created ToDo',
  });
});

router.put('/todo/:todoId', (req, res, next) => {
  const id = req.params.todoId;
  const toDoIndex = toDos.findIndex(toDo => toDo.id === id);

  if (toDoIndex !== -1) {
    toDos[toDoIndex] = {
      id: toDos[toDoIndex].id,
      text: (req.body as RequestBody).text,
    };

    return res.status(200).json({
      message: 'Updated ToDo',
    });
  }

  return res.status(404).json({
    message: 'ToDo Not Found',
  });
});

router.delete('/todo/:todoId', (req, res, next) => {
  const id = req.params.todoId;
  const toDoIndex = toDos.findIndex(toDo => toDo.id === id);

  if (toDoIndex !== -1) {
    toDos.splice(toDoIndex, 1);

    return res.status(200).json({
      message: 'Deleted ToDo',
    });
  }

  return res.status(404).json({
    message: 'ToDo Not Found',
  });
});

export default router;
