const express = require("express");
const router = express.Router();
const {
  createBooking,
  getBookings,
  getClientBookings,
  getProviderBookings,
  getBookingById,
  updateBookingStatus,
  updateBooking,
  deleteBooking,
  getBookingsByUser,
  getBookingsByService
} = require("../controllers/bookingController");
const { authenticateToken } = require("../middleware/auth");
const { checkUserRole } = require("../middleware/roleCheck");

// Booking creation
router.post("/", authenticateToken, createBooking);

// Get all bookings (admin only)
router.get("/", authenticateToken, checkUserRole("ADMIN"), getBookings);

// Get bookings for current client
router.get("/client", authenticateToken, checkUserRole("CLIENT"), getClientBookings);

// Get bookings for current service provider
router.get("/provider", authenticateToken, checkUserRole("SERVICE_USER"), getProviderBookings);

// Get booking by ID
router.get("/:id", authenticateToken, getBookingById);

// Update booking status (provider/admin only)
router.patch("/:id/status", authenticateToken, checkUserRole(["SERVICE_USER", "ADMIN"]), updateBookingStatus);

// Full booking update (client/provider/admin)
router.put("/:id", authenticateToken, updateBooking);

// Delete booking
router.delete("/:id", authenticateToken, deleteBooking);

// Get bookings by user ID (admin only)
router.get("/user/:userId", authenticateToken, checkUserRole("ADMIN"), getBookingsByUser);

// Get bookings by service ID (provider/admin)
router.get("/service/:serviceId", authenticateToken, checkUserRole(["SERVICE_USER", "ADMIN"]), getBookingsByService);

module.exports = router;