import React from 'react';
import { FaInstagram, FaLinkedin, FaGithub } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="w-full bg-[#222] text-gray-300">

      {/* --- Main Footer Content --- */}
      <div className="footer-content grid grid-cols-1 md:grid-cols-2 gap-10 py-16 px-5 max-w-7xl mx-auto">
        
        <div className="footer-column">
           <h4 className="text-[#FADA5E] uppercase tracking-wider mb-4 font-semibold">Contact</h4>
           <div className="flex flex-col gap-4">
             <p><span className="font-semibold text-gray-400 mr-2">Email:</span> tanushreenayal17@gmail.com</p>
             <p><span className="font-semibold text-gray-400 mr-2">Phone:</span> +91 62 123 9045678</p>
           </div>
        </div>

        <div className="footer-column">
          <h4 className="text-[#FADA5E] uppercase tracking-wider mb-4 font-semibold">Follow Us</h4>
          <div className="flex gap-5 text-2xl">
            <a href="https://www.linkedin.com/in/tanushree-nayal-466816275" aria-label="Linkedin" className="hover:text-[#64A6BD] transition-colors duration-300"><FaLinkedin /></a>
            <a href="https://github.com/jasmine1711" aria-label="Github" className="hover:text-[#F76300] transition-colors duration-300"><FaGithub /></a>
            <a href="https://www.instagram.com/moonbo_01/" aria-label="Instagram" className="hover:text-[#F49AC2] transition-colors duration-300"><FaInstagram /></a>
          </div>
        </div>

      </div>

      {/* --- Your Copyright & Color Palette Bar --- */}
      <div className="bg-[#222] text-gray-400 py-6 px-4 border-t border-gray-800">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* THIS IS THE COPYRIGHT LINE */}
          <p className="text-sm md:text-base">
            &copy; {new Date().getFullYear()} {/* Dynamically updates the year */}
            <span className="font-bold text-[#FADA5E]"> ÆTHER</span>. Whispered Style, Timeless Trends.
          </p>
          
          <div className="flex space-x-2">
            <span className="w-5 h-5 rounded-full bg-[#F49AC2] border border-gray-700" title="Pastel Magenta"></span>
            <span className="w-5 h-5 rounded-full bg-[#FADA5E] border border-gray-700" title="Naples Yellow"></span>
            <span className="w-5 h-5 rounded-full bg-[#48D1CC] border border-gray-700" title="Jellyfish"></span>
            <span className="w-5 h-5 rounded-full bg-[#F76300] border border-gray-700" title="Basketball Orange"></span>
            <span className="w-5 h-5 rounded-full bg-[#64A6BD] border border-gray-700" title="Neptune"></span>
            <span className="w-5 h-5 rounded-full bg-[#CF1020] border border-gray-700" title="Lava Red"></span>
          </div>
        </div>
      </div>
      
    </footer>
  );
};

export default Footer;