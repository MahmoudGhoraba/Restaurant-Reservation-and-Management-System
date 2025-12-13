export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="text-center">
            <h1 className="text-6xl md:text-7xl font-extrabold mb-6 tracking-tight">
              Welcome to Our
              <span className="block text-blue-200">Restaurant</span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed">
              Experience culinary excellence in an atmosphere of warmth and sophistication
            </p>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              About Us
            </h2>
            <div className="w-24 h-1 bg-blue-600 mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            <div className="order-2 lg:order-1">
              <div className="relative h-96 rounded-2xl overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-indigo-600"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-white text-center p-8">
                    <div className="text-6xl mb-4">🍽️</div>
                    <p className="text-xl font-semibold">Fine Dining Experience</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2 space-y-6">
              <h3 className="text-3xl font-bold text-gray-900">
                A Culinary Journey Like No Other
              </h3>
              <p className="text-lg text-gray-600 leading-relaxed">
                At our restaurant, we believe that dining is more than just a meal—it's an experience. 
                Our passion for exceptional cuisine, combined with warm hospitality, creates memories 
                that last a lifetime.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                We source the finest ingredients from local farms and trusted suppliers, ensuring every 
                dish is crafted with care and attention to detail. Our talented chefs bring years of 
                experience and creativity to the kitchen, creating a menu that celebrates both classic 
                flavors and innovative culinary techniques.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h3 className="text-3xl font-bold text-gray-900">
                Our Commitment to Excellence
              </h3>
              <p className="text-lg text-gray-600 leading-relaxed">
                Every guest is important to us. We strive to provide not just excellent food, but an 
                atmosphere where you can relax, celebrate, and connect with loved ones. Our team is 
                dedicated to making your visit special, whether it's a romantic dinner, a family 
                gathering, or a business meeting.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                We continuously evolve our menu to reflect seasonal ingredients and culinary trends, 
                while maintaining the timeless quality and service standards that have made us a 
                beloved destination for food enthusiasts.
              </p>
            </div>
            <div>
              <div className="relative h-96 rounded-2xl overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-white text-center p-8">
                    <div className="text-6xl mb-4">✨</div>
                    <p className="text-xl font-semibold">Unforgettable Moments</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="bg-gradient-to-br from-gray-50 to-blue-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              What Sets Us Apart
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our core values guide everything we do
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-5xl mb-4 text-center">🌱</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">Fresh Ingredients</h3>
              <p className="text-gray-600 text-center">
                We partner with local farms to bring you the freshest, highest quality ingredients 
                in every dish.
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-5xl mb-4 text-center">👨‍🍳</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">Expert Chefs</h3>
              <p className="text-gray-600 text-center">
                Our culinary team brings years of expertise and passion to create exceptional 
                dining experiences.
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-5xl mb-4 text-center">❤️</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">Warm Service</h3>
              <p className="text-gray-600 text-center">
                From the moment you arrive until you leave, our team ensures you feel welcomed 
                and valued.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Experience Excellence?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join us for an unforgettable dining experience. Create an account to make reservations and explore our menu.
          </p>
        </div>
      </section>
    </div>
  );
}
