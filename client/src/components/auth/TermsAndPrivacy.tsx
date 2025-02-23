import React from "react";

const TermsAndPrivacy: React.FC = () => {
  return (
    <div className="bg-gray-100 text-gray-500">
      <div className="w-full mx-auto bg-white shadow rounded-lg p-4">
        <h1 className="text-xl font-bold mb-4 text-center text-primary">
          Terms and Privacy Policy
        </h1>

        <section className="mb-6">
          <h2 className="text-lg text-gray-500 font-semibold mb-2">Terms of Service</h2>
          <p className="mb-2 text-sm">
            Welcome to PinWheel! By accessing or using our platform, you agree to comply with and be bound by the following terms and conditions:
          </p>
          <ol className="list-decimal ml-4 space-y-2 text-sm">
            <li>
              <span className="font-semibold">Account Responsibility:</span> You are responsible for maintaining the confidentiality of your account information and ensuring all activities conducted under your account comply with these terms.
            </li>
            <li>
              <span className="font-semibold">Prohibited Activities:</span> Any form of misuse, including but not limited to unauthorized access, data scraping, or dissemination of harmful content, is strictly prohibited.
            </li>
            <li>
              <span className="font-semibold">Termination:</span> We reserve the right to suspend or terminate your access to the platform at our discretion for violations of these terms.
            </li>
          </ol>
        </section>

        <section className="mb-4">
          <h2 className="text-lg text-gray-500 font-semibold mb-2">Privacy Policy</h2>
          <p className="mb-2 text-sm">
            Your privacy is important to us. This policy explains how we collect, use, and protect your personal information:
          </p>
          <ul className="list-disc ml-4 space-y-2 text-sm">
            <li>
              <span className="font-semibold">Information Collection:</span> We collect data such as your name, email address, and usage behavior when you interact with our platform.
            </li>
            <li>
              <span className="font-semibold">Usage of Information:</span> The data collected is used to improve your experience, enhance our services, and communicate important updates.
            </li>
            <li>
              <span className="font-semibold">Data Protection:</span> We implement industry-standard security measures to ensure your data is protected from unauthorized access or disclosure.
            </li>
            <li>
              <span className="font-semibold">Third-Party Sharing:</span> We do not sell or share your data with third parties unless required by law or explicitly consented to.
            </li>
          </ul>
        </section>

        <section className="mb-4">
          <h2 className="text-lg text-gray-500 font-semibold mb-2">Updates to Policy</h2>
          <p className="text-sm">
            We may update these terms and the privacy policy from time to time. Changes will be communicated via email or a prominent notification on our platform. Your continued use of the platform constitutes acceptance of the revised policies.
          </p>
        </section>

        <section className="mb-4">
          <h2 className="text-lg text-gray-500 font-semibold mb-2">Contact Us</h2>
          <p className="text-sm">
            If you have any questions about these terms or our privacy practices, feel free to contact us at:
          </p>
          <address className="mt-2 not-italic text-sm">
            <p>Email: support@PinWheel.com</p>
            <p>Phone: +123 456 7890</p>
            <p>Address: 123 PinWheel Lane, Tech City, Innovation State</p>
          </address>
        </section>

        <footer className="mt-4 text-center text-gray-600 text-xs">
          <p>&copy; {new Date().getFullYear()} PinWheel. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default TermsAndPrivacy;