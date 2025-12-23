import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { MainContent } from "../main-content";
import { describe, it, expect, vi } from "vitest";

vi.mock("@/components/chat/ChatInterface", () => ({
  ChatInterface: () => <div>Chat Interface</div>,
}));

vi.mock("@/components/editor/FileTree", () => ({
  FileTree: () => <div>File Tree</div>,
}));

vi.mock("@/components/editor/CodeEditor", () => ({
  CodeEditor: () => <div>Code Editor</div>,
}));

vi.mock("@/components/preview/PreviewFrame", () => ({
  PreviewFrame: () => <div>Preview Frame</div>,
}));

vi.mock("@/components/HeaderActions", () => ({
  HeaderActions: () => <div>Header Actions</div>,
}));

describe("MainContent Toggle Buttons", () => {
  it("should render Preview tab by default", () => {
    render(<MainContent />);
    expect(screen.getByText("Preview Frame")).toBeInTheDocument();
    expect(screen.queryByText("Code Editor")).not.toBeInTheDocument();
  });

  it("should toggle to Code tab when Code button is clicked", async () => {
    const user = userEvent.setup();
    render(<MainContent />);

    const codeButton = screen.getByRole("tab", { name: /code/i });
    await user.click(codeButton);

    expect(screen.getByText("Code Editor")).toBeInTheDocument();
    expect(screen.queryByText("Preview Frame")).not.toBeInTheDocument();
  });

  it("should toggle back to Preview tab when Preview button is clicked", async () => {
    const user = userEvent.setup();
    render(<MainContent />);

    const codeButton = screen.getByRole("tab", { name: /code/i });
    await user.click(codeButton);

    const previewButton = screen.getByRole("tab", { name: /preview/i });
    await user.click(previewButton);

    expect(screen.getByText("Preview Frame")).toBeInTheDocument();
    expect(screen.queryByText("Code Editor")).not.toBeInTheDocument();
  });

  it("should maintain proper active state on tab triggers", async () => {
    const user = userEvent.setup();
    render(<MainContent />);

    const previewButton = screen.getByRole("tab", { name: /preview/i });
    const codeButton = screen.getByRole("tab", { name: /code/i });

    // Initially, Preview should be active
    expect(previewButton).toHaveAttribute("data-state", "active");
    expect(codeButton).toHaveAttribute("data-state", "inactive");

    // Click Code
    await user.click(codeButton);
    expect(previewButton).toHaveAttribute("data-state", "inactive");
    expect(codeButton).toHaveAttribute("data-state", "active");

    // Click Preview again
    await user.click(previewButton);
    expect(previewButton).toHaveAttribute("data-state", "active");
    expect(codeButton).toHaveAttribute("data-state", "inactive");
  });
});
