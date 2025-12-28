import React, { useState, useEffect } from 'react';
import { CheckCircle } from 'lucide-react';

interface WithdrawalNotification {
  id: number;
  name: string;
  amount: string;
  timestamp: number;
}

const WithdrawalNotifications = () => {
  const [notifications, setNotifications] = useState<WithdrawalNotification[]>([]);
  const [visibleNotifications, setVisibleNotifications] = useState<WithdrawalNotification[]>([]);

  // 200 Nigerian names from different ethnic groups
  const nigerianNames = [
    // Igbo names
    "Chidiebere", "Chioma", "Emeka", "Adaeze", "Ikechukwu", "Ngozi", "Obioma", "Kelechi", "Chinonso", "Adanna",
    "Chukwuemeka", "Ifeoma", "Obinna", "Chidinma", "Nnamdi", "Uchenna", "Chinyere", "Okechukwu", "Chiamaka", "Chimezie",
    "Ebuka", "Chinenye", "Ifeanyi", "Adaora", "Chukwuma", "Nkechi", "Chibuike", "Nneka", "Kenechukwu", "Amarachi",
    "Chukwudi", "Ijeoma", "Obumneme", "Chidera", "Uzoma", "Chinelo", "Chukwunonso", "Adaugo", "Ikenna", "Oluchi",
    
    // Yoruba names
    "Adebayo", "Folake", "Olumide", "Bukola", "Adeniyi", "Funmilayo", "Babatunde", "Oluwaseun", "Adebola", "Titilope",
    "Oluwadamilola", "Ayodeji", "Omolara", "Oluwatobi", "Kehinde", "Taiwo", "Adunni", "Olumuyiwa", "Adeola", "Oluwakemi",
    "Bamidele", "Oluwafunmilayo", "Adetunji", "Omowunmi", "Oluwaseyi", "Abimbola", "Adedayo", "Oluwatobiloba", "Ayomide", "Oluwabunmi",
    "Adeyemi", "Oluwafemi", "Aderonke", "Oluwashina", "Ayobami", "Oluwadara", "Adebisi", "Oluwatoyosi", "Adesola", "Oluwapelumi",
    
    // Hausa names
    "Ahmad", "Aisha", "Ibrahim", "Fatima", "Muhammad", "Khadija", "Usman", "Maryam", "Aliyu", "Hauwa",
    "Abdullahi", "Zainab", "Sani", "Safiya", "Musa", "Halima", "Yusuf", "Amina", "Ismail", "Asma'u",
    "Bashir", "Rukayya", "Garba", "Nafisa", "Hamza", "Bilkisu", "Salisu", "Rabi'a", "Haruna", "Zara",
    "Kabir", "Hadiza", "Yunusa", "Jummai", "Sulaiman", "Ramatu", "Nasir", "Zulaiha", "Shehu", "Fadima",
    
    // English/Christian names
    "Michael", "Grace", "David", "Faith", "John", "Hope", "Peter", "Joy", "Paul", "Peace",
    "James", "Love", "Emmanuel", "Blessing", "Daniel", "Mercy", "Samuel", "Favour", "Joseph", "Gift",
    "Benjamin", "Patience", "Abraham", "Goodness", "Isaac", "Success", "Jacob", "Precious", "Joshua", "Miracle",
    "Stephen", "Victory", "Matthew", "Divine", "Mark", "Glory", "Luke", "Wisdom", "Andrew", "Happiness",
    
    // More Igbo names
    "Chidimma", "Chigozie", "Chukwuebuka", "Adaichie", "Chibueze", "Nnenna", "Chukwuka", "Ifunanya", "Chinaza", "Adaora",
    "Chimenem", "Ihuoma", "Chukwudum", "Adaeze", "Chidera", "Nkiruka", "Chukwunwike", "Ifueko", "Chinecherem", "Adanna",
    
    // More Yoruba names
    "Oluwatimilehin", "Adeyinka", "Oluwadamilare", "Adebanke", "Oluwatomisin", "Adunola", "Oluwasanmi", "Adesuwa", "Oluwatofunmi", "Adeyemi",
    "Oluwagbemiga", "Adejoke", "Oluwatomiwa", "Adepeju", "Oluwasina", "Adejumoke", "Oluwatayo", "Aderinsola", "Oluwatimileyin", "Adetokunbo",
    
    // More Hausa names
    "Abdulrahman", "Balkis", "Abdulkarim", "Zahra", "Abdussalam", "Salamatu", "Abdulazeez", "Firdausi", "Abdulwahab", "Hajara",
    "Abdulmajid", "Sadiya", "Abdulmalik", "Hafsat", "Abdulrazaq", "Jamila", "Abdulhamid", "Laila", "Abdulbasit", "Ramlah",
    
    // Additional mixed names
    "Chukwuebuka", "Oluwayemisi", "Abdulkabir", "Gloria", "Nnameka", "Tolulope", "Farouq", "Princess", "Ikechukwu", "Omotola"
  ];

  // Generate random withdrawal amounts (max 200k)
  const getRandomAmount = () => {
    const amounts = ['50k', '75k', '100k', '120k', '150k', '180k', '190k', '200k'];
    return amounts[Math.floor(Math.random() * amounts.length)];
  };

  const getRandomName = () => {
    return nigerianNames[Math.floor(Math.random() * nigerianNames.length)];
  };

  // Create new notification
  const createNotification = () => {
    const newNotification: WithdrawalNotification = {
      id: Date.now() + Math.random(),
      name: getRandomName(),
      amount: getRandomAmount(),
      timestamp: Date.now()
    };
    
    setNotifications(prev => [newNotification, ...prev.slice(0, 49)]); // Keep last 50
    setVisibleNotifications(prev => [newNotification, ...prev.slice(0, 2)]); // Show max 3 at once
  };

  // Auto-generate notifications
  useEffect(() => {
    const interval = setInterval(() => {
      createNotification();
    }, Math.random() * 8000 + 3000); // Random interval between 3-11 seconds

    return () => clearInterval(interval);
  }, []);

  // Remove notifications after 4 seconds
  useEffect(() => {
    visibleNotifications.forEach(notification => {
      setTimeout(() => {
        setVisibleNotifications(prev => 
          prev.filter(n => n.id !== notification.id)
        );
      }, 4000);
    });
  }, [visibleNotifications]);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
      <div className="flex flex-col items-center space-y-2 p-4">
        {visibleNotifications.map((notification, index) => (
          <div
            key={notification.id}
            className="bg-primary text-primary-foreground px-6 py-4 rounded-xl shadow-xl border border-primary/20 flex items-center space-x-4 animate-slide-down pointer-events-auto backdrop-blur-sm"
            style={{
              animation: `slideDown 0.5s ease-out, fadeOut 0.5s ease-out 3.5s forwards`,
              marginTop: index * 10,
              background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary)/0.8) 100%)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(59, 130, 246, 0.3)'
            }}
          >
            <div className="flex-shrink-0 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-white mb-1">
                Withdrawal Successful
              </p>
              <p className="text-xs text-white/90">
                {notification.name} withdrew ₦{notification.amount}
              </p>
            </div>
            <div className="text-xs text-white/70 font-mono">
              {new Date().toLocaleTimeString('en-US', { 
                hour12: false, 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </div>
          </div>
        ))}
      </div>
      
      <style>{`
        @keyframes slideDown {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        @keyframes fadeOut {
          from {
            opacity: 1;
            transform: translateY(0);
          }
          to {
            opacity: 0;
            transform: translateY(-20px);
          }
        }
      `}</style>
    </div>
  );
};

export default WithdrawalNotifications;
