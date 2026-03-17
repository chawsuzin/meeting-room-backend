const express = require("express");
const prisma = require("../database");

const router = express.Router();

// GET all users (Admin only)
router.get("/", async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

// CREATE user (Admin only)
router.post("/", async (req, res) => {
  const currentUserId = Number(req.headers["x-user-id"]);
  const currentUser = await prisma.user.findUnique({
    where: { id: currentUserId },
  });

  if (!currentUser || currentUser.role !== "ADMIN") {
    return res.status(403).json({ error: "Only admin can create users" });
  }

  const { name, role } = req.body;
  const user = await prisma.user.create({ data: { name, role } });
  res.json(user);
});

// CHANGE user role (Admin only)
router.put("/:id/role", async (req, res) => {
  const currentUserId = Number(req.headers["x-user-id"]);
  const currentUser = await prisma.user.findUnique({
    where: { id: currentUserId },
  });

  if (!currentUser || currentUser.role !== "ADMIN") {
    return res.status(403).json({ error: "Only Admin can change roles" });
  }

  const userIdToChange = Number(req.params.id);
  const { role } = req.body;

  if (!["ADMIN", "OWNER", "USER"].includes(role)) {
    return res.status(400).json({ error: "Invalid role" });
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userIdToChange },
      data: { role },
    });
    res.json(updatedUser);
  } catch (err) {
    res.status(404).json({ error: "User not found" });
  }
});

// DELETE user (Admin only)
router.delete("/:id", async (req, res) => {
  const currentUserId = Number(req.headers["x-user-id"]);
  const currentUser = await prisma.user.findUnique({
    where: { id: currentUserId },
  });

  if (!currentUser || currentUser.role !== "ADMIN") {
    return res.status(403).json({ error: "Only admin can delete users" });
  }

  try {
    await prisma.user.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(404).json({ error: "User not found" });
  }
});

module.exports = router;
