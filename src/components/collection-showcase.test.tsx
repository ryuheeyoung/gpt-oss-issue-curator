import { render, screen } from "@testing-library/react";

import { CollectionShowcase } from "./collection-showcase";
import { curatedIssues, spotlightCollections } from "@/lib/mock-data";

describe("CollectionShowcase", () => {
  it("renders a card per collection with issue counts", () => {
    render(<CollectionShowcase collections={spotlightCollections} issues={curatedIssues} />);

    spotlightCollections.forEach((collection) => {
      expect(screen.getByRole("heading", { name: collection.title })).toBeInTheDocument();
      expect(
        screen.getByText(new RegExp(`${collection.issueIds.length} issues`, "i")),
      ).toBeInTheDocument();
    });
  });

  it("shows up to three repo chips derived from collection issues", () => {
    render(<CollectionShowcase collections={spotlightCollections} issues={curatedIssues} />);

    const firstCollection = spotlightCollections[0];
    const expectedRepos = firstCollection.issueIds
      .slice(0, 3)
      .map((id) => curatedIssues.find((issue) => issue.id === id))
      .filter(Boolean)
      .map((issue) => issue!.repo.split("/").pop() as string);

    expectedRepos.forEach((repoName) => {
      expect(screen.getByText(repoName)).toBeInTheDocument();
    });
  });
});
