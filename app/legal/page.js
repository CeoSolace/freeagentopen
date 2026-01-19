import Nav from "@/src/components/Nav";

/**
 * Legal page containing Terms of Service and Privacy Policy placeholders.
 * Replace this content with your real policies before launch.
 */
export default function LegalPage() {
  return (
    <div>
      <Nav />

      <main className="max-w-3xl mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">Legal</h1>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Terms of Service</h2>
          <p className="text-gray-700 leading-relaxed">
            This is a placeholder for your Terms of Service. Please replace this
            text with the terms that govern use of the FreeAgents platform,
            including acceptable use, account responsibilities, billing terms,
            and termination rules.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">Privacy Policy</h2>
          <p className="text-gray-700 leading-relaxed">
            This is a placeholder for your Privacy Policy. You should describe
            what data you collect, why you collect it, how you store it, who you
            share it with (if anyone), retention periods, and how users can
            request deletion or access.
          </p>
        </section>
      </main>
    </div>
  );
}
