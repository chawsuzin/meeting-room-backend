const express = require("express");
const prisma = require("../database"); 

const router = express.Router();

// GET all users (Admin only)
router.get("/", async (req, res) => {
  try {
    console.log("Fetching all users...");
    const users = await prisma.user.findMany();
    console.log("Users fetched:", users);
    res.json(users);
  } catch (err) {
    console.error("Database error on GET /users:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// CREATE user (Admin only)
router.post("/", async (req, res) => {
  try {
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
  } catch (err) {
    console.error("Database error on POST /users:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// CHANGE user role (Admin only)
router.put("/:id/role", async (req, res) => {
  try {
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

    const updatedUser = await prisma.user.update({
      where: { id: userIdToChange },
      data: { role },
    });

    res.json(updatedUser);
  } catch (err) {
    console.error("Database error on PUT /users/:id/role:", err);
    if (err.code === "P2025") {
      // Prisma error code for record not found
      res.status(404).json({ error: "User not found" });
    } else {
      res.status(500).json({ error: "Server error", details: err.message });
    }
  }
});

// DELETE user (Admin only)
router.delete("/:id", async (req, res) => {
  try {
    const currentUserId = Number(req.headers["x-user-id"]);
    const currentUser = await prisma.user.findUnique({
      where: { id: currentUserId },
    });

    if (!currentUser || currentUser.role !== "ADMIN") {
      return res.status(403).json({ error: "Only admin can delete users" });
    }

    await prisma.user.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: "User deleted" });
  } catch (err) {
    console.error("Database error on DELETE /users/:id:", err);
    if (err.code === "P2025") {
      res.status(404).json({ error: "User not found" });
    } else {
      res.status(500).json({ error: "Server error", details: err.message });
    }
  }
});

module.exports = router;