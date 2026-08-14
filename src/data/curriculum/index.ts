import type { CurriculumClass } from "@/types/curriculum";

export type NctbCurriculumCatalog = {
  id: string;
  version: string;
  year: number;
  language: "bn" | "en";
  classes: CurriculumClass[];
};

import class1 from "./json/nctb/2026/class-1.json";

export const nctb2026: NctbCurriculumCatalog = {
  id: "nctb-2026",
  version: "2026",
  year: 2026,
  language: "bn",
  classes: [{ ...class1, code: "class-1", order: 1 }],
};
