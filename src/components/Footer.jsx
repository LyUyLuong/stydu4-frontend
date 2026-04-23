import { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Globe, Facebook, Twitter, Instagram, Linkedin, Clock } from 'lucide-react';

const Footer = () => {
  const [settings, setSettings] = useState({
    companyName: 'Stydu4 TOEIC Learning Platform',
    description: 'Professional TOEIC test preparation platform with comprehensive learning materials and practice tests.',
    email: 'contact@stydu4.com',
    phone: '+1 234 567 8900',
    address: '123 Education Street, Learning City, LC 12345',
    website: 'https://www.stydu4.com',
    facebook: 'https://facebook.com/stydu4',
    twitter: 'https://twitter.com/stydu4',
    instagram: 'https://instagram.com/stydu4',
    linkedin: 'https://linkedin.com/company/stydu4',
    workingHours: 'Monday - Friday: 9:00 AM - 6:00 PM',
    copyright: '© 2024 Stydu4. All rights reserved.',
  });

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('siteSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        if (parsed.footer) {
          setSettings(parsed.footer);
        }
      } catch (error) {
        console.error('Error loading footer settings:', error);
      }
    }
  }, []);

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <h3 className="text-white text-xl font-bold mb-4">{settings.companyName}</h3>
            <p className="text-gray-400 mb-4 leading-relaxed">
              {settings.description}
            </p>
            
            {/* Social Media */}
            <div className="flex gap-4">
              {settings.facebook && (
                <a
                  href={settings.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-800 hover:bg-blue-600 rounded-full flex items-center justify-center transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook className="h-5 w-5" />
                </a>
              )}
              {settings.twitter && (
                <a
                  href={settings.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-800 hover:bg-sky-500 rounded-full flex items-center justify-center transition-colors"
                  aria-label="Twitter"
                >
                  <Twitter className="h-5 w-5" />
                </a>
              )}
              {settings.instagram && (
                <a
                  href={settings.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-800 hover:bg-pink-600 rounded-full flex items-center justify-center transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="h-5 w-5" />
                </a>
              )}
              {settings.linkedin && (
                <a
                  href={settings.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-800 hover:bg-blue-700 rounded-full flex items-center justify-center transition-colors"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
              )}
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white text-lg font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-primary-500 mt-0.5 flex-shrink-0" />
                <a href={`mailto:${settings.email}`} className="hover:text-white transition-colors">
                  {settings.email}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-primary-500 mt-0.5 flex-shrink-0" />
                <a href={`tel:${settings.phone.replace(/\s/g, '')}`} className="hover:text-white transition-colors">
                  {settings.phone}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary-500 mt-0.5 flex-shrink-0" />
                <span>{settings.address}</span>
              </li>
              {settings.website && (
                <li className="flex items-start gap-3">
                  <Globe className="h-5 w-5 text-primary-500 mt-0.5 flex-shrink-0" />
                  <a
                    href={settings.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors"
                  >
                    {settings.website.replace(/^https?:\/\//, '')}
                  </a>
                </li>
              )}
            </ul>
          </div>

          {/* Quick Links & Hours */}
          <div>
            <h4 className="text-white text-lg font-semibold mb-4">Information</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-primary-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-white font-medium mb-1">Working Hours</p>
                  <p className="text-sm">{settings.workingHours}</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400">
              {settings.copyright}
            </p>
            <div className="flex gap-6 text-sm">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Support</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
