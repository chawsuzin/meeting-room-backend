const express = require("express");
const prisma = require("../database");

const router = express.Router();

router.get("/", async (req, res) => {
  const bookings = await prisma.booking.findMany({
    include: { user: true },
  });

  res.json(bookings);
});

// GET /api/bookings/summary
router.get("/summary", async (req, res) => {
  const currentUserId = Number(req.headers["x-user-id"]);

  const user = await prisma.user.findUnique({
    where: { id: currentUserId },
  });

  if (!user) return res.status(401).json({ error: "User not found" });

  if (user.role !== "OWNER" && user.role !== "ADMIN") {
    return res.status(403).json({ error: "Permission denied" });
  }

  // Aggregate bookings per user
  const summary = await prisma.user.findMany({
    include: {
      bookings: true,
    },
  });

  const result = summary.map((u) => ({
    userId: u.id,
    userName: u.name,
    role: u.role,
    totalBookings: u.bookings.length,
    bookings: u.bookings,
  }));

  res.json(result);
});

router.post("/", async (req, res) => {
  const userId = Number(req.headers["x-user-id"]);

  const { startTime, endTime } = req.body;

  const start = new Date(startTime);
  const end = new Date(endTime);

  if (start >= end) {
    return res.status(400).json({ error: "Invalid time range" });
  }

  const overlap = await prisma.booking.findFirst({
    where: {
      AND: [{ startTime: { lt: end } }, { endTime: { gt: start } }],
    },
  });

  if (overlap) {
    return res.status(400).json({
      error: "Booking overlap",
    });
  }

  const booking = await prisma.booking.create({
    data: {
      userId,
      startTime: start,
      endTime: end,
    },
  });

  res.json(booking);
});

router.delete("/:id", async (req, res) => {
  const userId = Number(req.headers["x-user-id"]);

  const booking = await prisma.booking.findUnique({
    where: { id: Number(req.params.id) },
    include: { user: true },
  });

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (user.role === "USER" && booking.userId !== userId) {
    return res.status(403).json({ error: "Permission denied" });
  }

  await prisma.booking.delete({
    where: { id: booking.id },
  });

  res.json({ message: "Booking deleted" });
});

module.exports = router;
