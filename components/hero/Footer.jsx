import React from "react";
import Link from "next/link";
import { 
  Mail,
  Phone,
  MapPin
} from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-[#37AFE1] text-white py-12">
      <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-4 gap-8">
        {/* Company Info */}
        <div>
          <h3 className="text-2xl font-bold mb-4">Treato</h3>
          <p className="text-sm mb-4">
            Comprehensive healthcare monitoring and support solutions for individuals and organizations.
          </p>
          <div className="space-y-2">
            <div className="flex items-center">
              <Mail className="mr-2" size={16} />
              <span>support@treato.com</span>
            </div>
            <div className="flex items-center">
              <Phone className="mr-2" size={16} />
              <span>+91 123 456 7890</span>
            </div>
            <div className="flex items-center">
              <MapPin className="mr-2" size={16} />
              <span>Bangalore, India</span>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-bold mb-4">Quick Links</h4>
          <ul className="space-y-2">
            <li><Link href="/pricing" className="hover:underline">Pricing</Link></li>
            <li><Link href="/features" className="hover:underline">Features</Link></li>
            <li><Link href="/about" className="hover:underline">About Us</Link></li>
            <li><Link href="/contact" className="hover:underline">Contact</Link></li>
          </ul>
        </div>

        {/* Legal Links */}
        <div>
          <h4 className="font-bold mb-4">Legal</h4>
          <ul className="space-y-2">
            <li>
              <Link href="/terms-and-conditions" className="hover:underline">
                Terms and Conditions
              </Link>
            </li>
            <li>
              <Link href="/privacy-policy" className="hover:underline">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/refund-policy" className="hover:underline">
                Refund Policy
              </Link>
            </li>
          </ul>
        </div>

        {/* Newsletter Signup */}
        <div>
          <h4 className="font-bold mb-4">Stay Updated</h4>
          <p className="text-sm mb-4">
            Subscribe to our newsletter for health tips and updates
          </p>
          <div className="flex">
            <input 
              type="email" 
              placeholder="Enter your email" 
              className="p-2 rounded-l text-black w-full"
            />
            <button className="bg-white text-[#37AFE1] p-2 rounded-r">
              Subscribe
            </button>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="text-center mt-8 border-t border-white/20 pt-4">
        <p className="text-sm">
          © {new Date().getFullYear()} Treato Healthcare. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;