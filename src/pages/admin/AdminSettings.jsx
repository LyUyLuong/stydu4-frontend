import { useState, useEffect } from 'react';
import { Settings, Image, Phone, Mail, MapPin, Save, Upload, Globe, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminSettings = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Header settings
  const [headerImage, setHeaderImage] = useState(null);
  const [headerImagePreview, setHeaderImagePreview] = useState('');
  const [logoText, setLogoText] = useState('Stydu4 TOEIC');
  
  // Footer contact settings
  const [footerSettings, setFooterSettings] = useState({
    companyName: 'Stydu4 TOEIC Learning Platform',
    description: 'Professional TOEIC test preparation platform with comprehensive learning materials and practice tests.',
    email: 'contact@stydu4.com',
    phone: '+1 234 567 8900',
    address: '123 Education Street, Learning City, LC 12345',
    website: 'https://www.stydu4.com',
    
    // Social media
    facebook: 'https://facebook.com/stydu4',
    twitter: 'https://twitter.com/stydu4',
    instagram: 'https://instagram.com/stydu4',
    linkedin: 'https://linkedin.com/company/stydu4',
    
    // Additional info
    workingHours: 'Monday - Friday: 9:00 AM - 6:00 PM',
    copyright: '© 2024 Stydu4. All rights reserved.',
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      // Load from localStorage for now (in production, this would be an API call)
      const savedSettings = localStorage.getItem('siteSettings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        if (settings.headerImagePreview) setHeaderImagePreview(settings.headerImagePreview);
        if (settings.logoText) setLogoText(settings.logoText);
        if (settings.footer) setFooterSettings(settings.footer);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleHeaderImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      
      setHeaderImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setHeaderImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFooterChange = (field, value) => {
    setFooterSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      
      // In production, this would be an API call
      // For now, save to localStorage
      const settingsToSave = {
        headerImagePreview,
        logoText,
        footer: footerSettings,
        updatedAt: new Date().toISOString()
      };
      
      localStorage.setItem('siteSettings', JSON.stringify(settingsToSave));
      
      toast.success('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Website Settings</h1>
          <p className="text-gray-600 mt-1">Manage header, footer, and contact information</p>
        </div>
        <button
          onClick={handleSaveSettings}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Save className="h-4 w-4" />
          {saving ? 'Saving...' : 'Save All Changes'}
        </button>
      </div>

      {/* Header Settings */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-2 mb-1">
            <Image className="h-5 w-5 text-primary-600" />
            <h2 className="text-lg font-semibold text-gray-900">Header Settings</h2>
          </div>
          <p className="text-sm text-gray-600">Configure website header and branding</p>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Logo Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Logo Text
            </label>
            <input
              type="text"
              value={logoText}
              onChange={(e) => setLogoText(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Enter logo text"
            />
          </div>

          {/* Header Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Header/Banner Image
            </label>
            <div className="mt-2">
              {headerImagePreview && (
                <div className="mb-4">
                  <img
                    src={headerImagePreview}
                    alt="Header preview"
                    className="h-32 w-auto rounded-lg border border-gray-300 object-cover"
                  />
                </div>
              )}
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <Upload className="h-4 w-4" />
                  <span className="text-sm font-medium">Upload Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleHeaderImageChange}
                    className="hidden"
                  />
                </label>
                <span className="text-sm text-gray-500">Max size: 5MB</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Contact Settings */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-2 mb-1">
            <Phone className="h-5 w-5 text-primary-600" />
            <h2 className="text-lg font-semibold text-gray-900">Footer & Contact Information</h2>
          </div>
          <p className="text-sm text-gray-600">Manage footer content and contact details</p>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Company Info */}
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name
              </label>
              <input
                type="text"
                value={footerSettings.companyName}
                onChange={(e) => handleFooterChange('companyName', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={footerSettings.description}
                onChange={(e) => handleFooterChange('description', e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </div>
              </label>
              <input
                type="email"
                value={footerSettings.email}
                onChange={(e) => handleFooterChange('email', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone
                </div>
              </label>
              <input
                type="text"
                value={footerSettings.phone}
                onChange={(e) => handleFooterChange('phone', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Address
                </div>
              </label>
              <input
                type="text"
                value={footerSettings.address}
                onChange={(e) => handleFooterChange('address', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Website
                </div>
              </label>
              <input
                type="url"
                value={footerSettings.website}
                onChange={(e) => handleFooterChange('website', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Social Media Links</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Facebook className="h-4 w-4 text-blue-600" />
                    Facebook
                  </div>
                </label>
                <input
                  type="url"
                  value={footerSettings.facebook}
                  onChange={(e) => handleFooterChange('facebook', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="https://facebook.com/..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Twitter className="h-4 w-4 text-sky-500" />
                    Twitter
                  </div>
                </label>
                <input
                  type="url"
                  value={footerSettings.twitter}
                  onChange={(e) => handleFooterChange('twitter', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="https://twitter.com/..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Instagram className="h-4 w-4 text-pink-600" />
                    Instagram
                  </div>
                </label>
                <input
                  type="url"
                  value={footerSettings.instagram}
                  onChange={(e) => handleFooterChange('instagram', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="https://instagram.com/..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Linkedin className="h-4 w-4 text-blue-700" />
                    LinkedIn
                  </div>
                </label>
                <input
                  type="url"
                  value={footerSettings.linkedin}
                  onChange={(e) => handleFooterChange('linkedin', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="https://linkedin.com/company/..."
                />
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Working Hours
              </label>
              <input
                type="text"
                value={footerSettings.workingHours}
                onChange={(e) => handleFooterChange('workingHours', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Copyright Text
              </label>
              <input
                type="text"
                value={footerSettings.copyright}
                onChange={(e) => handleFooterChange('copyright', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Preview Section */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-sm border border-blue-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary-600" />
          Preview
        </h3>
        <div className="bg-white rounded-lg p-6 space-y-4">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Header</h4>
            <div className="flex items-center gap-3">
              {headerImagePreview && (
                <img src={headerImagePreview} alt="Logo" className="h-10 w-auto" />
              )}
              <span className="text-xl font-bold text-primary-600">{logoText}</span>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-4">
            <h4 className="font-semibold text-gray-900 mb-2">Footer Contact</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p className="font-medium text-gray-900">{footerSettings.companyName}</p>
              <p>{footerSettings.description}</p>
              <p className="flex items-center gap-2"><Mail className="h-4 w-4" /> {footerSettings.email}</p>
              <p className="flex items-center gap-2"><Phone className="h-4 w-4" /> {footerSettings.phone}</p>
              <p className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {footerSettings.address}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button at Bottom */}
      <div className="flex justify-end">
        <button
          onClick={handleSaveSettings}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Save className="h-5 w-5" />
          {saving ? 'Saving Changes...' : 'Save All Changes'}
        </button>
      </div>
    </div>
  );
};

export default AdminSettings;
