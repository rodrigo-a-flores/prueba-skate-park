import { Router } from 'express';
import { getSkaters, createSkaters, updateSkaters, deleteSkaters, loginSkater, updateSkaterStatus, logout } from '../Persistance/User.js';
const router = Router();

router.get("/skaters", getSkaters);

router.post("/skaters/login", loginSkater);

router.post("/skaters", createSkaters);

router.put("/skaters/:id/status", updateSkaterStatus);

router.post('/users/logout', logout);

router.put("/skaters/:id", updateSkaters);

router.delete("/skaters/:id", deleteSkaters);

export default router;