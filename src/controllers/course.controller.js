import Course from "../models/Course.model.js";
import Generator from "../modules/generate.course.js";
import redis from "../clients/redis.js";

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

    (async () => {
      try {
        const map = await Generator.generateFullCourseMap(answers);
        course.generatedMap = map;
        course.title = map.title || course.title;
        course.status = "completed";
        await course.save();

        try {
          await redis.set(
            `course:${course._id}`,
            JSON.stringify(course.toObject()),
            { ex: 3600 },
          );
        } catch (e) {
          console.warn("Failed to set course cache", e);
        }
      } catch (err) {
        console.error("Background generation failed", err);
        course.status = "failed";
        await course.save();
        try {
          await redis.set(
            `course:${course._id}`,
            JSON.stringify(course.toObject()),
            { ex: 3600 },
          );
        } catch (e) {
          console.warn("Failed to set course cache after failure", e);
        }
      }
    })();

    return res.json({ success: true, courseId: course._id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function courseStatus(req, res) {
  try {
    const id = req.params.id;
    const cached = await redis.get(`course:${id}`);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        return res.json({
          success: true,
          status: parsed.status,
          updatedAt: parsed.updatedAt,
          createdAt: parsed.createdAt,
        });
      } catch (e) {
        console.warn(
          "Failed to parse cached course for status, falling back to DB",
          e,
        );
      }
    }

    const course = await Course.findById(id).select(
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

export async function getCourse(req, res) {
  try {
    const id = req.params.id;
    const cached = await redis.get(`course:${id}`);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        return res.json({ success: true, course: parsed });
      } catch (e) {
        console.warn("Failed to parse cached course, falling back to DB", e);
      }
    }

    const course = await Course.findById(id);
    if (!course)
      return res.status(404).json({ success: false, error: "Not found" });

    try {
      await redis.set(`course:${id}`, JSON.stringify(course.toObject()), {
        ex: 3600,
      });
    } catch (e) {
      console.warn("Failed to set course cache", e);
    }

    return res.json({ success: true, course });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

export default { suggestCourse, createCourse, courseStatus, getCourse };
