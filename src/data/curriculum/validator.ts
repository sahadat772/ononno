import type { NctbCurriculumCatalog } from "./index";

export function validateCurriculum(curriculum: NctbCurriculumCatalog): boolean {
  if (!curriculum.classes.length) {
    throw new Error("Curriculum contains no classes.");
  }

  return true;
}
