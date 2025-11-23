const PrivacyPolicyPage = () => {
  return (
    <div className="bg-primary h-full px-8 py-16">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-primary text-3xl font-bold sm:text-4xl">
          Privacy Policy
        </h1>

        <p className="text-secondary mt-4 leading-relaxed">
          Your privacy is deeply important to us. This page explains how we
          handle, use, and protect your data.
        </p>

        <div className="mt-10 space-y-6">
          <section>
            <h2 className="text-primary text-xl font-semibold">
              1. Information We Collect
            </h2>
            <p className="text-secondary mt-2">
              We collect essential details such as your email, username, and
              conversations — only to deliver a personalized experience.
            </p>
          </section>

          <section>
            <h2 className="text-primary text-xl font-semibold">
              2. How Your Data Is Used
            </h2>
            <p className="text-secondary mt-2">
              Your data helps Mentora offer meaningful, context-aware guidance.
              We never sell or share your information with advertisers.
            </p>
          </section>

          <section>
            <h2 className="text-primary text-xl font-semibold">
              3. Security Measures
            </h2>
            <p className="text-secondary mt-2">
              All sensitive information is encrypted. We follow strict access
              control and monitoring practices.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
