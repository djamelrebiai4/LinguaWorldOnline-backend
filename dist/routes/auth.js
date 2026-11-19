"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const rateLimit_1 = require("../middleware/rateLimit");
const router = (0, express_1.Router)();
router.get('/me', rateLimit_1.generalRateLimit, auth_1.authMiddleware, (req, res) => {
    const authenticatedReq = req;
    res.json({
        userId: authenticatedReq.userId,
        email: authenticatedReq.userEmail,
    });
});
exports.default = router;
