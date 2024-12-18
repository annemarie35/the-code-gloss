import { expect, it, describe } from "vitest";
import { render, screen } from "@testing-library/react";
import Layout from "@/pages/layout";

describe("Layout", () => {
  render(
    <Layout title="À propos">
      (<div>Dummy</div>)
    </Layout>,
  );
  // https://stackoverflow.com/questions/55370851/how-to-fix-binding-element-children-implicitly-has-an-any-type-ts7031
  // TODO add a type to children props in Layout Component

  it("should contain a title", () => {
    expect(
      screen.getByRole("heading", { level: 1, name: "À propos" }),
    ).toBeDefined();
  });
});
