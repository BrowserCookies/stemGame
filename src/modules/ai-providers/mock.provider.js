// Mock provider used when no real provider is selected or configured.
export async function call(prompt) {
  return {
    title: "Intro to Practical JavaScript",
    outline: [
      { level: 1, title: "Basics", tasks: ["Variables", "Control flow"] },
      {
        level: 2,
        title: "DOM & Events",
        tasks: ["DOM selection", "Event handling"],
      },
    ],
    raw: { mocked: true, prompt },
  };
}

export default { call };
