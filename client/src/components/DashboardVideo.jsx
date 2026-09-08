import React from "react";

const DashboardVideo = () => {
  return (
    <section className="w-full px-4 md:px-6 lg:px-8 py-6">
      <div className="relative w-full h-55 md:h-80 lg:h-100 rounded-2xl overflow-hidden shadow-lg">
        <video
          className="w-full h-full object-cover"
          src="/videos/fishingboat1.mp4"
          autoPlay
          muted
          loop
          playsInline
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
          <div className="text-center text-white px-4">
            <h2 className="text-2xl md:text-4xl font-bold">
              Fresh Fish, Delivered Fresh
            </h2>

            <p className="mt-2 text-sm md:text-lg">
              Quality seafood delivered straight to your doorstep.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DashboardVideo;
