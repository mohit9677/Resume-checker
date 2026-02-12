import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { candidateAPI, otpAPI, applicationAPI } from '../utils/api'
import { getStates, getCitiesByState } from '../data/indianLocations'

function ApplicationPage() {
    const navigate = useNavigate()
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)

    // Form data
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        city: '',
        state: '',
        linkedin: '',
        collegeName: '',
        currentCompany: '',
        jobCategory: '',
        customJobRole: '',
        description: ''
    })

    // Job Categories
    const jobCategories = [
        'Web Developers (Frontend / Backend / Full Stack)',
        'Mobile App Developers (Android / iOS / Flutter / React Native)',
        'AI / ML Engineers',
        'Cloud & DevOps Engineers',
        'UI / UX Designers',
        'Data Analysts & Database Engineers',
        'Cyber Security & Ethical Hackers',
        'Software Testers / QA Engineers',
        'Other',
        'Custom (User-defined role)'
    ]

    // Available cities based on selected state
    const [availableCities, setAvailableCities] = useState([])

    // OTP state
    const [otp, setOtp] = useState('')
    const [otpSent, setOtpSent] = useState(false)
    const [canResend, setCanResend] = useState(false)

    // Resume state
    const [resumeFile, setResumeFile] = useState(null)

    // Form errors
    const [errors, setErrors] = useState({})

    // Handle input change
    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }))
        }
    }

    // Handle state change (update cities)
    const handleStateChange = (e) => {
        const selectedState = e.target.value
        setFormData(prev => ({
            ...prev,
            state: selectedState,
            city: '' // Reset city when state changes
        }))
        setAvailableCities(getCitiesByState(selectedState))
        if (errors.state) {
            setErrors(prev => ({ ...prev, state: '', city: '' }))
        }
    }

    // Handle phone input (numeric only, max 10 digits)
    const handlePhoneChange = (e) => {
        const value = e.target.value.replace(/\D/g, '') // Remove non-digits
        if (value.length <= 10) {
            setFormData(prev => ({ ...prev, phone: value }))
            if (errors.phone) {
                setErrors(prev => ({ ...prev, phone: '' }))
            }
        }
    }

    // Validate step 1
    const validateStep1 = () => {
        const newErrors = {}

        if (!formData.fullName.trim()) newErrors.fullName = 'Name is required'
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Invalid email format'
        }
        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone is required'
        } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
            newErrors.phone = 'Phone must be 10 digits'
        }
        if (!formData.city.trim()) newErrors.city = 'City is required'
        if (!formData.state.trim()) newErrors.state = 'State is required'
        if (!formData.collegeName.trim()) newErrors.collegeName = 'College name is required'
        if (!formData.jobCategory) newErrors.jobCategory = 'Job category is required'
        if (formData.jobCategory === 'Custom (User-defined role)' && !formData.customJobRole.trim()) {
            newErrors.customJobRole = 'Custom job role is required'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    // Step 1: Submit personal info and send OTP
    const handleStep1Submit = async (e) => {
        e.preventDefault()

        if (!validateStep1()) {
            toast.error('Please fix the errors in the form')
            return
        }

        setLoading(true)

        try {
            // Check if email has reached submission limit (3)
            const { data: duplicateCheck } = await candidateAPI.checkDuplicate(formData.email)

            console.log('Duplicate check response:', duplicateCheck)

            // Use fallback values if response is malformed
            const canSubmit = duplicateCheck?.canSubmit !== false
            const count = duplicateCheck?.count ?? 0
            const limit = duplicateCheck?.limit ?? 3
            const remaining = duplicateCheck?.remaining ?? (limit - count)

            if (!canSubmit) {
                toast.error(`You have reached the maximum limit of ${limit} applications for this email address. (${count}/${limit} used)`)
                setLoading(false)
                return
            }

            // Show remaining submissions info
            if (count > 0) {
                toast.info(`Submissions remaining: ${remaining}/${limit}`, { autoClose: 3000 })
            }

            // Send OTP
            await otpAPI.send(formData.email)
            setOtpSent(true)
            toast.success('OTP sent to your email!')
            setStep(2)

            // Enable resend after 60 seconds
            setTimeout(() => setCanResend(true), 60000)

        } catch (error) {
            console.error("OTP API Error:", error);
            toast.error(error.response?.data?.message || 'Failed to send OTP')
        } finally {
            setLoading(false)
        }
    }

    // Resend OTP
    const handleResendOTP = async () => {
        setLoading(true)
        try {
            await otpAPI.send(formData.email)
            toast.success('OTP resent to your email!')
            setCanResend(false)
            setTimeout(() => setCanResend(true), 60000)
        } catch (error) {
            toast.error('Failed to resend OTP')
        } finally {
            setLoading(false)
        }
    }

    // Step 2: Verify OTP
    const handleOTPVerify = async (e) => {
        e.preventDefault()

        if (!otp || otp.length !== 6) {
            toast.error('Please enter a valid 6-digit OTP')
            return
        }

        setLoading(true)

        try {
            const { data } = await otpAPI.verify(formData.email, otp)

            if (data.verified) {
                toast.success('Email verified successfully!')
                setStep(3)
            } else {
                toast.error('Invalid or expired OTP')
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'OTP verification failed')
        } finally {
            setLoading(false)
        }
    }

    // Handle file selection
    const handleFileChange = (e) => {
        const file = e.target.files[0]

        if (!file) return

        // Validate file type
        const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
        if (!allowedTypes.includes(file.type)) {
            toast.error('Only PDF and DOCX files are allowed')
            return
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('File size must be less than 5MB')
            return
        }

        setResumeFile(file)
    }

    // Step 3: Submit resume
    const handleFinalSubmit = async (e) => {
        e.preventDefault()

        if (!resumeFile) {
            toast.error('Please upload your resume')
            return
        }

        console.log("Submitting:", { jobCategory: formData.jobCategory, customJobRole: formData.customJobRole });

        setLoading(true)

        try {
            const formDataToSend = new FormData()
            formDataToSend.append('fullName', formData.fullName)
            formDataToSend.append('email', formData.email)
            formDataToSend.append('phone', formData.phone)
            formDataToSend.append('city', formData.city)
            formDataToSend.append('state', formData.state)
            formDataToSend.append('linkedin', formData.linkedin)
            formDataToSend.append('collegeName', formData.collegeName)
            formDataToSend.append('currentCompany', formData.currentCompany)
            // Backend expects "Custom", frontend has "Custom (User-defined role)"
            // Mapping for clearer backend storage
            const backendCategory = formData.jobCategory === 'Custom (User-defined role)' ? 'Custom' : formData.jobCategory
            formDataToSend.append('jobCategory', backendCategory)
            if (backendCategory === 'Custom') {
                formDataToSend.append('customJobRole', formData.customJobRole)
            }
            formDataToSend.append('description', formData.description)
            formDataToSend.append('resume', resumeFile)

            // DEBUG LOG FOR VERIFICATION
            console.log('🚀 [Frontend] Sending Payload:', {
                jobCategory: backendCategory,
                customJobRole: formData.customJobRole,
                fullName: formData.fullName
            });
            for (let [key, value] of formDataToSend.entries()) {
                console.log(`FormData: ${key} = ${value}`);
            }

            const { data } = await applicationAPI.submit(formDataToSend)

            toast.success('Application submitted successfully!')

            setTimeout(() => {
                navigate('/success', {
                    state: {
                        applicationId: data.applicationId,
                        qualified: data.qualified,
                        atsScore: data.atsScore,
                        result: data.result
                    }
                })
            }, 1500);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to submit application')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="application-page">
            <div className="container-narrow">
                <div className="app-header">
                    <h1 className="text-center">Join Our Team</h1>
                    <div className="steps-indicator">
                        <div className={`step ${step >= 1 ? 'active' : ''}`}>
                            <div className="step-number">1</div>
                            <div className="step-label">Personal Info</div>
                        </div>
                        <div className="step-line"></div>
                        <div className={`step ${step >= 2 ? 'active' : ''}`}>
                            <div className="step-number">2</div>
                            <div className="step-label">Verify Email</div>
                        </div>
                        <div className="step-line"></div>
                        <div className={`step ${step >= 3 ? 'active' : ''}`}>
                            <div className="step-number">3</div>
                            <div className="step-label">Upload Resume</div>
                        </div>
                    </div>
                </div>

                <div className="form-container glass-card">
                    {/* Step 1: Personal Information */}
                    {step === 1 && (
                        <form onSubmit={handleStep1Submit}>
                            <h2 className="form-title">Personal Information</h2>

                            <div className="form-group">
                                <label className="form-label">Full Name *</label>
                                <input
                                    type="text"
                                    name="fullName"
                                    className="form-input"
                                    placeholder="Enter your full name"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                />
                                {errors.fullName && <div className="form-error">{errors.fullName}</div>}
                            </div>

                            <div className="form-group">
                                <label className="form-label">Email Address *</label>
                                <input
                                    type="email"
                                    name="email"
                                    className="form-input"
                                    placeholder="your.email@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                                {errors.email && <div className="form-error">{errors.email}</div>}
                            </div>

                            <div className="form-group">
                                <label className="form-label">Phone Number *</label>
                                <input
                                    type="text"
                                    name="phone"
                                    className="form-input"
                                    placeholder="10-digit phone number"
                                    value={formData.phone}
                                    onChange={handlePhoneChange}
                                    maxLength="10"
                                    inputMode="numeric"
                                />
                                {errors.phone && <div className="form-error">{errors.phone}</div>}
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">State *</label>
                                    <select
                                        name="state"
                                        className="form-select"
                                        value={formData.state}
                                        onChange={handleStateChange}
                                    >
                                        <option value="">Select your state</option>
                                        {getStates().map(state => (
                                            <option key={state} value={state}>{state}</option>
                                        ))}
                                    </select>
                                    {errors.state && <div className="form-error">{errors.state}</div>}
                                </div>

                                <div className="form-group">
                                    <label className="form-label">City *</label>
                                    <select
                                        name="city"
                                        className="form-select"
                                        value={formData.city}
                                        onChange={handleChange}
                                        disabled={!formData.state}
                                    >
                                        <option value="">{formData.state ? 'Select your city' : 'Select state first'}</option>
                                        {availableCities.map(city => (
                                            <option key={city} value={city}>{city}</option>
                                        ))}
                                    </select>
                                    {errors.city && <div className="form-error">{errors.city}</div>}
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">LinkedIn Profile (Optional)</label>
                                <input
                                    type="url"
                                    name="linkedin"
                                    className="form-input"
                                    placeholder="https://linkedin.com/in/yourprofile"
                                    value={formData.linkedin}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">College/University Name *</label>
                                <input
                                    type="text"
                                    name="collegeName"
                                    className="form-input"
                                    placeholder="Enter your college or university name"
                                    value={formData.collegeName}
                                    onChange={handleChange}
                                />
                                {errors.collegeName && <div className="form-error">{errors.collegeName}</div>}
                            </div>

                            <div className="form-group">
                                <label className="form-label">Current Company (Optional)</label>
                                <input
                                    type="text"
                                    name="currentCompany"
                                    className="form-input"
                                    placeholder="Where you currently work (if applicable)"
                                    value={formData.currentCompany}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Job Category *</label>
                                <select
                                    name="jobCategory"
                                    className="form-select"
                                    value={formData.jobCategory}
                                    onChange={handleChange}
                                >
                                    <option value="">Select your job category</option>
                                    {jobCategories.map((cat, index) => (
                                        <option key={index} value={cat}>{cat}</option>
                                    ))}
                                </select>
                                {errors.jobCategory && <div className="form-error">{errors.jobCategory}</div>}
                            </div>

                            {formData.jobCategory === 'Custom (User-defined role)' && (
                                <div className="form-group">
                                    <label className="form-label">Your Job Role *</label>
                                    <input
                                        type="text"
                                        name="customJobRole"
                                        className="form-input"
                                        placeholder="Enter your specific job role"
                                        value={formData.customJobRole}
                                        onChange={handleChange}
                                    />
                                    {errors.customJobRole && <div className="form-error">{errors.customJobRole}</div>}
                                </div>
                            )}

                            <div className="form-group">
                                <label className="form-label">About Yourself (Optional)</label>
                                <textarea
                                    name="description"
                                    className="form-textarea"
                                    placeholder="Tell us about yourself, your skills, experience, and why you want to join AstroBharatAI..."
                                    rows="5"
                                    value={formData.description}
                                    onChange={handleChange}
                                />
                                <div className="form-hint" style={{ textAlign: 'left', marginTop: '0.5rem' }}>
                                    {formData.description.length}/500 characters
                                </div>
                            </div>

                            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
                                {loading ? 'Sending OTP...' : 'Next: Verify Email →'}
                            </button>
                        </form>
                    )}

                    {/* Step 2: OTP Verification */}
                    {step === 2 && (
                        <form onSubmit={handleOTPVerify}>
                            <h2 className="form-title">Verify Your Email</h2>
                            <p className="form-subtitle">
                                We've sent a 6-digit OTP to <strong>{formData.email}</strong>
                            </p>

                            <div className="form-group">
                                <label className="form-label">Enter OTP</label>
                                <input
                                    type="text"
                                    className="form-input otp-input"
                                    placeholder="000000"
                                    maxLength="6"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                />
                                <p className="form-hint">Valid for 10 minutes</p>
                            </div>

                            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
                                {loading ? 'Verifying...' : 'Verify OTP'}
                            </button>

                            <div className="text-center mt-md">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={handleResendOTP}
                                    disabled={!canResend || loading}
                                >
                                    {canResend ? 'Resend OTP' : 'Resend OTP (wait 60s)'}
                                </button>
                            </div>

                            <div className="text-center mt-sm">
                                <button
                                    type="button"
                                    className="text-link"
                                    onClick={() => setStep(1)}
                                >
                                    ← Change Email
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Step 3: Resume Upload */}
                    {step === 3 && (
                        <form onSubmit={handleFinalSubmit}>
                            <h2 className="form-title">Upload Your Resume</h2>
                            <p className="form-subtitle">
                                Upload your resume in PDF or DOCX format (max 5MB)
                            </p>

                            <div className="upload-area">
                                <input
                                    type="file"
                                    id="resume-upload"
                                    accept=".pdf,.docx"
                                    onChange={handleFileChange}
                                    style={{ display: 'none' }}
                                />
                                <label htmlFor="resume-upload" className="upload-label">
                                    {resumeFile ? (
                                        <div className="file-selected">
                                            <div className="file-icon">📄</div>
                                            <div className="file-name">{resumeFile.name}</div>
                                            <div className="file-size">
                                                {(resumeFile.size / 1024 / 1024).toFixed(2)} MB
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="upload-icon">☁️</div>
                                            <div className="upload-text">Click to upload or drag and drop</div>
                                            <div className="upload-hint">PDF or DOCX (max 5MB)</div>
                                        </>
                                    )}
                                </label>
                            </div>

                            {resumeFile && (
                                <button type="submit" className="btn btn-primary btn-lg mt-lg" style={{ width: '100%' }} disabled={loading}>
                                    {loading ? 'Submitting...' : 'Submit Application ✨'}
                                </button>
                            )}
                        </form>
                    )}
                </div>
            </div>

            <style jsx>{`
        .application-page {
          min-height: 100vh;
          padding: 160px 0 var(--space-2xl);
        }

        .app-header {
          margin-bottom: var(--space-2xl);
        }

        .steps-indicator {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: var(--space-xl);
          gap: var(--space-sm);
        }

        .step {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-xs);
        }

        .step-number {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          border: 2px solid rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 1.25rem;
          transition: all 0.3s ease;
        }

        .step.active .step-number {
          background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
          color: var(--color-text-light);
          border-color: var(--color-primary);
        }

        .step-label {
          font-size: 0.875rem;
          color: var(--color-text-secondary);
        }

        .step.active .step-label {
          color: var(--color-primary);
          font-weight: 600;
        }

        .step-line {
          width: 60px;
          height: 2px;
          background: rgba(255, 255, 255, 0.2);
        }

        .form-container {
          max-width: 600px;
          margin: 0 auto;
          padding: var(--space-2xl);
        }

        .form-title {
          text-align: center;
          margin-bottom: var(--space-sm);
          color: var(--color-primary);
        }

        .form-subtitle {
          text-align: center;
          margin-bottom: var(--space-xl);
          color: var(--color-text-secondary);
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-md);
        }

        .otp-input {
          text-align: center;
          font-size: 1.5rem;
          letter-spacing: 0.5em;
          font-weight: 700;
        }

        .form-hint {
          text-align: center;
          font-size: 0.875rem;
          color: var(--color-text-secondary);
          margin-top: var(--space-xs);
        }

        .text-link {
          background: none;
          border: none;
          color: var(--color-primary);
          cursor: pointer;
          font-size: 0.875rem;
          transition: opacity 0.3s ease;
        }

        .text-link:hover {
          opacity: 0.8;
        }

        /* Upload Area */
        .upload-area {
          margin-top: var(--space-lg);
        }

        .upload-label {
          display: block;
          padding: var(--space-2xl);
          border: 2px dashed rgba(255, 255, 255, 0.2);
          border-radius: var(--radius-md);
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .upload-label:hover {
          border-color: var(--color-primary);
          background: rgba(92, 26, 26, 0.05);
        }

        .upload-icon {
          font-size: 3rem;
          margin-bottom: var(--space-sm);
        }

        .upload-text {
          font-size: 1.125rem;
          margin-bottom: var(--space-xs);
        }

        .upload-hint {
          font-size: 0.875rem;
          color: var(--color-text-secondary);
        }

        .file-selected {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-sm);
        }

        .file-icon {
          font-size: 3rem;
        }

        .file-name {
          font-weight: 600;
          color: var(--color-primary);
        }

        .file-size {
          font-size: 0.875rem;
          color: var(--color-text-secondary);
        }

        @media (max-width: 768px) {
          .form-row {
            grid-template-columns: 1fr;
          }

          .steps-indicator {
            flex-wrap: wrap;
          }

          .step-line {
            display: none;
          }
        }
      `}</style>
        </div>
    )
}

export default ApplicationPage
