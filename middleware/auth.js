const prisma = require("../database");

const auth = async (req, res, next) => {
  const userId = req.headers["x-user-id"];
  if (!userId) return res.status(401).json({ error: "Identity required" });

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return res.status(401).json({ error: "User not found" });

  req.user = user;
  next();
};

module.exports = auth;
