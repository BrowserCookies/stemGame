import Course from "../models/Course.model.js";
import Generator from "../modules/generate.course.js";

// POST /api/course/suggest
export async function suggestCourse(req, res) {
  try {
    const answers = req.body;
    const suggestion = await Generator.generateSuggestedCourse(answers);
    return res.json({ success: true, suggestion });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

// POST /api/course/generate -> creates Course doc and generates in background
export async function createCourse(req, res) {
  try {
    const { title, prompt, answers } = req.body;
    if (!req.user || !req.user.id) {
      return res
        .status(401)
        .json({ success: false, error: "Authentication required" });
    }
    const createdBy = req.user.id;
    const course = new Course({
      title: title || "Generating...",
      prompt,
      answers,
      status: "generating",
      createdBy,
    });
    await course.save();

    // kick off background generation (don't await)
    (async () => {
      try {
        const map = await Generator.generateFullCourseMap(answers);
        course.generatedMap = map;
        course.title = map.title || course.title;
        course.status = "completed";
        await course.save();
      } catch (err) {
        console.error("Background generation failed", err);
        course.status = "failed";
        await course.save();
      }
    })();

    return res.json({ success: true, courseId: course._id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

// GET /api/course/status/:id
export async function courseStatus(req, res) {
  try {
    const course = await Course.findById(req.params.id).select(
      "status updatedAt createdAt",
    );
    if (!course)
      return res.status(404).json({ success: false, error: "Not found" });
    return res.json({
      success: true,
      status: course.status,
      updatedAt: course.updatedAt,
      createdAt: course.createdAt,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

// GET /api/course/:id
export async function getCourse(req, res) {
  try {
    const course = await Course.findById(req.params.id);
    if (!course)
      return res.status(404).json({ success: false, error: "Not found" });
    return res.json({ success: true, course });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

export default { suggestCourse, createCourse, courseStatus, getCourse };
