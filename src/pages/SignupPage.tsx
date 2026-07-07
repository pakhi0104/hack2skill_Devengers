import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { AppLayout } from '../components/layout/AppLayout';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Dropdown } from '../components/ui/Dropdown';
import { Button } from '../components/ui/Button';
import { ProgressBar } from '../components/ui/ProgressBar';
import { 
  User, 
  Mail, 
  Lock, 
  Calendar, 
  MapPin, 
  GraduationCap, 
  ArrowRight,
  ArrowLeft,
  Check
} from 'lucide-react';
import { motion } from 'framer-motion';

// Mock States and Cities for drop downs
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

export const SignupPage: React.FC = () => {
  const { signUp } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Form Fields State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    age: '',
    gender: 'Select Gender',
    state: 'Select State',
    city: '',
    occupation: 'Select Occupation',
    education: '',
    incomeRange: 'Select Income Range',
    category: 'Select Category',
  });

  // Validation Errors State
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep = (currentStep: number) => {
    const newErrors: Record<string, string> = {};
    let valid = true;

    if (currentStep === 1) {
      if (!formData.name.trim()) {
        newErrors.name = 'Full name is required';
        valid = false;
      }
      if (!formData.email.trim()) {
        newErrors.email = 'Email address is required';
        valid = false;
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
        valid = false;
      }
      if (!formData.password) {
        newErrors.password = 'Password is required';
        valid = false;
      } else if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
        valid = false;
      }
    } else if (currentStep === 2) {
      if (!formData.age) {
        newErrors.age = 'Age is required';
        valid = false;
      } else {
        const ageNum = parseInt(formData.age);
        if (isNaN(ageNum) || ageNum <= 0 || ageNum > 120) {
          newErrors.age = 'Please enter a valid age';
          valid = false;
        }
      }
      if (formData.state === 'Select State') {
        newErrors.state = 'State selection is required';
        valid = false;
      }
      if (!formData.city.trim()) {
        newErrors.city = 'City name is required';
        valid = false;
      }
    } else if (currentStep === 3) {
      if (formData.occupation === 'Select Occupation') {
        newErrors.occupation = 'Please select your current occupation';
        valid = false;
      }
      if (!formData.education.trim()) {
        newErrors.education = 'Education qualification is required';
        valid = false;
      }
      if (formData.incomeRange === 'Select Income Range') {
        newErrors.incomeRange = 'Please select your household income range';
        valid = false;
      }
      if (formData.category === 'Select Category') {
        newErrors.category = 'Please select your category';
        valid = false;
      }
    }

    setErrors(newErrors);
    return valid;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    setStep((prev) => prev - 1);
  };

  const handleFieldChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(3)) return;

    setIsLoading(true);
    try {
      const additionalProfileData = {
        age: parseInt(formData.age),
        gender: formData.gender === 'Select Gender' ? '' : formData.gender,
        state: formData.state,
        city: formData.city,
        occupation: formData.occupation,
        education: formData.education,
        income_range: formData.incomeRange,
        category: formData.category,
      };

      const { error: err } = await signUp(
        formData.email,
        formData.password,
        formData.name,
        additionalProfileData
      );

      if (err) {
        error('Registration Failed', err);
      } else {
        success('Account Created!', 'Welcome to SchemeMatch AI. Your advisor dashboard is ready!');
        navigate('/dashboard');
      }
    } catch (err: any) {
      error('An error occurred', err.message || 'Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLayout showFooter={false}>
      <div className="flex-1 flex items-center justify-center p-6 min-h-[calc(100vh-4rem)]">
        <div className="w-full max-w-xl">
          {/* Progress Tracker */}
          <div className="mb-6 px-4">
            <ProgressBar value={((step - 1) / 2) * 100} showLabel={false} size="sm" />
            <div className="flex justify-between mt-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest select-none">
              <span className={step >= 1 ? 'text-brand-500 font-extrabold' : ''}>Account</span>
              <span className={step >= 2 ? 'text-brand-500 font-extrabold' : ''}>Demographics</span>
              <span className={step >= 3 ? 'text-brand-500 font-extrabold' : ''}>Profile</span>
            </div>
          </div>

          <Card className="p-8 shadow-premium" hoverable={false} animate={false}>
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Create Account
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-sans">
                Personalized scheme matching starts here
              </p>
            </div>

            {/* Slider Panels */}
            <div className="relative overflow-hidden min-h-[300px]">
              <form onSubmit={handleSubmit}>
                {step === 1 && (
                  <motion.div
                    key="step-1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-4"
                  >
                    <Input
                      label="Full Name"
                      placeholder="e.g. Rahul Patil"
                      value={formData.name}
                      onChange={(e) => handleFieldChange('name', e.target.value)}
                      error={errors.name}
                      leftIcon={<User className="w-4 h-4" />}
                      required
                    />

                    <Input
                      label="Email Address"
                      type="email"
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={(e) => handleFieldChange('email', e.target.value)}
                      error={errors.email}
                      leftIcon={<Mail className="w-4 h-4" />}
                      required
                    />

                    <Input
                      label="Password"
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => handleFieldChange('password', e.target.value)}
                      error={errors.password}
                      leftIcon={<Lock className="w-4 h-4" />}
                      required
                    />

                    <div className="flex justify-end pt-4">
                      <Button
                        type="button"
                        onClick={handleNext}
                        rightIcon={<ArrowRight className="w-4 h-4" />}
                      >
                        Continue
                      </Button>
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    key="step-2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="Age"
                        type="number"
                        placeholder="e.g. 24"
                        value={formData.age}
                        onChange={(e) => handleFieldChange('age', e.target.value)}
                        error={errors.age}
                        leftIcon={<Calendar className="w-4 h-4" />}
                        required
                      />

                      <Dropdown
                        label="Gender (Optional)"
                        value={formData.gender}
                        onChange={(e) => handleFieldChange('gender', e.target.value)}
                        options={['Select Gender', 'Male', 'Female', 'Non-binary', 'Prefer not to say']}
                        error={errors.gender}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Dropdown
                        label="State"
                        value={formData.state}
                        onChange={(e) => handleFieldChange('state', e.target.value)}
                        options={STATES_OF_INDIA}
                        error={errors.state}
                      />

                      <Input
                        label="City"
                        placeholder="e.g. Pune"
                        value={formData.city}
                        onChange={(e) => handleFieldChange('city', e.target.value)}
                        error={errors.city}
                        leftIcon={<MapPin className="w-4 h-4" />}
                        required
                      />
                    </div>

                    <div className="flex justify-between pt-4 select-none">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={handlePrev}
                        leftIcon={<ArrowLeft className="w-4 h-4" />}
                      >
                        Back
                      </Button>
                      <Button
                        type="button"
                        onClick={handleNext}
                        rightIcon={<ArrowRight className="w-4 h-4" />}
                      >
                        Continue
                      </Button>
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div
                    key="step-3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Dropdown
                        label="Occupation"
                        value={formData.occupation}
                        onChange={(e) => handleFieldChange('occupation', e.target.value)}
                        options={[
                          'Select Occupation',
                          'Student',
                          'Employee',
                          'Farmer',
                          'Business Owner',
                          'Homemaker',
                          'Retired',
                          'Other'
                        ]}
                        error={errors.occupation}
                      />

                      <Input
                        label="Education Qualification"
                        placeholder="e.g. Graduate"
                        value={formData.education}
                        onChange={(e) => handleFieldChange('education', e.target.value)}
                        error={errors.education}
                        leftIcon={<GraduationCap className="w-4 h-4" />}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Dropdown
                        label="Income Range"
                        value={formData.incomeRange}
                        onChange={(e) => handleFieldChange('incomeRange', e.target.value)}
                        options={INCOME_RANGES}
                        error={errors.incomeRange}
                      />

                      <Dropdown
                        label="Social Category"
                        value={formData.category}
                        onChange={(e) => handleFieldChange('category', e.target.value)}
                        options={['Select Category', 'General', 'OBC', 'SC', 'ST', 'EWS', 'Prefer not to say']}
                        error={errors.category}
                      />
                    </div>

                    <div className="flex justify-between pt-4 select-none">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={handlePrev}
                        leftIcon={<ArrowLeft className="w-4 h-4" />}
                        disabled={isLoading}
                      >
                        Back
                      </Button>
                      <Button
                        type="submit"
                        isLoading={isLoading}
                        rightIcon={<Check className="w-4 h-4" />}
                      >
                        Submit & Create
                      </Button>
                    </div>
                  </motion.div>
                )}
              </form>
            </div>

            {/* Bottom Account Login Link */}
            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/40 text-center select-none">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-bold text-brand-500 hover:text-brand-600 hover:underline transition-colors"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};
