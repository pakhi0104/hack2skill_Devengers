import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { AppLayout } from '../components/layout/AppLayout';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Dropdown } from '../components/ui/Dropdown';
import { Button } from '../components/ui/Button';
import { 
  User, 
  Mail, 
  Calendar, 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  Wallet, 
  Tag, 
  Edit3, 
  Save, 
  X,
  Camera
} from 'lucide-react';
import { Badge } from '../components/ui/Badge';

const STATES_OF_INDIA = [
  'Select State',
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 
  'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu & Kashmir', 'Ladakh', 'Other'
];

const INCOME_RANGES = [
  'Select Income Range',
  'Below ₹1 Lakh per annum',
  '₹1 Lakh to ₹2.5 Lakhs per annum',
  '₹2.5 Lakhs to ₹5 Lakhs per annum',
  '₹5 Lakhs to ₹10 Lakhs per annum',
  'Above ₹10 Lakhs per annum'
];

export const ProfilePage: React.FC = () => {
  const { profile, updateProfile } = useAuth();
  const { success, error } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form states initialized with profile data
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'Male',
    state: 'Select State',
    city: '',
    occupation: 'Select Occupation',
    education: '',
    incomeRange: 'Select Income Range',
    category: 'Select Category',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        age: profile.age ? String(profile.age) : '',
        gender: profile.gender || 'Male',
        state: profile.state || 'Select State',
        city: profile.city || '',
        occupation: profile.occupation || 'Select Occupation',
        education: profile.education || '',
        incomeRange: profile.income_range || 'Select Income Range',
        category: profile.category || 'Select Category',
      });
    }
  }, [profile, isEditing]);

  const validate = () => {
    const errs: Record<string, string> = {};
    let valid = true;

    if (!formData.name.trim()) {
      errs.name = 'Full name is required';
      valid = false;
    }
    if (!formData.age) {
      errs.age = 'Age is required';
      valid = false;
    } else {
      const ageNum = parseInt(formData.age);
      if (isNaN(ageNum) || ageNum <= 0 || ageNum > 120) {
        errs.age = 'Enter a valid age';
        valid = false;
      }
    }
    if (formData.state === 'Select State') {
      errs.state = 'State selection is required';
      valid = false;
    }
    if (!formData.city.trim()) {
      errs.city = 'City name is required';
      valid = false;
    }
    if (formData.occupation === 'Select Occupation') {
      errs.occupation = 'Occupation selection is required';
      valid = false;
    }
    if (!formData.education.trim()) {
      errs.education = 'Education is required';
      valid = false;
    }
    if (formData.incomeRange === 'Select Income Range') {
      errs.incomeRange = 'Income range is required';
      valid = false;
    }
    if (formData.category === 'Select Category') {
      errs.category = 'Category selection is required';
      valid = false;
    }

    setFormErrors(errs);
    return valid;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSaving(true);
    try {
      const { error: err } = await updateProfile({
        name: formData.name,
        age: parseInt(formData.age),
        gender: formData.gender,
        state: formData.state,
        city: formData.city,
        occupation: formData.occupation,
        education: formData.education,
        income_range: formData.incomeRange,
        category: formData.category,
      });

      if (err) {
        error('Profile Update Failed', err);
      } else {
        success('Profile Updated', 'Your profile details have been synced to Supabase. Your recommendations may have changed based on your new profile information.');
        setIsEditing(false);
      }
    } catch (err: any) {
      error('An error occurred', err.message || 'Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const avatarLetter = formData.name?.[0]?.toUpperCase() || 'U';

  return (
    <AppLayout showFooter={true}>
      <div className="max-w-4xl mx-auto px-6 py-10 w-full">
        <div className="flex items-center justify-between mb-8 select-none">
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
            My Profile
          </h2>
          {!isEditing && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsEditing(true)}
              leftIcon={<Edit3 className="w-4 h-4" />}
            >
              Edit Profile
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* PROFILE SUMMARY LEFT SECTION */}
          <div className="md:col-span-4 flex flex-col items-center gap-5 text-center">
            <Card hoverable={false} animate={false} className="w-full py-8 flex flex-col items-center">
              {/* Picture Placeholder */}
              <div className="relative group select-none">
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-brand-500 via-accent-purple to-accent-cyan flex items-center justify-center text-white font-extrabold text-3xl shadow-lg shadow-brand-500/10">
                  {avatarLetter}
                </div>
                <div className="absolute inset-0 bg-slate-950/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Camera className="w-6 h-6 text-white" />
                </div>
              </div>

              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mt-4 leading-none truncate w-full max-w-[200px]">
                {formData.name || 'User'}
              </h3>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 font-sans mt-1 leading-none truncate w-full max-w-[200px]">
                {profile?.email || 'email@example.com'}
              </p>

              {/* Status Tags */}
              <div className="flex flex-wrap justify-center gap-1.5 mt-5">
                {profile?.occupation && profile.occupation !== 'Select Occupation' && (
                  <Badge variant="primary">{profile.occupation}</Badge>
                )}
                {profile?.category && profile.category !== 'Select Category' && (
                  <Badge variant="purple">{profile.category}</Badge>
                )}
              </div>
            </Card>
          </div>

          {/* DETAILED PROFILE FORM CONTAINER */}
          <div className="md:col-span-8">
            <Card hoverable={false} animate={false}>
              <form onSubmit={handleSave} className="space-y-6">
                
                {/* Form Inputs Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {isEditing ? (
                    <Input
                      label="Full Name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      error={formErrors.name}
                      leftIcon={<User className="w-4 h-4" />}
                      required
                    />
                  ) : (
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-sans">Full Name</span>
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200 bg-slate-50/50 dark:bg-slate-900/30 p-3 rounded-xl border border-slate-100 dark:border-slate-800/40">
                        <User className="w-4 h-4 text-slate-400" />
                        <span>{formData.name || 'Not provided'}</span>
                      </div>
                    </div>
                  )}

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-sans">Email Address</span>
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 bg-slate-100/50 dark:bg-slate-950/20 p-3 rounded-xl border border-slate-150 dark:border-slate-900/30 select-none">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <span>{profile?.email || 'email@example.com'}</span>
                    </div>
                  </div>

                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {isEditing ? (
                    <Input
                      label="Age"
                      type="number"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      error={formErrors.age}
                      leftIcon={<Calendar className="w-4 h-4" />}
                      required
                    />
                  ) : (
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-sans">Age</span>
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200 bg-slate-50/50 dark:bg-slate-900/30 p-3 rounded-xl border border-slate-100 dark:border-slate-800/40">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span>{formData.age ? `${formData.age} years` : 'Not provided'}</span>
                      </div>
                    </div>
                  )}

                  {isEditing ? (
                    <Dropdown
                      label="Gender"
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      options={['Male', 'Female', 'Non-binary', 'Prefer not to say']}
                    />
                  ) : (
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-sans">Gender</span>
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200 bg-slate-50/50 dark:bg-slate-900/30 p-3 rounded-xl border border-slate-100 dark:border-slate-800/40">
                        <User className="w-4 h-4 text-slate-400" />
                        <span>{formData.gender || 'Not provided'}</span>
                      </div>
                    </div>
                  )}

                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {isEditing ? (
                    <Dropdown
                      label="State"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      options={STATES_OF_INDIA}
                      error={formErrors.state}
                    />
                  ) : (
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-sans">State</span>
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200 bg-slate-50/50 dark:bg-slate-900/30 p-3 rounded-xl border border-slate-100 dark:border-slate-800/40">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        <span>{formData.state === 'Select State' ? 'Not selected' : formData.state}</span>
                      </div>
                    </div>
                  )}

                  {isEditing ? (
                    <Input
                      label="City"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      error={formErrors.city}
                      leftIcon={<MapPin className="w-4 h-4" />}
                      required
                    />
                  ) : (
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-sans">City</span>
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200 bg-slate-50/50 dark:bg-slate-900/30 p-3 rounded-xl border border-slate-100 dark:border-slate-800/40">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        <span>{formData.city || 'Not provided'}</span>
                      </div>
                    </div>
                  )}

                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {isEditing ? (
                    <Dropdown
                      label="Occupation"
                      value={formData.occupation}
                      onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                      options={['Select Occupation', 'Student', 'Employee', 'Farmer', 'Business Owner', 'Homemaker', 'Retired', 'Other']}
                      error={formErrors.occupation}
                    />
                  ) : (
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-sans">Occupation</span>
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200 bg-slate-50/50 dark:bg-slate-900/30 p-3 rounded-xl border border-slate-100 dark:border-slate-800/40">
                        <Briefcase className="w-4 h-4 text-slate-400" />
                        <span>{formData.occupation === 'Select Occupation' ? 'Not selected' : formData.occupation}</span>
                      </div>
                    </div>
                  )}

                  {isEditing ? (
                    <Input
                      label="Education Qualification"
                      value={formData.education}
                      onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                      error={formErrors.education}
                      leftIcon={<GraduationCap className="w-4 h-4" />}
                      required
                    />
                  ) : (
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-sans">Education</span>
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200 bg-slate-50/50 dark:bg-slate-900/30 p-3 rounded-xl border border-slate-100 dark:border-slate-800/40">
                        <GraduationCap className="w-4 h-4 text-slate-400" />
                        <span>{formData.education || 'Not provided'}</span>
                      </div>
                    </div>
                  )}

                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {isEditing ? (
                    <Dropdown
                      label="Income Range"
                      value={formData.incomeRange}
                      onChange={(e) => setFormData({ ...formData, incomeRange: e.target.value })}
                      options={INCOME_RANGES}
                      error={formErrors.incomeRange}
                    />
                  ) : (
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-sans">Income Range</span>
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200 bg-slate-50/50 dark:bg-slate-900/30 p-3 rounded-xl border border-slate-100 dark:border-slate-800/40">
                        <Wallet className="w-4 h-4 text-slate-400" />
                        <span>{formData.incomeRange === 'Select Income Range' ? 'Not selected' : formData.incomeRange}</span>
                      </div>
                    </div>
                  )}

                  {isEditing ? (
                    <Dropdown
                      label="Social Category"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      options={['Select Category', 'General', 'OBC', 'SC', 'ST', 'EWS', 'Prefer not to say']}
                      error={formErrors.category}
                    />
                  ) : (
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-sans">Social Category</span>
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200 bg-slate-50/50 dark:bg-slate-900/30 p-3 rounded-xl border border-slate-100 dark:border-slate-800/40">
                        <Tag className="w-4 h-4 text-slate-400" />
                        <span>{formData.category === 'Select Category' ? 'Not selected' : formData.category}</span>
                      </div>
                    </div>
                  )}

                </div>

                {/* Edit Controls */}
                {isEditing && (
                  <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-800/40 select-none">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setIsEditing(false)}
                      leftIcon={<X className="w-4 h-4" />}
                      disabled={isSaving}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      isLoading={isSaving}
                      leftIcon={<Save className="w-4 h-4" />}
                    >
                      Save Changes
                    </Button>
                  </div>
                )}
              </form>
            </Card>
          </div>

        </div>
      </div>
    </AppLayout>
  );
};
