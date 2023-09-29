"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
const toDos = [];
router.get('/', (req, res, next) => {
    res.status(200).json({
        todos: toDos,
    });
});
router.post('/todo', (req, res, next) => {
    const newTodo = {
        id: new Date().toISOString(),
        text: req.body.text,
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
            text: req.body.text,
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
exports.default = router;
