import express from "express";
import * as userController from "../controllers/user.controller";
import authenticateMiddleware from "../../middlewares/authMiddleware";
import authorizationMiddleware from "../../middlewares/authorizeMiddleware";

const router = express.Router();

router.post("/register", userController.register);
router.post("/login", userController.login);
router.post("/forgot-password", userController.forgotPassword);
router.post("/reset-password", userController.authOTP);

router.get("/profile", authenticateMiddleware, userController.getUserProfile);

router.get("/", authenticateMiddleware, authorizationMiddleware("Admin"), userController.getUsers);
router.get("/:id", authenticateMiddleware, authorizationMiddleware("Admin"), userController.getUserById);

export default router;