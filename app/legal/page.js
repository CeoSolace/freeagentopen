import Nav from "@/src/components/Nav";

export default function LegalPage() {
  return (
    <div>
      <Nav />
      <main className="max-w-3xl mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-4">Legal</h1>
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Terms of Service</h2>
          <p className="text-gray-700">
            This is a placeholder for your Terms of Service. Please replace this text.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold mb-2">Privacy Policy</h2>
          <p className="text-gray-700">
            This is a placeholder for your Privacy Policy. Please replace this text.
          </p>
        </section>
      </main>
    </div>
  );
}
