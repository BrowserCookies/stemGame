import express from "express";
import * as CourseCtrl from "../controllers/course.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/suggest", CourseCtrl.suggestCourse);
router.post("/generate", verifyToken, CourseCtrl.createCourse);
router.get("/status/:id", CourseCtrl.courseStatus);
router.get("/:id", CourseCtrl.getCourse);

export default router;
