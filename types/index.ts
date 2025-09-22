import { Database } from "./database";
import { Doc, Id } from "../convex/_generated/dataModel";

// Legacy Supabase types (for backward compatibility)
export type Settings = Database["public"]["Tables"]["setttings"]["Row"];
export type Node = Database["public"]["Tables"]["nodes"]["Row"];
export type ExtraNode = Database["public"]["Tables"]["nodes_extras"]["Row"];
export type ExtendedNode = Node & { nodes_extras: ExtraNode[] };
export type Type = Database["public"]["Enums"]["type"] | "recent";

// New Convex types
export type ConvexSettings = Doc<"settings">;
export type ConvexNode = Doc<"nodes">;
export type ConvexExtraNode = Doc<"nodes_extras">;
export type ConvexExtendedNode = ConvexNode & { nodes_extras: ConvexExtraNode[] };
export type ConvexType = "recent" | "photo" | "video" | "audio" | "performance" | "installation" | "oil" | "drawing" | "abstract" | "digital" | "sculpture";
