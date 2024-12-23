import Navbar from "@/src/components/navbar";
import Footer from "@/src/components/footer";
import Header from "@/src/components/header";

type MyComponentProps = React.PropsWithChildren<{ title?: string }>;

export default function PageLayout({ children, ...props }: MyComponentProps) {
  const { title } = props;
  return (
    <div className="flex flex-col h-screen">
      <Header title={title ?? ""} />
      <Navbar />
      <div className="flex flex-col grow">
        <main>{children}</main>
      </div>
      <Footer />
    </div>
  );
}
