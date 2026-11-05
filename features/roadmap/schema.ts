import { z } from "zod";

export const roadmapDomainEnum = z.enum([
  "dsa",
  "programming_java",
  "oop",
  "sql",
  "dbms",
  "os",
  "networks",
  "system_design",
  "aptitude",
]);
export type RoadmapDomain = z.infer<typeof roadmapDomainEnum>;

export const roadmapTopicSchema = z.object({
  id: z.string().uuid(),
  slug: z.string().min(1),
  name: z.string().min(1),
  domain: roadmapDomainEnum,
  description: z.string().nullable(),
  sort_order: z.number().int().nonnegative(),
  estimated_minutes: z.number().int().positive(),
  is_active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type RoadmapTopic = z.infer<typeof roadmapTopicSchema>;

export const roadmapDependencySchema = z.object({
  topic_id: z.string().uuid(),
  prerequisite_topic_id: z.string().uuid(),
  created_at: z.string(),
});
export type RoadmapDependency = z.infer<typeof roadmapDependencySchema>;

