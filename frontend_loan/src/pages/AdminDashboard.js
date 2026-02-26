import React, { useEffect, useState } from "react";
import AdminAPI from "../adminApi";

const AdminDashboard = () => {
    const [summary, setSummary] = useState({
        totalLoans: 0,
        approvedLoans: 0,
        rejectedLoans: 0,
        pendingLoans: 0,
        totalApprovedAmount: 0,
    });

    const [loans, setLoans] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const summaryRes = await AdminAPI.get("/admin/analytics");
            const loansRes = await AdminAPI.get("/admin/loans");

            setSummary(summaryRes.data);
            setLoans(loansRes.data);
        } catch (error) {
            console.error("Admin fetch error:", error);
        }
    };

    /* ================= RISK DISTRIBUTION ================= */

    const riskCount = (type) => {
        if (type === "high")
            return loans.filter((l) => l.creditScore < 600).length;

        if (type === "medium")
            return loans.filter(
                (l) => l.creditScore >= 600 && l.creditScore <= 750
            ).length;

        if (type === "low")
            return loans.filter((l) => l.creditScore > 750).length;
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

            {/* ================= TOP CARDS ================= */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">

                {/* TOTAL LOANS */}
                <div className="bg-white shadow rounded-xl p-6">
                    <h3 className="text-gray-500 text-sm">TOTAL LOANS</h3>

                    <h2 className="text-3xl font-bold">
                        {summary.totalLoans}
                    </h2>

                    <p className="text-green-600 text-sm">
                        Approved: {summary.approvedLoans}
                    </p>

                    <p className="text-red-600 text-sm">
                        Rejected: {summary.rejectedLoans}
                    </p>

                    <p className="text-yellow-600 text-sm">
                        Pending: {summary.pendingLoans}
                    </p>
                </div>

                {/* TOTAL APPROVED AMOUNT */}
                <div className="bg-white shadow rounded-xl p-6">
                    <h3 className="text-gray-500 text-sm">
                        TOTAL APPROVED AMOUNT
                    </h3>

                    <h2 className="text-3xl font-bold">
                        ₹{summary.totalApprovedAmount}
                    </h2>

                    <p className="text-gray-500 text-sm">
                        Disbursed to farmers
                    </p>
                </div>

                {/* RISK DISTRIBUTION */}
                <div className="bg-white shadow rounded-xl p-6">
                    <h3 className="text-gray-500 text-sm">
                        RISK DISTRIBUTION
                    </h3>

                    <div className="flex justify-between mt-4">
                        <div className="bg-red-100 text-red-600 px-4 py-2 rounded-lg text-center">
                            <p className="text-lg font-bold">
                                {riskCount("high")}
                            </p>
                            <p className="text-xs">High (&lt;600)</p>
                        </div>

                        <div className="bg-yellow-100 text-yellow-600 px-4 py-2 rounded-lg text-center">
                            <p className="text-lg font-bold">
                                {riskCount("medium")}
                            </p>
                            <p className="text-xs">Medium (600–750)</p>
                        </div>

                        <div className="bg-green-100 text-green-600 px-4 py-2 rounded-lg text-center">
                            <p className="text-lg font-bold">
                                {riskCount("low")}
                            </p>
                            <p className="text-xs">Low (&gt;750)</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ================= RECENT APPLICATIONS TABLE ================= */}
            <div className="bg-white shadow rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-4">
                    Recent Applications
                </h2>

                <table className="w-full text-left">
                    <thead className="border-b">
                        <tr className="text-gray-500 text-sm">
                            <th>Applicant</th>
                            <th>Amount</th>
                            <th>Credit Score</th>
                            <th>Approved Amount</th>
                            <th>Status</th>
                        </tr>
                    </thead>

                    <tbody>
                        {loans.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="text-center py-6 text-gray-500">
                                    No loan applications found.
                                </td>
                            </tr>
                        ) : (
                            loans.map((loan) => (
                                <tr key={loan._id} className="border-b">
                                    <td>{loan.fullName}</td>
                                    <td>₹{loan.loanAmount}</td>
                                    <td>{loan.creditScore}</td>
                                    <td>₹{loan.approvedAmount}</td>
                                    <td
                                        className={
                                            loan.status === "Approved"
                                                ? "text-green-600 font-semibold"
                                                : loan.status === "Rejected"
                                                    ? "text-red-600 font-semibold"
                                                    : "text-yellow-600 font-semibold"
                                        }
                                    >
                                        {loan.status}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminDashboard;
