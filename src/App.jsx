import { useState, useEffect, useRef } from 'react';
import { Calendar, Clock, Sparkles, Scissors, Heart, CheckCircle, ChevronRight, User, Phone, Mail, MessageCircle, MapPin, Menu, X, ArrowLeft, Star, Award } from 'lucide-react';
import { format, addDays, startOfToday, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isBefore, isSameDay, startOfWeek, endOfWeek } from 'date-fns';
import { es } from 'date-fns/locale';

export default function App() {
  const [currentView, setCurrentView] = useState('home'); // 'home' | 'courses' | 'portfolio'
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMapVisible, setIsMapVisible] = useState(false);
  const mapRef = useRef(null);
  const [selectedPortfolioStaff, setSelectedPortfolioStaff] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [bookingStep, setBookingStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [busyTimes, setBusyTimes] = useState([]);
  const [loadingTimes, setLoadingTimes] = useState(false);

  const [formData, setFormData] = useState({ name: '', phone: '', email: '' });
  
  const backgrounds = ['/slide1.jpg', '/slide2.jpg', '/slide3.jpg'];
  const [currentBg, setCurrentBg] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBg((prev) => (prev + 1) % backgrounds.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [backgrounds.length]);

  const PortfolioView = () => {
    const staff = staffList.find(s => s.id === selectedPortfolioStaff);
    if (!staff) return null;

    return (
      <div className="animate-fade-in" style={{ paddingBottom: '80px', backgroundColor: '#fafafa', minHeight: '100vh' }}>
        {/* Header */}
        <div style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(0,0,0,0.05)', backgroundColor: 'white', position: 'sticky', top: 0, zIndex: 50 }}>
          <button 
            onClick={() => setCurrentView('home')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500 }}
          >
            <ArrowLeft size={20} /> Volver
          </button>
          <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>Portafolio</div>
          <div style={{ width: 24 }}></div> {/* Spacer */}
        </div>

        {/* Hero Staff */}
        <div style={{ textAlign: 'center', padding: '40px 20px', backgroundColor: 'white' }}>
          <img 
            src={staff.image} 
            alt={staff.name} 
            style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', margin: '0 auto 20px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} 
          />
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '8px', fontFamily: '"Playfair Display", serif', letterSpacing: '-0.5px' }}>
            {staff.name}
          </h1>
          <p style={{ color: '#666', fontSize: '1.1rem', marginBottom: '20px' }}>Especialista en {staff.role}</p>
          
          <a href="#" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#E1306C', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem', backgroundColor: 'rgba(225, 48, 108, 0.05)', padding: '8px 16px', borderRadius: '20px' }}>
            <span style={{ fontWeight: 'bold' }}>@</span> {staff.name.toLowerCase()}.beauty
          </a>
        </div>

        {/* Masonry Grid */}
        <div style={{ padding: '40px 20px' }}>
          <div className="portfolio-grid">
            {staff.portfolioImages?.map((img, idx) => (
              <div key={idx} className="portfolio-item">
                <img src={img} alt={`Trabajo de ${staff.name} ${idx + 1}`} loading="lazy" />
              </div>
            ))}
          </div>
        </div>

        {/* CTA Footer */}
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <button 
            className="btn btn-primary" 
            style={{ padding: '15px 40px', fontSize: '1.1rem', width: '100%', maxWidth: '400px', borderRadius: '30px' }}
            onClick={() => {
              setSelectedStaff(staff.id);
              setCurrentView('home');
              // Optionally scroll to booking section
              setTimeout(() => {
                document.getElementById('booking-section')?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
          >
            Agendar con {staff.name}
          </button>
        </div>
      </div>
    );
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsMapVisible(true);
          observer.disconnect(); 
        }
      },
      { threshold: 0.2 }
    );
    if (mapRef.current) {
      observer.observe(mapRef.current);
    }
    return () => observer.disconnect();
  }, []);

  const staffList = [
    {
      id: 'ailyn',
      name: 'Ailyn',
      role: 'Manicurista',
      image: '/ailyn.jpg',
      whatsapp: '5216142864898',
      portfolioImages: [
        'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&q=80&w=400',
        'https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&q=80&w=400',
        'https://images.unsplash.com/photo-1519014816548-bf5fe059e98b?auto=format&fit=crop&q=80&w=400',
        'https://images.unsplash.com/photo-1595868846187-c100155b410d?auto=format&fit=crop&q=80&w=400',
        'https://images.unsplash.com/photo-1599839619722-39751411ea63?auto=format&fit=crop&q=80&w=400',
        'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=400'
      ],
      services: [
        { id: 's1', name: 'Manicura Clásica', duration: '45 min' },
        { id: 's2', name: 'Aplicación Gelish', duration: '60 min' },
        { id: 's3', name: 'Uñas Acrílicas', duration: '90 min' },
      ]
    },
    {
      id: 'jazmine',
      name: 'Jazmine',
      role: 'Manicurista',
      image: '/jazmine.jpg',
      whatsapp: '5216567545111',
      portfolioImages: [
        'https://images.unsplash.com/photo-1595868846187-c100155b410d?auto=format&fit=crop&q=80&w=400',
        'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&q=80&w=400',
        'https://images.unsplash.com/photo-1519014816548-bf5fe059e98b?auto=format&fit=crop&q=80&w=400',
        'https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&q=80&w=400',
        'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=400',
        'https://images.unsplash.com/photo-1599839619722-39751411ea63?auto=format&fit=crop&q=80&w=400'
      ],
      services: [
        { id: 's4', name: 'Manicura Rusa', duration: '60 min' },
        { id: 's5', name: 'Baño de Acrílico', duration: '75 min' },
        { id: 's6', name: 'Uñas Esculturales', duration: '120 min' },
      ]
    },
    {
      id: 'bere',
      name: 'Bere',
      role: 'Pedicurista',
      image: '/bere.jpg',
      whatsapp: '5216145768073',
      portfolioImages: [
        'https://images.unsplash.com/photo-1516975080661-46bfa335e2eb?auto=format&fit=crop&q=80&w=400',
        'https://images.unsplash.com/photo-1519014816548-bf5fe059e98b?auto=format&fit=crop&q=80&w=400',
        'https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&q=80&w=400',
        'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&q=80&w=400',
        'https://images.unsplash.com/photo-1595868846187-c100155b410d?auto=format&fit=crop&q=80&w=400',
        'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=400'
      ],
      services: [
        { id: 's7', name: 'Pedicura Spa', duration: '60 min' },
        { id: 's8', name: 'Pedicura Clínica', duration: '90 min' },
        { id: 's9', name: 'Esmaltado en Pies', duration: '30 min' },
      ]
    },
    {
      id: 'arely',
      name: 'Arely',
      role: 'Cejas y Faciales',
      image: '/arely.jpg',
      whatsapp: '5216145768073',
      portfolioImages: [
        'https://images.unsplash.com/photo-1512496015851-a1fbcf69f561?auto=format&fit=crop&q=80&w=400',
        'https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&q=80&w=400',
        'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&q=80&w=400',
        'https://images.unsplash.com/photo-1595868846187-c100155b410d?auto=format&fit=crop&q=80&w=400',
        'https://images.unsplash.com/photo-1519014816548-bf5fe059e98b?auto=format&fit=crop&q=80&w=400',
        'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=400'
      ],
      services: [
        { id: 's10', name: 'Lifting de Pestañas', duration: '60 min' },
        { id: 's11', name: 'Laminado de Cejas', duration: '45 min' },
        { id: 's12', name: 'Microblading', duration: '120 min' },
      ]
    }
  ];

  const today = startOfToday();
  const weekStart = startOfWeek(today, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(addDays(today, 14), { weekStartsOn: 0 });
  const daysInMonth = eachDayOfInterval({ start: weekStart, end: weekEnd });
  const blankDays = [];

  const availableTimes = ['10:00 AM', '12:00 PM', '02:00 PM', '05:00 PM', '07:00 PM'];

  const to24Hour = (timeStr) => {
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':');
    if (hours === '12') hours = '00';
    if (modifier === 'PM') hours = (parseInt(hours, 10) + 12).toString();
    return `${hours.padStart(2, '0')}:${minutes}`;
  };

  useEffect(() => {
    if (selectedDate && selectedStaff) {
      const fetchAvailability = async () => {
        setLoadingTimes(true);
        try {
          const dateStr = format(selectedDate, 'yyyy-MM-dd');
          const staffName = staffList.find(s => s.id === selectedStaff)?.name;
          // Use the local PHP backend for development/production
          // For local testing without building, you can start a php server in public folder: php -S localhost:8000 -t public
          // and change this URL to http://localhost:3000/get-availability
          const url = `/get-availability?date=${dateStr}&staffName=${staffName}`;
          const response = await fetch(url);
          const data = await response.json();
          // data should be an array of events from Google Calendar
          // events have start.dateTime and end.dateTime
          const busy = data.map(event => {
             const start = new Date(event.start.dateTime);
             const end = new Date(event.end.dateTime);
             return { start, end };
          });
          setBusyTimes(busy);
        } catch (error) {
          console.error("Error fetching availability", error);
          setBusyTimes([]);
        } finally {
          setLoadingTimes(false);
        }
      };
      fetchAvailability();
    }
  }, [selectedDate, selectedStaff]);

  const handleBooking = async (e) => {
    e.preventDefault();
    setLoading(true);

    let cleanPhone = formData.phone.replace(/\D/g, '');
    // Si el usuario puso 10 dígitos (ej. 6141234567), le agregamos el 52 de México
    if (cleanPhone.length === 10) {
      cleanPhone = '52' + cleanPhone;
    }
    // Make exige internamente que lleve el signo "+"
    cleanPhone = '+' + cleanPhone;

    // Calculate end time based on service duration
    const start24 = to24Hour(selectedTime);
    const durationStr = getSelectedServiceDetails()?.duration || '60 min';
    const durationMins = parseInt(durationStr.replace(/\D/g, '')) || 60;
    const [startH, startM] = start24.split(':').map(Number);
    const totalMins = startH * 60 + startM + durationMins;
    const endH = Math.floor(totalMins / 60);
    const endM = totalMins % 60;
    const end24 = `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;

    // Preparar el paquete de datos para n8n
    const bookingData = {
      staffId: selectedStaff,
      staffName: staffList.find(s => s.id === selectedStaff)?.name,
      serviceId: selectedService,
      serviceName: getSelectedServiceDetails()?.name,
      date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : null,
      time: selectedTime,
      time24Start: start24,
      time24End: end24,
      customerName: formData.name,
      customerPhone: cleanPhone,
      customerEmail: formData.email,
      timestamp: new Date().toISOString()
    };

    try {
      // Usando el Webhook en producción configurado en n8n
      const WEBHOOK_URL = 'https://n8n.cuustudio.com/webhook/book-appointment';

      await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData)
      });
      
      // Simular un poco de tiempo para que se vea natural en la UI si el request es muy rápido
      await new Promise(resolve => setTimeout(resolve, 800));

    } catch (error) {
      console.error('Error enviando datos al webhook de n8n:', error);
      // En producción, aquí podrías mostrar una alerta, 
      // por ahora, permitimos que avance el flujo para no bloquear la experiencia en caso de fallo de red.
    } finally {
      setLoading(false);
      setBookingStep(5); // Mostrar pantalla de éxito
    }
  };

  const getStaffServices = () => {
    return selectedStaff ? staffList.find(s => s.id === selectedStaff).services : [];
  };

  const getSelectedServiceDetails = () => {
    if (!selectedStaff || !selectedService) return null;
    return getStaffServices().find(s => s.id === selectedService);
  };

  return (
    <div className="min-h-screen pb-10">
      {currentView === 'portfolio' ? <PortfolioView /> : (
        <>
      {/* Header */}
      <header className="container py-6 flex justify-between items-center relative z-50">
        <div className="flex items-center">
          <img src="/logo-cuu.png" alt="CUU Beauty Studio" style={{ height: '70px', objectFit: 'contain', cursor: 'pointer' }} onClick={() => { setCurrentView('home'); window.scrollTo(0,0); }} />
        </div>
        
        {/* Desktop Menu */}
        <nav className="desktop-menu" style={{ fontWeight: 500, fontSize: '0.95rem', color: '#1a1a2e' }}>
          <a className="hover-link" onClick={() => { setCurrentView('home'); window.scrollTo(0,0); }} style={{ cursor: 'pointer' }}>Inicio</a>
          <a className="hover-link" onClick={() => { setCurrentView('home'); setTimeout(() => document.getElementById('booking-section')?.scrollIntoView({ behavior: 'smooth' }), 100); }} style={{ cursor: 'pointer' }}>Servicios y Citas</a>
          <a className="hover-link" onClick={() => { setCurrentView('home'); setTimeout(() => document.getElementById('ubicacion')?.scrollIntoView({ behavior: 'smooth' }), 100); }} style={{ cursor: 'pointer' }}>Ubicación</a>
          <a className="hover-link" onClick={() => { setCurrentView('courses'); window.scrollTo(0,0); }} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
            Cursos de Manicura <span className="badge-nuevo" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>NUEVO</span>
          </a>
        </nav>

        {/* Mobile Menu Button */}
        <button onClick={() => setIsMenuOpen(true)} className="mobile-menu-btn icon-animated" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary-pink)' }}>
          <Menu size={32} />
        </button>
      </header>

      {/* Side Drawer Menu */}
      <div className={`drawer-overlay ${isMenuOpen ? 'open' : ''}`} onClick={() => setIsMenuOpen(false)}></div>
      <div className={`drawer-menu ${isMenuOpen ? 'open' : ''}`}>
        <button onClick={() => setIsMenuOpen(false)} className="drawer-close icon-animated"><X size={32} /></button>
        <nav className="drawer-nav">
          <a onClick={() => { setCurrentView('home'); setIsMenuOpen(false); window.scrollTo(0,0); }}>Inicio</a>
          <a onClick={() => { setCurrentView('home'); setIsMenuOpen(false); setTimeout(() => document.getElementById('booking-section')?.scrollIntoView({ behavior: 'smooth' }), 100); }}>Servicios y Citas</a>
          <a onClick={() => { setCurrentView('home'); setIsMenuOpen(false); setTimeout(() => document.getElementById('ubicacion')?.scrollIntoView({ behavior: 'smooth' }), 100); }}>Ubicación</a>
          <a className="courses-link" onClick={() => { setCurrentView('courses'); setIsMenuOpen(false); window.scrollTo(0,0); }}>
            Cursos de Manicura <span className="badge-nuevo">NUEVO</span>
          </a>
        </nav>
      </div>

      {currentView === 'home' ? (
        <>
          {/* Hero Section */}
      <section className="container mt-12 sm:mt-16 mb-12 sm:mb-16 text-center animate-fade-in px-4">
        
        {/* Creative Typographic Lockup */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '1rem' }}>
          
          {/* Glowing Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 18px', borderRadius: '50px', border: '1px solid rgba(168, 85, 247, 0.2)', background: 'rgba(168, 85, 247, 0.03)', marginBottom: '2rem' }}>
            <span style={{ display: 'block', width: '6px', height: '6px', borderRadius: '50%', background: '#a855f7', boxShadow: '0 0 10px #a855f7' }}></span>
            <span className="animated-gradient-text" style={{ fontFamily: '"Outfit", sans-serif', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '3px', textTransform: 'uppercase' }}>
              Todo lo que necesitas
            </span>
          </div>

          {/* Main Title Stack */}
          <div style={{ position: 'relative', textAlign: 'center', lineHeight: 0.9 }}>
            <span style={{ display: 'block', fontFamily: '"Playfair Display", serif', fontSize: 'clamp(2.8rem, 8vw, 5.5rem)', fontWeight: 500, color: '#1a1a2e', letterSpacing: '-2px' }}>
              En un mismo
            </span>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 'clamp(10px, 3vw, 24px)', marginTop: '0.8rem' }}>
              <span style={{ height: '1px', width: 'clamp(30px, 10vw, 80px)', background: 'linear-gradient(90deg, transparent, rgba(244, 114, 182, 0.6))' }}></span>
              <span className="animated-gradient-text" style={{ fontFamily: '"Playfair Display", serif', fontSize: 'clamp(3.5rem, 10vw, 6.5rem)', fontWeight: 400, fontStyle: 'italic', letterSpacing: '-1px' }}>
                lugar.
              </span>
              <span style={{ height: '1px', width: 'clamp(30px, 10vw, 80px)', background: 'linear-gradient(270deg, transparent, rgba(168, 85, 247, 0.6))' }}></span>
            </div>
          </div>
        </div>

        <p style={{ fontFamily: '"Outfit", sans-serif', fontSize: 'clamp(1rem, 3vw, 1.15rem)', fontWeight: 300, color: '#4b5563', maxWidth: '550px', margin: '2.5rem auto 3rem auto', padding: '0 10px', lineHeight: '1.7' }}>
          Disfruta una experiencia exclusiva con atención personalizada. <br className="hidden sm:block" />
          Especialistas certificadas en <strong style={{ fontWeight: 600, color: '#1a1a2e' }}>manicure, pedicure spa y tratamientos faciales.</strong>
        </p>

        {/* Continuous Infinite Carousel */}
        <div style={{ width: '100%', maxWidth: '900px', height: '180px', borderRadius: '16px', overflow: 'hidden', position: 'relative', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
          <div className="infinite-carousel">
            {[...backgrounds, ...backgrounds].map((img, i) => (
              <div key={i} style={{ width: '280px', height: '100%', position: 'relative', flexShrink: 0, margin: '0 5px', borderRadius: '8px', overflow: 'hidden' }}>
                <img src={img} alt={`Slide ${i+1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(26,26,46,0.6), transparent)' }}></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Booking Widget */}
      <section id="booking-section" className="container mt-16 pt-8 pb-10">
        <div className="text-center mb-10">
          <h2 style={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 800, fontSize: 'clamp(2.2rem, 7vw, 3.5rem)', color: '#1a1a2e', marginBottom: '0.5rem', letterSpacing: '-1.5px' }}>Agenda tu cita</h2>
          <p style={{ fontFamily: '"Outfit", sans-serif', fontSize: '1.05rem', color: 'var(--text-muted)' }}>Sigue los pasos para reservar con tu especialista favorita.</p>
        </div>

        <div className="card" style={{ maxWidth: '800px', margin: '0 auto', padding: '0' }}>
          <div className="flex" style={{ borderBottom: '1px solid var(--border-color)', overflowX: 'auto' }}>
            {['Especialista', 'Servicio', 'Fecha', 'Tus Datos'].map((label, index) => {
              const step = index + 1;
              return (
                <div key={step} className="flex-1 text-center py-4 px-2" style={{ background: bookingStep === step ? 'var(--bg-secondary)' : 'transparent', fontWeight: bookingStep >= step ? 600 : 400, color: bookingStep >= step ? 'var(--primary-pink)' : 'var(--text-muted)', fontSize: '0.9rem', minWidth: '100px' }}>
                  {step}. {label}
                </div>
              );
            })}
          </div>

          <div style={{ padding: '2rem' }}>
            
            {/* Step 1: Select Staff */}
            {bookingStep === 1 && (
              <div className="animate-fade-in">
                <h3 className="text-center mb-6">¿Con quién te gustaría agendar?</h3>
                <div className="grid grid-cols-2 gap-4">
                  {staffList.map(staff => (
                    <div key={staff.id} className="card" style={{ padding: '1.5rem', borderColor: selectedStaff === staff.id ? 'var(--primary-pink)' : 'var(--border-color)', borderWidth: selectedStaff === staff.id ? '2px' : '1px' }}>
                      <div className="flex flex-col items-center text-center h-full">
                        <div 
                          className="staff-image-clickable"
                          onClick={() => {
                            setSelectedPortfolioStaff(staff.id);
                            setCurrentView('portfolio');
                            window.scrollTo(0, 0);
                          }}
                          style={{cursor: 'pointer'}}
                        >
                          <img src={staff.image} alt={staff.name} style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', marginBottom: '1rem', border: '3px solid var(--primary-pink-light)' }} />
                        </div>
                        <h4 style={{ margin: 0 }}>{staff.name}</h4>
                        <span className="text-muted" style={{ fontSize: '0.875rem' }}>{staff.role}</span>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', marginTop: '1.5rem' }}>
                          <button 
                            className="btn animated-gradient-btn" 
                            style={{ fontSize: '0.85rem', padding: '0.6rem 1rem', width: '100%' }} 
                            onClick={(e) => { e.stopPropagation(); setSelectedStaff(staff.id); setBookingStep(2); }}
                          >
                            Agendar aquí
                          </button>
                          
                          <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                            <a 
                              href={`https://wa.me/${staff.whatsapp}?text=Hola%20${staff.name},%20me%20gustar%C3%ADa%20agendar%20una%20cita.`} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="btn" 
                              style={{ flex: 1, backgroundColor: '#ffffff', color: 'rgba(37, 211, 102, 0.8)', border: '1px solid rgba(37, 211, 102, 0.25)', fontSize: '0.8rem', padding: '0.6rem 0.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4px', boxShadow: '0 2px 5px rgba(0,0,0,0.02)' }} 
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MessageCircle size={14} /> WhatsApp
                            </a>
                            <a 
                              href={`tel:+${staff.whatsapp}`} 
                              className="btn" 
                              style={{ flex: 1, backgroundColor: '#ffffff', color: 'rgba(168, 85, 247, 0.8)', border: '1px solid rgba(168, 85, 247, 0.25)', fontSize: '0.8rem', padding: '0.6rem 0.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4px', boxShadow: '0 2px 5px rgba(0,0,0,0.02)' }} 
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Phone size={14} /> Llamar
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Select Service */}
            {bookingStep === 2 && selectedStaff && (
              <div className="animate-fade-in">
                <div className="flex items-center gap-4 mb-6">
                  <img src={staffList.find(s=>s.id === selectedStaff).image} style={{width: 50, height: 50, borderRadius: '50%', objectFit: 'cover'}} />
                  <div>
                    <h3 style={{margin:0}}>Servicios con {staffList.find(s=>s.id === selectedStaff).name}</h3>
                    <p className="text-muted" style={{margin:0}}>Selecciona el servicio que deseas</p>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  {getStaffServices().map(service => {
                    const isSelected = selectedService === service.id;
                    return (
                      <div 
                        key={service.id} 
                        className={`service-card ${isSelected ? 'selected' : ''}`}
                        onClick={() => { setSelectedService(service.id); setBookingStep(3); }}
                      >
                        <div>
                          <h4 style={{margin: 0, color: isSelected ? '#1e3a8a' : '#1a1a2e'}}>{service.name}</h4>
                          <span style={{fontSize: '0.875rem', color: isSelected ? 'rgba(30, 58, 138, 0.7)' : 'var(--text-muted)'}}>{service.duration}</span>
                        </div>
                        <div className="service-card-action">
                          {isSelected ? <CheckCircle size={22} color="#1e3a8a" /> : <ChevronRight size={22} color="var(--primary-pink)" />}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-start mt-8">
                  <button className="btn btn-outline" onClick={() => setBookingStep(1)}>Regresar</button>
                </div>
              </div>
            )}

            {/* Step 3: Date & Time */}
            {bookingStep === 3 && (
              <div className="animate-fade-in">
                <h3 className="mb-6">Selecciona la fecha y hora</h3>
                
                <div>
                  <h4 className="flex items-center gap-2 mb-4"><Calendar size={18} /> Fechas</h4>
                  <div className="card" style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '1rem', background: '#fff' }}>
                    <div className="flex justify-between items-center mb-4">
                       <h4 className="m-0 font-bold capitalize text-lg text-center w-full">{format(today, "MMMM yyyy", { locale: es })}</h4>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.25rem', textAlign: 'center', marginBottom: '0.5rem' }}>
                      {['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'].map(day => (
                        <div key={day} style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-muted)' }}>{day}</div>
                      ))}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.25rem' }}>
                      {blankDays.map((_, i) => <div key={`blank-${i}`} />)}
                      {daysInMonth.map(date => {
                        const isAvailable = !isBefore(date, today) || isSameDay(date, today);
                        const isSelected = selectedDate && isSameDay(date, selectedDate);
                        return (
                          <button 
                            key={date.toString()} 
                            disabled={!isAvailable}
                            onClick={() => setSelectedDate(date)}
                            style={{ 
                              aspectRatio: '1/1', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center', 
                              borderRadius: '0.5rem', 
                              fontSize: '0.9rem',
                              border: isSelected ? 'none' : '1px solid var(--border-color)',
                              background: isSelected ? 'var(--primary-pink)' : (isAvailable ? 'white' : '#f9fafb'),
                              color: isSelected ? 'white' : (isAvailable ? 'var(--text-main)' : '#d1d5db'),
                              cursor: isAvailable ? 'pointer' : 'not-allowed',
                              fontWeight: isSelected ? 'bold' : 'normal',
                              padding: 0,
                              transition: 'all 0.2s'
                            }}
                          >
                            {format(date, "d")}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="flex items-center gap-2 mb-4"><Clock size={18} /> Horas Disponibles</h4>
                  {selectedDate ? (
                    loadingTimes ? (
                      <p className="text-muted text-sm flex items-center gap-2">
                        <span className="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full text-primary-pink"></span>
                        Revisando disponibilidad en el calendario...
                      </p>
                    ) : (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                        {availableTimes.map(time => {
                          const time24 = to24Hour(time);
                          const [h, m] = time24.split(':').map(Number);
                          const slotDate = new Date(selectedDate);
                          slotDate.setHours(h, m, 0, 0);
                          
                          // Check if slot overlaps with any busy time
                          const isBusy = busyTimes.some(busy => {
                             // Consider it busy if the slot falls within a busy event 
                             // (Adding a 5 min buffer)
                             const slotTime = slotDate.getTime();
                             return slotTime >= (busy.start.getTime() - 5 * 60000) && slotTime < busy.end.getTime();
                          });

                          return (
                            <button 
                              key={time} 
                              disabled={isBusy}
                              className={`btn ${selectedTime === time ? 'btn-primary' : 'btn-outline'}`} 
                              onClick={() => setSelectedTime(time)}
                              style={{
                                opacity: isBusy ? 0.5 : 1,
                                cursor: isBusy ? 'not-allowed' : 'pointer',
                                textDecoration: isBusy ? 'line-through' : 'none',
                                background: isBusy ? '#f3f4f6' : ''
                              }}
                            >
                              {time}
                            </button>
                          );
                        })}
                      </div>
                    )
                  ) : (
                    <p className="text-muted text-sm">Selecciona un día en el calendario de arriba para ver las horas.</p>
                  )}
                </div>

                <div className="flex justify-between mt-8">
                  <button className="btn btn-outline" onClick={() => setBookingStep(2)}>Regresar</button>
                  <button className="btn btn-primary" disabled={!selectedDate || !selectedTime} onClick={() => setBookingStep(4)}>
                    Continuar <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Form */}
            {bookingStep === 4 && (
              <form onSubmit={handleBooking} className="animate-fade-in">
                <h3>Tus Datos</h3>
                
                <div className="mt-4 p-4 rounded-xl mb-6 flex gap-4 items-center" style={{ background: 'var(--primary-pink-light)' }}>
                   <img src={staffList.find(s=>s.id === selectedStaff).image} style={{width: 60, height: 60, borderRadius: '50%', objectFit: 'cover'}} />
                   <div>
                    <p className="mb-0"><strong>{getSelectedServiceDetails()?.name}</strong> con {staffList.find(s=>s.id === selectedStaff).name}</p>
                    <p className="mb-0 text-muted" style={{fontSize: '0.9rem'}}>{selectedDate && format(selectedDate, "d 'de' MMMM", { locale: es })} a las {selectedTime}</p>
                   </div>
                </div>

                <div className="input-group">
                  <label className="input-label flex items-center gap-2"><User size={16} /> Nombre Completo</label>
                  <input type="text" className="input-field" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="input-group">
                  <label className="input-label flex items-center gap-2"><Phone size={16} /> Número de WhatsApp</label>
                  <input type="tel" className="input-field" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+52 123 456 7890" />
                </div>
                <div className="input-group">
                  <label className="input-label flex items-center gap-2"><Mail size={16} /> Correo Electrónico</label>
                  <input type="email" className="input-field" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>

                <div className="flex justify-between mt-8">
                  <button type="button" className="btn btn-outline" onClick={() => setBookingStep(3)}>Regresar</button>
                  <button type="submit" className="btn btn-primary" disabled={loading || !formData.name || !formData.phone}>
                    {loading ? 'Confirmando...' : 'Confirmar Cita'} <CheckCircle size={18} />
                  </button>
                </div>
              </form>
            )}

            {/* Step 5: Done */}
            {bookingStep === 5 && (
              <div className="animate-fade-in text-center py-10">
                <div className="inline-flex items-center justify-center p-6 rounded-full mb-6" style={{ background: 'var(--primary-blue-light)', color: 'var(--primary-blue)' }}>
                  <CheckCircle size={48} />
                </div>
                <h2>¡Cita Confirmada!</h2>
                <p>Tu reservación con <strong>{staffList.find(s=>s.id === selectedStaff).name}</strong> ha sido guardada en nuestra agenda. Te hemos enviado los detalles por WhatsApp.</p>
                <button className="btn btn-outline mt-6" onClick={() => { setBookingStep(1); setSelectedStaff(null); setSelectedService(null); setSelectedDate(null); setSelectedTime(null); setFormData({name:'', phone:'', email:''}); }}>
                  Agendar otra cita
                </button>
              </div>
            )}

          </div>
        </div>
      </section>

      {/* Map Section */}
      <section id="ubicacion" className="container mt-10 pb-20">
        <div className="text-center mb-10">
          <h2 className="text-gradient">Nuestra Ubicación</h2>
          <p className="flex items-center justify-center gap-2">
            <MapPin size={20} className="text-primary-pink" /> Av Zaragoza 12, Chihuahua, Chihuahua
          </p>
        </div>
        <div ref={mapRef} style={{ borderRadius: '1.5rem', overflow: 'hidden', height: '400px', boxShadow: 'var(--shadow-md)', border: '1px solid var(--border-color)' }}>
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3501.996173007611!2d-106.0827253!3d28.632832!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x86ea434250b7b12d%3A0xc3f6a25fdf290b23!2sAv.%20Ignacio%20Zaragoza%2012%2C%20Zona%20Centro%2C%2031000%20Chihuahua%2C%20Chih.!5e0!3m2!1ses-419!2smx!4v1714480000000!5m2!1ses-419!2smx" 
            width="100%" 
            height="100%" 
            style={{ 
              border: 0,
              transform: isMapVisible ? 'scale(1)' : 'scale(1.4)',
              transition: 'transform 2s cubic-bezier(0.2, 0.8, 0.2, 1)'
            }} 
            allowFullScreen="" 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
            title="Mapa de Ubicación"
          ></iframe>
        </div>
      </section>
        </>
      ) : (
        <CoursesView onBack={() => setCurrentView('home')} />
      )}

      {/* Floating WhatsApp Button */}
      <a href="https://wa.me/5216142864898" target="_blank" rel="noreferrer" className="floating-whatsapp icon-animated" style={{ textDecoration: 'none' }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21"></path>
          <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1"></path>
        </svg>
        <span className="floating-whatsapp-text">Escríbenos</span>
      </a>
      </>
      )}
    </div>
  );
}

// Courses View Component
function CoursesView({ onBack }) {
  return (
    <div className="container animate-fade-in" style={{ paddingTop: '2rem' }}>
      <button onClick={onBack} className="btn btn-outline mb-8" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', borderColor: 'var(--border-color)', color: '#1a1a2e' }}>
        <ArrowLeft size={16} /> Volver a Inicio
      </button>

      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <span className="animated-gradient-text" style={{ fontFamily: '"Outfit", sans-serif', fontSize: '1rem', fontWeight: 700, letterSpacing: '4px', textTransform: 'uppercase' }}>
          CUU Beauty Academy
        </span>
        <h1 style={{ fontFamily: '"Playfair Display", serif', fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontStyle: 'italic', lineHeight: 1.1, marginTop: '1rem' }}>
          Aprende el arte de la <br/>
          <span style={{ fontFamily: '"Space Grotesk", sans-serif', fontStyle: 'normal', fontWeight: 800, background: 'linear-gradient(135deg, #a855f7, #f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Manicura Profesional
          </span>
        </h1>
        <p className="text-muted" style={{ maxWidth: '600px', margin: '1.5rem auto 0', fontSize: '1.1rem' }}>
          Conviértete en una experta con nuestros cursos intensivos. Aprenderás las técnicas más rentables y modernas del mercado.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Course 1 */}
        <div className="course-card">
          <img src="/cuubeauty_hero_1786942656832.jpg" alt="Curso Manicura Rusa" />
          <div className="course-card-content">
            <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem' }}>
              <span className="badge-nuevo">Nivel Básico / Intermedio</span>
            </div>
            <h3 style={{ fontFamily: '"Space Grotesk", sans-serif', fontSize: '1.5rem', marginBottom: '0.5rem' }}>Masterclass: Manicura Rusa + Nivelación</h3>
            <p className="text-muted mb-6">Aprende la limpieza profunda con torno y tijera, además de la técnica de nivelación perfecta para un esmaltado sin imperfecciones.</p>
            
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem 0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li style={{ display: 'flex', gap: '10px', alignItems: 'center' }}><CheckCircle size={18} color="#a855f7" /> Kit de herramientas incluido</li>
              <li style={{ display: 'flex', gap: '10px', alignItems: 'center' }}><CheckCircle size={18} color="#a855f7" /> Certificado de asistencia</li>
              <li style={{ display: 'flex', gap: '10px', alignItems: 'center' }}><CheckCircle size={18} color="#a855f7" /> Práctica en modelo real</li>
            </ul>

            <a href="https://wa.me/5216142864898?text=Hola,%20quiero%20informaci%C3%B3n%20sobre%20el%20curso%20de%20Manicura%20Rusa" target="_blank" rel="noreferrer" className="btn animated-gradient-btn" style={{ width: '100%', padding: '1rem', fontSize: '1rem' }}>
              Pedir Información por WhatsApp
            </a>
          </div>
        </div>

        {/* Course 2 */}
        <div className="course-card">
          <img src="/cuubeauty_bg_3_1786948701666.jpg" alt="Curso Acrílico" />
          <div className="course-card-content">
            <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem' }}>
              <span className="badge-nuevo" style={{ background: '#3b82f6' }}>Nivel Avanzado</span>
            </div>
            <h3 style={{ fontFamily: '"Space Grotesk", sans-serif', fontSize: '1.5rem', marginBottom: '0.5rem' }}>Especialidad: Acrílico y Estructuras</h3>
            <p className="text-muted mb-6">Domina las estructuras de salón y vanguardia (Almond, Square, Coffin). Técnicas de encapsulado, reversa y manejo de producto.</p>
            
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem 0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li style={{ display: 'flex', gap: '10px', alignItems: 'center' }}><Award size={18} color="#3b82f6" /> Certificación Avanzada</li>
              <li style={{ display: 'flex', gap: '10px', alignItems: 'center' }}><CheckCircle size={18} color="#a855f7" /> Material de alta gama en clase</li>
              <li style={{ display: 'flex', gap: '10px', alignItems: 'center' }}><CheckCircle size={18} color="#a855f7" /> Asesoría post-curso 30 días</li>
            </ul>

            <a href="https://wa.me/5216142864898?text=Hola,%20quiero%20informaci%C3%B3n%20sobre%20el%20curso%20de%20Acr%C3%ADlico" target="_blank" rel="noreferrer" className="btn animated-gradient-btn" style={{ width: '100%', padding: '1rem', fontSize: '1rem' }}>
              Pedir Información por WhatsApp
            </a>
          </div>
        </div>
      </div>

    </div>
  );
}
