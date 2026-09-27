import type { QuestionType } from "./types";

export type FieldErrors = Record<string, string>;

export interface SubjectValues {
  code: string;
  name: string;
}

export interface QuizValues {
  subjectId: string;
  title: string;
  duration: string;
}

export interface LectureValues {
  hasFile: boolean;
  title: string;
}

export interface QuestionValues {
  type: QuestionType;
  prompt: string;
  /** Already resolved by the caller: for TRUE_FALSE this is ["True","False"]. */
  options: string[];
  correct: number[];
}

export function validateSubject(values: SubjectValues): FieldErrors {
  const errors: FieldErrors = {};
  if (values.code.trim().length === 0) {
    errors.code = "Enter a subject code.";
  }
  if (values.name.trim().length === 0) {
    errors.name = "Enter a subject name.";
  }
  return errors;
}

export function validateQuiz(values: QuizValues): FieldErrors {
  const errors: FieldErrors = {};

  if (values.subjectId.length === 0) {
    errors.subjectId = "Choose a subject for this quiz.";
  }
  if (values.title.trim().length === 0) {
    errors.title = "Give the quiz a title.";
  }

  const duration = Number(values.duration);
  if (values.duration.trim().length === 0) {
    errors.duration = "Enter how long the quiz should run.";
  } else if (!Number.isInteger(duration) || duration <= 0) {
    errors.duration = "Duration must be a whole number of 1 minute or more.";
  }

  return errors;
}

export function validateLecture(values: LectureValues): FieldErrors {
  const errors: FieldErrors = {};
  if (!values.hasFile) {
    errors.file = "Choose a PDF to upload.";
  }
  if (values.title.trim().length === 0) {
    errors.title = "Enter a lecture title.";
  }
  return errors;
}

export function validateQuestion(values: QuestionValues): FieldErrors {
  const errors: FieldErrors = {};
  const options = values.options;
  const trimmed = options.map((option) => option.trim());

  if (values.prompt.trim().length === 0) {
    errors.prompt = "Enter the question you want to ask.";
  }

  if (trimmed.length < 2) {
    errors.options = "Add at least two answer options.";
  } else {
    const blankIndex = trimmed.findIndex((option) => option.length === 0);
    if (blankIndex !== -1) {
      errors.options = `Option ${blankIndex + 1} is empty.`;
    } else {
      const seen = new Set<string>();
      const duplicateIndex = trimmed.findIndex((option) => {
        const key = option.toLowerCase();
        if (seen.has(key)) return true;
        seen.add(key);
        return false;
      });
      if (duplicateIndex !== -1) {
        errors.options = `Option ${duplicateIndex + 1} duplicates another option.`;
      }
    }
  }

  const outOfRange = values.correct.some(
    (index) => index < 0 || index >= options.length,
  );

  if (outOfRange) {
    errors.correct = "A ticked answer no longer exists. Review the options.";
  } else if (values.correct.length === 0) {
    errors.correct = "Tick the correct answer.";
  } else if (values.type !== "MULTI_SELECT" && values.correct.length > 1) {
    errors.correct = "This question type allows only one correct answer.";
  }

  return errors;
}

export function hasErrors(errors: FieldErrors): boolean {
  return Object.keys(errors).length > 0;
}
