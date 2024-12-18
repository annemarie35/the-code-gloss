import Link from "next/link";
import GlossTermsForm from "@/src/components/gloss-terms-form";

export default function Page() {
  return (
    <div>
      <h1>Home</h1>
      <div data-testid="gloss-terms-form">
        <GlossTermsForm />
      </div>
      <footer>
        <Link href="/about">About</Link>
      </footer>
    </div>
  );
}
