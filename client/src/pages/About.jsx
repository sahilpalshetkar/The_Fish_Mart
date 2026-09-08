import React from "react";
import {
  FaFish,
  FaTruckFast,
  FaShieldHeart,
  FaLeaf,
  FaLocationDot,
  FaCheck,
} from "react-icons/fa6";
import founderImage from "../assets/about.JPG";
import boatAbout from "../assets/boatAbout.jpg";

const About = () => {
  return (
    <div className="bg-white text-slate-800">
      {/*   HERO SECTION */}
      <section className="relative overflow-hidden bg-[#F0F9FF]">
        {/* Background Decorations */}
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-cyan-100/60 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-blue-100/60 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-6 py-20 md:px-10 lg:py-28">
          <div className="max-w-3xl">
            <span className="mb-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-cyan-700 shadow-sm">
              <FaFish />
              About The Fish Mart
            </span>

            <h1 className="text-4xl font-extrabold leading-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Freshness You Can
              <span className="text-cyan-600"> Taste.</span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              We believe great seafood starts with great sourcing. the fish mart
              brings fresh, quality seafood directly to your doorstep with
              careful handling, hygienic cleaning, and reliable delivery.
            </p>
          </div>
        </div>
      </section>

      {/*  OUR STORY */}
      <section className="mx-auto max-w-7xl px-6 py-20 md:px-10 lg:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Image */}
          <div className="relative">
            <div className="overflow-hidden rounded-3xl bg-slate-100 shadow-xl">
              <img
                src={boatAbout}
                alt="Fresh seafood"
                className="h-75 w-full object-cover"
              />
            </div>

            {/* Floating Card */}
            <div className="absolute -bottom-6 -right-5 hidden rounded-2xl bg-white p-5 shadow-xl sm:block">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                  <FaFish className="text-xl" />
                </div>

                <div>
                  <p className="text-sm text-slate-500">Our Promise</p>

                  <p className="font-bold text-slate-900">
                    Fresh. Clean. Reliable.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div>
            <p className="font-semibold uppercase tracking-wider text-cyan-600">
              Our Story
            </p>

            <h2 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">
              Seafood that feels like it came straight from the coast.
            </h2>

            <p className="mt-6 leading-7 text-slate-600">
              the fish mart was created with one simple goal — to make fresh
              seafood easily accessible to families across Mumbai.
            </p>

            <p className="mt-4 leading-7 text-slate-600">
              From selecting quality seafood to cleaning, packing, and
              delivering it, we focus on every step of the journey. Our aim is
              to give you seafood that is fresh, hygienic, properly handled, and
              ready for your kitchen.
            </p>

            {/* Points */}
            <div className="mt-7 space-y-4">
              {[
                "Carefully sourced seafood",
                "Hygienic cleaning and packing",
                "Cold-chain handling",
                "Fast doorstep delivery",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-100 text-cyan-600">
                    <FaCheck className="text-xs" />
                  </div>

                  <span className="font-medium text-slate-700">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/*   FOUNDER SECTION */}
      <section className="bg-slate-50 py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Founder Image */}
            <div className="relative">
              <div className="overflow-hidden rounded-3xl bg-slate-200 shadow-lg">
                <img
                  src={founderImage}
                  alt="Sahil Palshetkar - Founder of TheFishMart"
                  className="h-120 w-full object-cover"
                />
              </div>

              {/* Founder Badge */}
              <div className="absolute -bottom-5 -right-5 rounded-2xl bg-white px-6 py-4 shadow-xl">
                <p className="text-sm text-slate-500">Founder</p>

                <p className="text-lg font-bold text-slate-900">
                  Sahil Palshetkar
                </p>
              </div>
            </div>

            {/* Founder Content */}
            <div>
              <p className="font-semibold uppercase tracking-wider text-cyan-600">
                Meet the Founder
              </p>

              <h2 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">
                Built with a passion for fresh seafood.
              </h2>

              <p className="mt-6 leading-7 text-slate-600">
                Hi, I'm{" "}
                <span className="font-semibold text-slate-900">
                  Sahil Palshetkar
                </span>
                , the founder of TheFishMart.
              </p>

              <p className="mt-4 leading-7 text-slate-600">
                Growing up close to the seafood business, I saw both the
                importance of fresh seafood and the challenges customers face
                when buying it.
              </p>

              <p className="mt-4 leading-7 text-slate-600">
                From freshness and hygiene to cleaning and delivery, there is a
                lot that can be improved. That's what inspired me to build
                TheFishMart — a modern seafood platform focused on bringing
                fresh, quality seafood directly to customers.
              </p>

              <p className="mt-4 leading-7 text-slate-600">
                My vision is to build a trusted seafood brand that customers can
                rely on for fresh fish, transparent quality, hygienic handling,
                and dependable doorstep delivery.
              </p>

              {/* Founder Values */}
              <div className="mt-8 flex flex-wrap gap-3">
                <span className="rounded-full bg-cyan-100 px-4 py-2 text-sm font-medium text-cyan-700">
                  Freshness
                </span>

                <span className="rounded-full bg-cyan-100 px-4 py-2 text-sm font-medium text-cyan-700">
                  Quality
                </span>

                <span className="rounded-full bg-cyan-100 px-4 py-2 text-sm font-medium text-cyan-700">
                  Hygiene
                </span>

                <span className="rounded-full bg-cyan-100 px-4 py-2 text-sm font-medium text-cyan-700">
                  Customer First
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/*  MISSION */}
      <section className="bg-slate-900 py-20 text-white">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <div className="mx-auto max-w-3xl text-center">
            <p className="font-semibold uppercase tracking-wider text-cyan-400">
              Our Mission
            </p>

            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
              Making fresh seafood simple.
            </h2>

            <p className="mt-6 text-lg leading-8 text-slate-300">
              No crowded fish markets. No guessing about freshness. No
              compromise on hygiene. Just quality seafood delivered to your
              doorstep.
            </p>
          </div>
        </div>
      </section>

      {/*  WHY CHOOSE US */}
      <section className="mx-auto max-w-7xl px-6 py-20 md:px-10 lg:py-24">
        {/* Heading */}
        <div className="text-center">
          <p className="font-semibold uppercase tracking-wider text-cyan-600">
            Why Choose Us
          </p>

          <h2 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">
            Freshness at every step
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-slate-600">
            We don't just sell seafood. We take care of it from sourcing to your
            kitchen.
          </p>
        </div>

        {/* Cards */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Fresh */}
          <div className="rounded-2xl border border-slate-100 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-50 text-2xl text-cyan-600">
              <FaFish />
            </div>

            <h3 className="mt-6 text-xl font-bold text-slate-900">
              Fresh Seafood
            </h3>

            <p className="mt-3 leading-6 text-slate-600">
              Quality seafood sourced with freshness and quality in mind.
            </p>
          </div>

          {/* Hygiene */}
          <div className="rounded-2xl border border-slate-100 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-50 text-2xl text-cyan-600">
              <FaShieldHeart />
            </div>

            <h3 className="mt-6 text-xl font-bold text-slate-900">Hygienic</h3>

            <p className="mt-3 leading-6 text-slate-600">
              Handled, cleaned, and packed with strong hygiene standards.
            </p>
          </div>

          {/* Quality */}
          <div className="rounded-2xl border border-slate-100 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-50 text-2xl text-cyan-600">
              <FaLeaf />
            </div>

            <h3 className="mt-6 text-xl font-bold text-slate-900">
              Quality First
            </h3>

            <p className="mt-3 leading-6 text-slate-600">
              We focus on quality rather than simply offering more products.
            </p>
          </div>

          {/* Delivery */}
          <div className="rounded-2xl border border-slate-100 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-50 text-2xl text-cyan-600">
              <FaTruckFast />
            </div>

            <h3 className="mt-6 text-xl font-bold text-slate-900">
              Fast Delivery
            </h3>

            <p className="mt-3 leading-6 text-slate-600">
              Carefully packed seafood delivered conveniently to your door.
            </p>
          </div>
        </div>
      </section>

      {/*  LOCATION / CTA */}
      <section className="bg-[#F0F9FF]">
        <div className="mx-auto max-w-7xl px-6 py-16 md:px-10">
          <div className="flex flex-col items-center justify-between gap-8 rounded-3xl bg-white p-8 shadow-sm md:flex-row md:p-12">
            {/* Content */}
            <div>
              <div className="flex items-center gap-2 text-cyan-600">
                <FaLocationDot />

                <span className="font-semibold">Serving Mumbai</span>
              </div>

              <h2 className="mt-3 text-2xl font-bold text-slate-900 sm:text-3xl">
                Fresh seafood, delivered to your doorstep.
              </h2>

              <p className="mt-3 max-w-xl text-slate-600">
                Discover our selection of fresh fish, prawns, and seafood
                products.
              </p>
            </div>

            {/* Button */}
            <a
              href="/products"
              className="shrink-0 rounded-xl bg-cyan-600 px-7 py-3.5 font-semibold text-white transition hover:bg-cyan-700"
            >
              Shop Seafood
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
