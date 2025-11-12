import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { IssueExplorer } from "./issue-explorer";
import { curatedIssues } from "@/lib/mock-data";

// Mock localStorage since IssueExplorer hydrates state on mount.
const mockStorage = () => {
  const store = new Map<string, string>();
  const localStorageMock = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => store.clear(),
  };
  Object.defineProperty(window, "localStorage", {
    value: localStorageMock,
    writable: true,
  });
};

const setup = () => render(<IssueExplorer />);

describe("IssueExplorer filtering behavior", () => {
  beforeEach(() => {
    mockStorage();
    window.localStorage.clear();
  });

  it("shows the full curated list by default", () => {
    setup();

    expect(screen.getByText("Curated feed")).toBeInTheDocument();
    expect(screen.getByText(`${curatedIssues.length} of ${curatedIssues.length} issues visible`)).toBeInTheDocument();
  });

  it("filters issues when language and label are selected", async () => {
    const user = userEvent.setup();
    setup();

    const languageSelect = screen.getByLabelText(/language/i);
    await user.selectOptions(languageSelect, "Python");

    const docsLabel = screen.getByRole("button", { name: /docs/i });
    await user.click(docsLabel);

    const expectedCount = curatedIssues.filter(
      (issue) => issue.language === "Python" && issue.labels.includes("docs"),
    ).length;

    expect(
      screen.getByText(new RegExp(`${expectedCount} of ${curatedIssues.length} issues visible`, "i")),
    ).toBeInTheDocument();
  });
});
