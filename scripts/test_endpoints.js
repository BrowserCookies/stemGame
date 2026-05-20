(async () => {
  const base = "http://localhost:8888";
  const out = (label, data) =>
    console.log(`--- ${label} ---\n${JSON.stringify(data, null, 2)}\n`);

  try {
    // 1. GET /api/date
    const d1 = await (await fetch(`${base}/api/date`)).json();
    out("GET /api/date", d1);

    // 2. Register + login
    const t = Date.now();
    const user = `apitest${t}`;
    const regRes = await (
      await fetch(`${base}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: user,
          email: `${user}@example.com`,
          password: "Password123",
        }),
      })
    ).json();
    out("POST /api/auth/register", regRes);

    const loginRes = await (
      await fetch(`${base}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: user, password: "Password123" }),
      })
    ).json();
    out("POST /api/auth/login", loginRes);

    const token = loginRes.token;

    // 3. GET /api/auth/me
    const meRes = await (
      await fetch(`${base}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
    ).json();
    out("GET /api/auth/me", meRes);

    // 4. POST /api/course/suggest
    const suggest = await (
      await fetch(`${base}/api/course/suggest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ q1: "web dev", level: "beginner" }),
      })
    ).json();
    out("POST /api/course/suggest", suggest);

    // 5. POST /api/course/generate (authenticated)
    const gen = await (
      await fetch(`${base}/api/course/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ answers: { q1: "web dev", level: "beginner" } }),
      })
    ).json();
    out("POST /api/course/generate", gen);

    const courseId = gen.courseId;
    // 6. Poll status
    await new Promise((r) => setTimeout(r, 1000));
    const status = await (
      await fetch(`${base}/api/course/status/${courseId}`)
    ).json();
    out(`GET /api/course/status/${courseId}`, status);

    const course = await (await fetch(`${base}/api/course/${courseId}`)).json();
    out(`GET /api/course/${courseId}`, course);

    // 7. GET /db/get-user?auth=fake
    try {
      const gu = await (
        await fetch(`${base}/db/get-user?auth=fake_auth_value`)
      ).text();
      out("GET /db/get-user?auth=fake_auth_value", gu);
    } catch (e) {
      out("GET /db/get-user?auth=fake_auth_value", { error: e.message });
    }

    // 8. POST /db/set-user?userData=BASE64
    const userData = {
      firstName: "Api",
      lastName: "User",
      username: `setuser${t}`,
      email: `setuser${t}@example.com`,
      password: "Password123",
    };
    const b64 = Buffer.from(JSON.stringify(userData), "utf8").toString(
      "base64",
    );
    const setRes = await (
      await fetch(`${base}/db/set-user?userData=${encodeURIComponent(b64)}`, {
        method: "POST",
      })
    ).json();
    out("POST /db/set-user", setRes);

    console.log("TESTS_DONE");
  } catch (err) {
    console.error("TEST_ERROR", err);
    process.exit(2);
  }
})();
