

export default function Home() {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center text-center text-white">

  {/* Background Image */}
  <div className="absolute inset-0">
    <img
      src="../assets/bg.png"
      alt="background"
      className="w-full h-full object-cover"
    />
    {/* Overlay for readability */}
    <div className="absolute inset-0 bg-blue-900/70"></div>
  </div>

  {/* Content */}
  <div className="relative z-10 px-4 max-w-3xl">
    <h1 className="text-4xl md:text-6xl font-bold mb-6">
      Match Your True Potential
    </h1>

    <p className="text-lg md:text-xl text-blue-100 mb-8">
      Bridge the gap between academia and industry with our intelligent platform
      where student capabilities are accurately matched with corporate requirements.
    </p>

    <button className="bg-white text-blue-600 px-6 py-3 rounded-md font-bold hover:bg-blue-50 transition">
      Explore Opportunities
    </button>
  </div>

</div>
  );
}