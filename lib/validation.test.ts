import { describe, expect, it } from "vitest";
import {
  hasErrors,
  validateLecture,
  validateQuestion,
  validateQuiz,
  validateSubject,
} from "./validation";
import type { QuestionType } from "./types";

const TRUE_FALSE = ["True", "False"];

describe("hasErrors", () => {
  it("is false for an empty map", () => {
    expect(hasErrors({})).toBe(false);
  });

  it("is true when any key is present", () => {
    expect(hasErrors({ code: "required" })).toBe(true);
  });
});

describe("validateSubject", () => {
  it("passes when both fields are filled", () => {
    expect(validateSubject({ code: "CS101", name: "Programming" })).toEqual({});
  });

  it("requires a code", () => {
    expect(validateSubject({ code: "  ", name: "Programming" })).toEqual({
      code: "Enter a subject code.",
    });
  });

  it("requires a name", () => {
    expect(validateSubject({ code: "CS101", name: "" })).toEqual({
      name: "Enter a subject name.",
    });
  });

  it("reports both at once", () => {
    expect(validateSubject({ code: "", name: "" })).toEqual({
      code: "Enter a subject code.",
      name: "Enter a subject name.",
    });
  });
});

describe("validateQuiz", () => {
  const valid = { subjectId: "sub-1", title: "Algebra", duration: "10" };

  it("passes a valid quiz", () => {
    expect(validateQuiz(valid)).toEqual({});
  });

  it("requires a subject", () => {
    expect(validateQuiz({ ...valid, subjectId: "" })).toEqual({
      subjectId: "Choose a subject for this quiz.",
    });
  });

  it("requires a title", () => {
    expect(validateQuiz({ ...valid, title: "   " })).toEqual({
      title: "Give the quiz a title.",
    });
  });

  it("requires a duration to be present", () => {
    expect(validateQuiz({ ...valid, duration: "" })).toEqual({
      duration: "Enter how long the quiz should run.",
    });
  });

  it.each(["0", "-5", "1.5", "abc"])(
    "rejects the duration %s",
    (duration) => {
      expect(validateQuiz({ ...valid, duration })).toEqual({
        duration: "Duration must be a whole number of 1 minute or more.",
      });
    },
  );

  it("accepts a duration of one", () => {
    expect(validateQuiz({ ...valid, duration: "1" })).toEqual({});
  });
});

describe("validateLecture", () => {
  it("passes when a file and title are present", () => {
    expect(validateLecture({ hasFile: true, title: "Lecture 1" })).toEqual({});
  });

  it("requires a file", () => {
    expect(validateLecture({ hasFile: false, title: "Lecture 1" })).toEqual({
      file: "Choose a PDF to upload.",
    });
  });

  it("requires a title", () => {
    expect(validateLecture({ hasFile: true, title: " " })).toEqual({
      title: "Enter a lecture title.",
    });
  });
});

describe("validateQuestion", () => {
  const build = (overrides: Partial<Parameters<typeof validateQuestion>[0]> = {}) => ({
    type: "MULTIPLE_CHOICE" as QuestionType,
    prompt: "What is 2 + 2?",
    options: ["3", "4"],
    correct: [1],
    ...overrides,
  });

  it("passes a valid single choice question", () => {
    expect(validateQuestion(build())).toEqual({});
  });

  it("requires a prompt", () => {
    expect(validateQuestion(build({ prompt: "   " }))).toEqual({
      prompt: "Enter the question you want to ask.",
    });
  });

  it("requires at least two options", () => {
    expect(validateQuestion(build({ options: ["only"] }))).toMatchObject({
      options: "Add at least two answer options.",
    });
  });

  it("reports which option is empty", () => {
    expect(validateQuestion(build({ options: ["3", "  ", "5"] }))).toMatchObject({
      options: "Option 2 is empty.",
    });
  });

  it("rejects duplicate options regardless of case", () => {
    expect(validateQuestion(build({ options: ["Yes", "yes"] }))).toMatchObject({
      options: "Option 2 duplicates another option.",
    });
  });

  it("allows options that differ only by surrounding whitespace", () => {
    expect(validateQuestion(build({ options: ["Yes", " No "] }))).toEqual({});
  });

  it("requires a correct answer to be ticked", () => {
    expect(validateQuestion(build({ correct: [] }))).toMatchObject({
      correct: "Tick the correct answer.",
    });
  });

  it("allows only one correct answer for single choice", () => {
    expect(validateQuestion(build({ correct: [0, 1] }))).toMatchObject({
      correct: "This question type allows only one correct answer.",
    });
  });

  it("allows several correct answers for multi select", () => {
    expect(
      validateQuestion(build({ type: "MULTI_SELECT", correct: [0, 1] })),
    ).toEqual({});
  });

  it("flags a ticked index that no longer exists", () => {
    expect(validateQuestion(build({ options: ["3"], correct: [1] }))).toMatchObject(
      { correct: "A ticked answer no longer exists. Review the options." },
    );
  });

  it("accepts the fixed True/False options", () => {
    expect(
      validateQuestion(
        build({ type: "TRUE_FALSE", options: TRUE_FALSE, correct: [0] }),
      ),
    ).toEqual({});
  });

  it("reports every broken rule at once", () => {
    const errors = validateQuestion(
      build({ prompt: "", options: ["same", "same"], correct: [] }),
    );

    expect(Object.keys(errors).sort()).toEqual([
      "correct",
      "options",
      "prompt",
    ]);
  });
});
