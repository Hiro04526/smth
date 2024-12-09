import { z } from "zod";

export const DaysEnumSchema = z.enum(["M", "T", "W", "H", "F", "S"]);
export type DaysEnum = z.infer<typeof DaysEnumSchema>;

export const ColorsEnumSchema = z.enum([
  "ROSE",
  "PINK",
  "FUCHSIA",
  "PURPLE",
  "VIOLET",
  "INDIGO",
  "BLUE",
  "SKY",
  "CYAN",
  "TEAL",
  "EMERALD",
  "GREEN",
  "LIME",
  "YELLOW",
  "AMBER",
  "ORANGE",
  "RED",
]);

export type ColorsEnum = z.infer<typeof ColorsEnumSchema>;
