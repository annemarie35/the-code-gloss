import { expect, it, describe } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import Page from "@/app/page";

describe("Page", () => {
  render(<Page />);
  expect(screen.getByRole("heading", { level: 1, name: "Home" })).toBeDefined();

  it("should contain a form", async () => {
    const wrapper = render(<Page />);
    expect(await wrapper.getAllByTestId("gloss-terms-form")).toBeDefined();
  });
});
