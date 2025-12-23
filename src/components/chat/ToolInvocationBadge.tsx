"use client";

import { Loader2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ToolInvocation {
  toolCallId: string;
  toolName: string;
  args: {
    command?: string;
    path?: string;
    new_path?: string;
    [key: string]: unknown;
  };
  state: "pending" | "streaming" | "result" | "partial-call";
  result?: unknown;
}

export interface ToolInvocationBadgeProps {
  toolInvocation: ToolInvocation;
  className?: string;
}

function getFileName(path: string): string {
  if (!path) return "file";
  const segments = path.split("/");
  return segments[segments.length - 1] || "file";
}

function truncateFileName(fileName: string, maxLength: number = 25): string {
  if (fileName.length <= maxLength) return fileName;

  const lastDotIndex = fileName.lastIndexOf(".");
  const hasExtension = lastDotIndex > 0;

  if (!hasExtension) {
    return fileName.slice(0, maxLength - 3) + "...";
  }

  const extension = fileName.slice(lastDotIndex);
  const nameWithoutExt = fileName.slice(0, lastDotIndex);
  const truncatedLength = maxLength - extension.length - 3;

  if (truncatedLength <= 0) {
    return fileName.slice(0, maxLength - 3) + "...";
  }

  return nameWithoutExt.slice(0, truncatedLength) + "..." + extension;
}

export function getToolMessage(
  toolInvocation: ToolInvocation,
  isCompleted: boolean
): string {
  const { toolName, args } = toolInvocation;

  if (!args || typeof args !== "object") {
    return isCompleted ? "Completed" : "Processing...";
  }

  const fileName = truncateFileName(getFileName(args.path || ""));

  if (toolName === "str_replace_editor") {
    const command = args.command;

    switch (command) {
      case "create":
        return isCompleted ? `Created ${fileName}` : `Creating ${fileName}`;
      case "view":
        return isCompleted ? `Viewed ${fileName}` : `Viewing ${fileName}`;
      case "str_replace":
        return isCompleted ? `Edited ${fileName}` : `Editing ${fileName}`;
      case "insert":
        return isCompleted ? `Updated ${fileName}` : `Updating ${fileName}`;
      case "undo_edit":
        return isCompleted ? `Reverted ${fileName}` : `Reverting ${fileName}`;
      default:
        return isCompleted ? `Modified ${fileName}` : `Modifying ${fileName}`;
    }
  }

  if (toolName === "file_manager") {
    const command = args.command;

    switch (command) {
      case "rename":
        const newFileName = truncateFileName(getFileName(args.new_path || ""));
        return isCompleted
          ? `Renamed to ${newFileName}`
          : `Renaming to ${newFileName}`;
      case "delete":
        return isCompleted ? `Deleted ${fileName}` : `Deleting ${fileName}`;
      default:
        return isCompleted ? `Modified ${fileName}` : `Modifying ${fileName}`;
    }
  }

  return isCompleted
    ? `Completed ${toolName.replace(/_/g, " ")}`
    : `Running ${toolName.replace(/_/g, " ")}`;
}

export function ToolInvocationBadge({
  toolInvocation,
  className,
}: ToolInvocationBadgeProps) {
  const isCompleted =
    toolInvocation.state === "result" && toolInvocation.result !== undefined;
  const message = getToolMessage(toolInvocation, isCompleted);

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 mt-2 px-3 py-1.5",
        "bg-neutral-50 rounded-lg text-xs font-medium",
        "border border-neutral-200",
        className
      )}
      role="status"
      aria-live="polite"
      aria-label={
        isCompleted ? `Completed: ${message}` : `In progress: ${message}`
      }
    >
      {isCompleted ? (
        <CheckCircle2
          className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0"
          aria-hidden="true"
        />
      ) : (
        <Loader2
          className="w-3 h-3 animate-spin text-blue-600 flex-shrink-0"
          aria-hidden="true"
        />
      )}
      <span className="text-neutral-700 truncate max-w-[200px]">{message}</span>
    </div>
  );
}
