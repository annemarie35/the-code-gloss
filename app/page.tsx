import GlossTermsForm from "@/src/components/gloss-terms-form";
import Layout from "@/pages/layout";

export default function Page() {
  return (
    <div>
      <Layout title="The Code Gloss">
        <div data-testid="gloss-terms-form">
          <GlossTermsForm />
        </div>
      </Layout>
    </div>
  );
}
