import React from 'react';

const Navbar = () => {
    return (
        <nav className="flex justify-between items-center p-4 bg-navy">
            <div className="text-white text-2xl">510</div>
            <div className="flex space-x-4">
                <a href="#services" className="text-white">Services</a>
                <a href="#book-now" className="text-white">Book Now</a>
                <a href="#about" className="text-white">About</a>
                <button className="bg-blue-500 text-white px-4 py-2 rounded">Login</button>
            </div>
        </nav>
    );
};

const Hero = () => {
    return (
        <section className="flex flex-col items-center justify-center h-screen bg-navy text-white text-center">
            <h1 className="text-4xl font-bold mb-4">Professional Cleaning for Electronics & Furniture</h1>
            <button className="bg-blue-500 text-white px-6 py-3 rounded">Book a Service</button>
        </section>
    );
};

const ServiceCard = ({ title }: { title: string }) => {
    return (
        <div className="bg-white shadow-md rounded-lg p-4 m-2 flex-1">
            <h2 className="text-xl font-semibold">{title}</h2>
        </div>
    );
};

const ServicesPreview = () => {
    return (
        <div className="flex flex-wrap justify-center p-4">
            <ServiceCard title="Electronics Cleaning" />
            <ServiceCard title="Furniture Cleaning" />
            <ServiceCard title="Deep Clean Package" />
        </div>
    );
};

const HomePage = () => {
    return (
        <div>
            <Navbar />
            <Hero />
            <ServicesPreview />
        </div>
    );
};

export default HomePage;