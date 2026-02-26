const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { admin } = require("../middleware/adminMiddleware");
const Loan = require("../models/Loan");
const User = require("../models/User");

/* =========================================================
   📊 Admin Dashboard Analytics
   @route   GET /api/admin/analytics
   @access  Private/Admin
========================================================= */
router.get("/analytics", protect, admin, async (req, res) => {
    try {
        const totalLoans = await Loan.countDocuments();
        const approvedLoans = await Loan.countDocuments({ status: "Approved" });
        const pendingLoans = await Loan.countDocuments({ status: "Pending" });
        const rejectedLoans = await Loan.countDocuments({ status: "Rejected" });

        const totalApprovedAmount = await Loan.aggregate([
            { $match: { status: "Approved" } },
            { $group: { _id: null, total: { $sum: "$approvedAmount" } } }
        ]);

        // Risk distribution based on credit score
        const riskDistributionRaw = await Loan.aggregate([
            {
                $bucket: {
                    groupBy: "$creditScore",
                    boundaries: [300, 600, 750, 900],
                    default: "Other",
                    output: { count: { $sum: 1 } }
                }
            }
        ]);

        const riskDistribution = {
            highRisk: riskDistributionRaw.find(r => r._id === 300)?.count || 0,
            mediumRisk: riskDistributionRaw.find(r => r._id === 600)?.count || 0,
            lowRisk: riskDistributionRaw.find(r => r._id === 750)?.count || 0
        };

        res.json({
            totalLoans,
            approvedLoans,
            pendingLoans,
            rejectedLoans,
            totalApprovedAmount: totalApprovedAmount[0]?.total || 0,
            riskDistribution
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Analytics fetch failed" });
    }
});

/* =========================================================
   📄 Get All Loans
   @route   GET /api/admin/loans
   @access  Private/Admin
========================================================= */
router.get("/loans", protect, admin, async (req, res) => {
    try {
        const loans = await Loan.find({})
            .populate("userId", "username email")
            .sort({ createdAt: -1 });

        res.json(loans);

    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
});

/* =========================================================
   ✏ Update Loan Status
   @route   PUT /api/admin/loan/:id
   @access  Private/Admin
========================================================= */
router.put("/loan/:id", protect, admin, async (req, res) => {
    try {
        const { status, rejectionReason, approvedAmount } = req.body;

        const loan = await Loan.findById(req.params.id);

        if (!loan) {
            return res.status(404).json({ message: "Loan not found" });
        }

        loan.status = status;

        if (status === "Rejected") {
            loan.rejectionReason = rejectionReason || "Rejected by Admin";
        }

        if (status === "Approved") {
            loan.approvedAmount = approvedAmount || loan.approvedAmount;
        }

        await loan.save();

        res.json(loan);

    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
});

/* =========================================================
   👥 Get All Users
   @route   GET /api/admin/users
   @access  Private/Admin
========================================================= */
router.get("/users", protect, admin, async (req, res) => {
    try {
        const users = await User.find().select("-password -otp -otpExpiry");
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
});

module.exports = router;
