import Layout from '@/components/Layout';

export const metadata = {
  title: 'Policies - Shopify Store',
  description: 'Our store policies',
};

export default function PoliciesPage() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Store Policies</h1>
        
        <div className="space-y-8">
          {/* Privacy Policy */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Privacy Policy</h2>
            <div className="prose text-gray-700 space-y-4">
              <p>
                This Privacy Policy describes how we collect, use, and share your personal
                information when you visit or make a purchase from our store.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
                Information We Collect
              </h3>
              <p>
                We collect information you provide directly to us when you create an account,
                make a purchase, or communicate with us. This may include your name, email
                address, shipping address, and payment information.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
                How We Use Your Information
              </h3>
              <p>
                We use your information to process orders, communicate with you, improve our
                services, and comply with legal obligations.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
                Information Sharing
              </h3>
              <p>
                We do not sell or rent your personal information to third parties. We may
                share your information with service providers who help us operate our store.
              </p>
            </div>
          </section>

          {/* Terms of Service */}
          <section className="pt-8 border-t">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Terms of Service</h2>
            <div className="prose text-gray-700 space-y-4">
              <p>
                By accessing and using this website, you accept and agree to be bound by the
                terms and provisions of this agreement.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
                Use of Our Store
              </h3>
              <p>
                You agree to use our store only for lawful purposes and in a way that does not
                infringe the rights of others or restrict their use of our store.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
                Product Information
              </h3>
              <p>
                We strive to provide accurate product descriptions and images. However, we do
                not warrant that product descriptions or other content is accurate, complete,
                reliable, current, or error-free.
              </p>
            </div>
          </section>

          {/* Refund Policy */}
          <section className="pt-8 border-t">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Refund Policy</h2>
            <div className="prose text-gray-700 space-y-4">
              <p>
                We want you to be completely satisfied with your purchase. If you're not happy
                with your order, we're here to help.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
                Returns
              </h3>
              <p>
                You have 30 days to return an item from the date you received it. To be
                eligible for a return, your item must be unused and in the same condition that
                you received it. It must also be in the original packaging.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
                Refunds
              </h3>
              <p>
                Once we receive your item, we will inspect it and notify you of the approval
                or rejection of your refund. If approved, your refund will be processed, and a
                credit will automatically be applied to your original method of payment within
                a certain number of days.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
                Shipping
              </h3>
              <p>
                You will be responsible for paying for your own shipping costs for returning
                your item. Shipping costs are non-refundable.
              </p>
            </div>
          </section>

          {/* Shipping Policy */}
          <section className="pt-8 border-t">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Shipping Policy</h2>
            <div className="prose text-gray-700 space-y-4">
              <p>
                We offer several shipping options to meet your needs. Shipping costs and
                delivery times may vary based on your location and the shipping method you
                choose.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
                Processing Time
              </h3>
              <p>
                Orders are typically processed within 1-3 business days. You will receive a
                confirmation email with tracking information once your order has shipped.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
                Delivery Time
              </h3>
              <p>
                Standard shipping typically takes 5-7 business days. Expedited shipping options
                are available at checkout for faster delivery.
              </p>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
}
