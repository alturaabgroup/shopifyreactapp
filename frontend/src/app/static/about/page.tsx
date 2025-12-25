import Layout from '@/components/Layout';

export const metadata = {
  title: 'About Us - Shopify Store',
  description: 'Learn more about our store',
};

export default function AboutPage() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">About Us</h1>
        
        <div className="prose prose-lg">
          <p className="text-lg text-gray-700 mb-6">
            Welcome to our store! We're dedicated to providing you with the best products
            and exceptional customer service.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Our Story</h2>
          <p className="text-gray-700 mb-6">
            Founded with a passion for quality and customer satisfaction, our store has
            been serving customers worldwide with carefully curated products and reliable
            shipping.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Our Mission</h2>
          <p className="text-gray-700 mb-6">
            Our mission is to provide high-quality products at competitive prices while
            ensuring an exceptional shopping experience for every customer.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Why Choose Us?</h2>
          <ul className="list-disc list-inside text-gray-700 space-y-2 mb-6">
            <li>Curated selection of quality products</li>
            <li>Fast and reliable shipping</li>
            <li>Excellent customer service</li>
            <li>Secure payment processing</li>
            <li>Easy returns and exchanges</li>
          </ul>

          <p className="text-gray-700">
            Thank you for choosing us for your shopping needs. We look forward to serving you!
          </p>
        </div>
      </div>
    </Layout>
  );
}
