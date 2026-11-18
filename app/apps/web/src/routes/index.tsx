import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    // oxlint-disable-next-line typescript/only-throw-error -- TanStack Router's redirect is thrown, by design
    throw redirect({ href: "/tech-helper.html" });
  },
});
