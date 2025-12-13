export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="text-6xl font-bold mb-6">
              Welcome to Our
              <span className="block">Restaurant</span>
            </h1>
            <p className="text-xl mb-8">
              Experience culinary excellence in an atmosphere of warmth and sophistication
            </p>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section className="section section-white">
        <div className="container">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold mb-4">
              About Us
            </h2>
            <div style={{ width: '6rem', height: '2px', background: '#000000', margin: '0 auto' }}></div>
          </div>

          <div className="grid grid-2 gap-8 items-center mb-8">
            <div>
              <div className="card" style={{ height: '24rem', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', inset: 0, background: '#000000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div className="text-center p-8">
                    <div className="text-6xl mb-4">🍽️</div>
                    <p className="text-xl font-semibold text-white">Fine Dining Experience</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <h3 className="text-3xl font-bold">
                A Culinary Journey Like No Other
              </h3>
              <p className="text-lg leading-relaxed">
                At our restaurant, we believe that dining is more than just a meal—it's an experience. 
                Our passion for exceptional cuisine, combined with warm hospitality, creates memories 
                that last a lifetime.
              </p>
              <p className="text-lg leading-relaxed">
                We source the finest ingredients from local farms and trusted suppliers, ensuring every 
                dish is crafted with care and attention to detail. Our talented chefs bring years of 
                experience and creativity to the kitchen, creating a menu that celebrates both classic 
                flavors and innovative culinary techniques.
              </p>
            </div>
          </div>

          <div className="grid grid-2 gap-8 items-center">
            <div className="space-y-6">
              <h3 className="text-3xl font-bold">
                Our Commitment to Excellence
              </h3>
              <p className="text-lg leading-relaxed">
                Every guest is important to us. We strive to provide not just excellent food, but an 
                atmosphere where you can relax, celebrate, and connect with loved ones. Our team is 
                dedicated to making your visit special, whether it's a romantic dinner, a family 
                gathering, or a business meeting.
              </p>
              <p className="text-lg leading-relaxed">
                We continuously evolve our menu to reflect seasonal ingredients and culinary trends, 
                while maintaining the timeless quality and service standards that have made us a 
                beloved destination for food enthusiasts.
              </p>
            </div>
            <div>
              <div className="card" style={{ height: '24rem', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', inset: 0, background: '#000000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div className="text-center p-8">
                    <div className="text-6xl mb-4">✨</div>
                    <p className="text-xl font-semibold text-white">Unforgettable Moments</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="section section-alt">
        <div className="container">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold mb-4">
              What Sets Us Apart
            </h2>
            <p className="text-lg">
              Our core values guide everything we do
            </p>
          </div>

          <div className="grid grid-3 gap-8">
            <div className="card">
              <div className="text-5xl mb-4 text-center">🌱</div>
              <h3 className="text-xl font-bold mb-3 text-center">Fresh Ingredients</h3>
              <p className="text-center">
                We partner with local farms to bring you the freshest, highest quality ingredients 
                in every dish.
              </p>
            </div>
            <div className="card">
              <div className="text-5xl mb-4 text-center">👨‍🍳</div>
              <h3 className="text-xl font-bold mb-3 text-center">Expert Chefs</h3>
              <p className="text-center">
                Our culinary team brings years of expertise and passion to create exceptional 
                dining experiences.
              </p>
            </div>
            <div className="card">
              <div className="text-5xl mb-4 text-center">❤️</div>
              <h3 className="text-xl font-bold mb-3 text-center">Warm Service</h3>
              <p className="text-center">
                From the moment you arrive until you leave, our team ensures you feel welcomed 
                and valued.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section section-alt">
        <div className="container">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Experience Excellence?
            </h2>
            <p className="text-xl mb-8">
              Join us for an unforgettable dining experience. Create an account to make reservations and explore our menu.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
