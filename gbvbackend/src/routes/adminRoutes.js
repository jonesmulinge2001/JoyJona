const express = require("express");
const db = require("../config/db"); // Import database connection
const authenticateToken = require("../middleware/authMiddleware"); // Import middleware

const router = express.Router();

// 🔒 Protect all routes with `authenticateToken`

// 1️⃣ Get all reported cases (Admin Only)
router.get("/cases", authenticateToken, (req, res) => {
  db.query("SELECT * FROM cases", (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});

// 2️⃣ Get a specific case by ID (Admin Only)
router.get("/cases/:id", authenticateToken, (req, res) => {
  const caseId = req.params.id;

  db.query("SELECT * FROM cases WHERE id = ?", [caseId], (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Database error" });
    }
    if (result.length === 0) {
      return res.status(404).json({ error: "Case not found" });
    }
    res.json(result[0]);
  });
});

// 3️⃣ Update case status (Pending → Solved) (Admin Only)
router.put("/cases/:id", authenticateToken, (req, res) => {
  const caseId = req.params.id;
  const { status } = req.body; // Expected values: "Pending" or "Solved"

  if (!status) {
    return res.status(400).json({ error: "Status is required" });
  }

  db.query("UPDATE cases SET status = ? WHERE id = ?", [status, caseId], (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Database error" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Case not found" });
    }
    res.json({ message: "Case status updated successfully" });
  });
});

// 4️⃣ Delete a reported case by ID (Admin Only)
router.delete("/cases/:id", authenticateToken, (req, res) => {
  const caseId = req.params.id;

  db.query("DELETE FROM cases WHERE id = ?", [caseId], (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Database error" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Case not found" });
    }
    res.json({ message: "Case deleted successfully" });
  });
});

// 5️⃣ Admin can add a response to a case (Admin Only)
router.put("/cases/:id/respond", authenticateToken, (req, res) => {
  const caseId = req.params.id;
  const { adminResponse } = req.body; // Admin's response to the case

  if (!adminResponse) {
    return res.status(400).json({ error: "Admin response is required" });
  }

  db.query(
    "UPDATE cases SET admin_response = ?, response_timestamp = NOW() WHERE id = ?",
    [adminResponse, caseId],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: "Database error" });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Case not found" });
      }
      res.json({ message: "Admin response added successfully" });
    }
  );
});

module.exports = router;
