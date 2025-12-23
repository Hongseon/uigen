import { describe, test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import {
  ToolInvocationBadge,
  getToolMessage,
  ToolInvocation,
} from "../ToolInvocationBadge";

afterEach(() => {
  cleanup();
});

describe("getToolMessage", () => {
  describe("str_replace_editor commands", () => {
    test("returns 'Creating filename' for create command in progress", () => {
      const invocation: ToolInvocation = {
        toolCallId: "1",
        toolName: "str_replace_editor",
        args: { command: "create", path: "/components/App.jsx" },
        state: "pending",
      };
      expect(getToolMessage(invocation, false)).toBe("Creating App.jsx");
    });

    test("returns 'Created filename' for completed create command", () => {
      const invocation: ToolInvocation = {
        toolCallId: "1",
        toolName: "str_replace_editor",
        args: { command: "create", path: "/components/App.jsx" },
        state: "result",
        result: "success",
      };
      expect(getToolMessage(invocation, true)).toBe("Created App.jsx");
    });

    test("returns 'Editing filename' for str_replace command in progress", () => {
      const invocation: ToolInvocation = {
        toolCallId: "1",
        toolName: "str_replace_editor",
        args: {
          command: "str_replace",
          path: "/Card.tsx",
          old_str: "a",
          new_str: "b",
        },
        state: "streaming",
      };
      expect(getToolMessage(invocation, false)).toBe("Editing Card.tsx");
    });

    test("returns 'Edited filename' for completed str_replace command", () => {
      const invocation: ToolInvocation = {
        toolCallId: "1",
        toolName: "str_replace_editor",
        args: { command: "str_replace", path: "/Card.tsx" },
        state: "result",
        result: "success",
      };
      expect(getToolMessage(invocation, true)).toBe("Edited Card.tsx");
    });

    test("returns 'Viewing filename' for view command", () => {
      const invocation: ToolInvocation = {
        toolCallId: "1",
        toolName: "str_replace_editor",
        args: { command: "view", path: "/utils/helpers.ts" },
        state: "pending",
      };
      expect(getToolMessage(invocation, false)).toBe("Viewing helpers.ts");
    });

    test("returns 'Updating filename' for insert command", () => {
      const invocation: ToolInvocation = {
        toolCallId: "1",
        toolName: "str_replace_editor",
        args: {
          command: "insert",
          path: "/index.ts",
          insert_line: 5,
          new_str: "code",
        },
        state: "pending",
      };
      expect(getToolMessage(invocation, false)).toBe("Updating index.ts");
    });

    test("returns 'Reverting filename' for undo_edit command", () => {
      const invocation: ToolInvocation = {
        toolCallId: "1",
        toolName: "str_replace_editor",
        args: { command: "undo_edit", path: "/App.tsx" },
        state: "pending",
      };
      expect(getToolMessage(invocation, false)).toBe("Reverting App.tsx");
    });
  });

  describe("file_manager commands", () => {
    test("returns 'Renaming to new_filename' for rename command", () => {
      const invocation: ToolInvocation = {
        toolCallId: "1",
        toolName: "file_manager",
        args: { command: "rename", path: "/old.tsx", new_path: "/new.tsx" },
        state: "pending",
      };
      expect(getToolMessage(invocation, false)).toBe("Renaming to new.tsx");
    });

    test("returns 'Renamed to new_filename' for completed rename", () => {
      const invocation: ToolInvocation = {
        toolCallId: "1",
        toolName: "file_manager",
        args: { command: "rename", path: "/old.tsx", new_path: "/new.tsx" },
        state: "result",
        result: { success: true },
      };
      expect(getToolMessage(invocation, true)).toBe("Renamed to new.tsx");
    });

    test("returns 'Deleting filename' for delete command", () => {
      const invocation: ToolInvocation = {
        toolCallId: "1",
        toolName: "file_manager",
        args: { command: "delete", path: "/unused.js" },
        state: "pending",
      };
      expect(getToolMessage(invocation, false)).toBe("Deleting unused.js");
    });

    test("returns 'Deleted filename' for completed delete", () => {
      const invocation: ToolInvocation = {
        toolCallId: "1",
        toolName: "file_manager",
        args: { command: "delete", path: "/unused.js" },
        state: "result",
        result: { success: true },
      };
      expect(getToolMessage(invocation, true)).toBe("Deleted unused.js");
    });
  });

  describe("edge cases", () => {
    test("handles empty path gracefully", () => {
      const invocation: ToolInvocation = {
        toolCallId: "1",
        toolName: "str_replace_editor",
        args: { command: "create", path: "" },
        state: "pending",
      };
      expect(getToolMessage(invocation, false)).toBe("Creating file");
    });

    test("handles missing args gracefully", () => {
      const invocation = {
        toolCallId: "1",
        toolName: "str_replace_editor",
        args: null,
        state: "pending",
      } as unknown as ToolInvocation;
      expect(getToolMessage(invocation, false)).toBe("Processing...");
    });

    test("truncates very long filenames", () => {
      const invocation: ToolInvocation = {
        toolCallId: "1",
        toolName: "str_replace_editor",
        args: {
          command: "create",
          path: "/VeryLongComponentNameThatExceedsLimit.tsx",
        },
        state: "pending",
      };
      const message = getToolMessage(invocation, false);
      expect(message).toContain("...");
      expect(message).toContain(".tsx");
    });

    test("handles path with only filename (no directory)", () => {
      const invocation: ToolInvocation = {
        toolCallId: "1",
        toolName: "str_replace_editor",
        args: { command: "create", path: "App.tsx" },
        state: "pending",
      };
      expect(getToolMessage(invocation, false)).toBe("Creating App.tsx");
    });

    test("handles deeply nested paths", () => {
      const invocation: ToolInvocation = {
        toolCallId: "1",
        toolName: "str_replace_editor",
        args: {
          command: "create",
          path: "/src/components/ui/forms/Input.tsx",
        },
        state: "pending",
      };
      expect(getToolMessage(invocation, false)).toBe("Creating Input.tsx");
    });

    test("handles unknown tool names", () => {
      const invocation: ToolInvocation = {
        toolCallId: "1",
        toolName: "unknown_tool",
        args: { path: "/test.ts" },
        state: "pending",
      };
      expect(getToolMessage(invocation, false)).toBe("Running unknown tool");
    });

    test("handles unknown commands for str_replace_editor", () => {
      const invocation: ToolInvocation = {
        toolCallId: "1",
        toolName: "str_replace_editor",
        args: { command: "unknown_command", path: "/test.ts" },
        state: "pending",
      };
      expect(getToolMessage(invocation, false)).toBe("Modifying test.ts");
    });
  });
});

describe("ToolInvocationBadge Component", () => {
  test("renders with loading spinner when in progress", () => {
    const invocation: ToolInvocation = {
      toolCallId: "1",
      toolName: "str_replace_editor",
      args: { command: "create", path: "/App.jsx" },
      state: "pending",
    };

    render(<ToolInvocationBadge toolInvocation={invocation} />);

    expect(screen.getByText("Creating App.jsx")).toBeDefined();
    const spinner = document.querySelector(".animate-spin");
    expect(spinner).not.toBeNull();
  });

  test("renders with checkmark when completed", () => {
    const invocation: ToolInvocation = {
      toolCallId: "1",
      toolName: "str_replace_editor",
      args: { command: "create", path: "/App.jsx" },
      state: "result",
      result: "Success",
    };

    render(<ToolInvocationBadge toolInvocation={invocation} />);

    expect(screen.getByText("Created App.jsx")).toBeDefined();
    const checkIcon = document.querySelector(".text-emerald-500");
    expect(checkIcon).not.toBeNull();
  });

  test("applies custom className", () => {
    const invocation: ToolInvocation = {
      toolCallId: "1",
      toolName: "str_replace_editor",
      args: { command: "view", path: "/test.ts" },
      state: "pending",
    };

    const { container } = render(
      <ToolInvocationBadge
        toolInvocation={invocation}
        className="custom-class"
      />
    );

    expect(
      (container.firstChild as HTMLElement).classList.contains("custom-class")
    ).toBe(true);
  });

  test("has correct accessibility attributes", () => {
    const invocation: ToolInvocation = {
      toolCallId: "1",
      toolName: "str_replace_editor",
      args: { command: "create", path: "/App.jsx" },
      state: "pending",
    };

    render(<ToolInvocationBadge toolInvocation={invocation} />);

    const badge = screen.getByRole("status");
    expect(badge).toBeDefined();
    expect(badge.getAttribute("aria-live")).toBe("polite");
    expect(badge.getAttribute("aria-label")).toContain("In progress");
  });

  test("updates aria-label when completed", () => {
    const invocation: ToolInvocation = {
      toolCallId: "1",
      toolName: "str_replace_editor",
      args: { command: "create", path: "/App.jsx" },
      state: "result",
      result: "success",
    };

    render(<ToolInvocationBadge toolInvocation={invocation} />);

    const badge = screen.getByRole("status");
    expect(badge.getAttribute("aria-label")).toContain("Completed");
  });

  test("handles streaming state as in-progress", () => {
    const invocation: ToolInvocation = {
      toolCallId: "1",
      toolName: "str_replace_editor",
      args: { command: "str_replace", path: "/file.ts" },
      state: "streaming",
    };

    render(<ToolInvocationBadge toolInvocation={invocation} />);

    expect(screen.getByText("Editing file.ts")).toBeDefined();
    const spinner = document.querySelector(".animate-spin");
    expect(spinner).not.toBeNull();
  });

  test("shows spinner when state is result but no result value", () => {
    const invocation: ToolInvocation = {
      toolCallId: "1",
      toolName: "str_replace_editor",
      args: { command: "create", path: "/App.jsx" },
      state: "result",
    };

    render(<ToolInvocationBadge toolInvocation={invocation} />);

    const spinner = document.querySelector(".animate-spin");
    expect(spinner).not.toBeNull();
  });
});
