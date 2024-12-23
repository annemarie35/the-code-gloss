import { expect, it, describe } from "vitest";
import { render, screen } from "@testing-library/react";
import Layout from "@/pages/layout";

describe("Layout", () => {
  render(
    <Layout title="À propos">
      (<div>Dummy</div>)
    </Layout>,
  );

  it("should contain a custom title", () => {
    expect(
      screen.getByRole("heading", { level: 1, name: "À propos" }),
    ).toBeDefined();
  });
});
