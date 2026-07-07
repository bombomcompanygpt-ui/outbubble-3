import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, RefreshCw, User, X, Sparkles, BookOpen, Trash2, HelpCircle } from 'lucide-react';
import { useStore } from '../lib/store';
import { cn } from '../lib/utils';

// SYSTEM_INSTRUCTION yang dioptimalkan untuk analisis mendalam & kontekstual (dipasangkan dengan backend)
const SYSTEM_INSTRUCTION = `
  Nama kamu adalah Bubul, asisten virtual dari web OutBubble berwujud gelembung biru ceria yang sangat cerdas, gaul, dan analitis.
  Tugas utama kamu adalah mendampingi pengguna mendeteksi, mendiskusikan, dan memecahkan gelembung informasi digital seperti Filter Bubble, Echo Chamber, Polarisasi Algoritma, Attention Economy, dan Bias Konfirmasi.

  GAYA ANALISIS & STRUKTUR JAWABAN WAJIB:
  1. **Sorot Fenomena Sosial Terkini (Masyarakat & Netizen)**:
     - Awali tanggapan dengan menyorot bagaimana topik tersebut saat ini ramai dibahas, diperdebatkan, atau dialami oleh netizen di kehidupan nyata sehari-hari (seperti FYP TikTok yang bikin candu, perang opini kubu netizen di X/Twitter, tren doomscrolling malam hari, hoaks berantai di grup keluarga WhatsApp, hingga perselisihan di kolom komentar Instagram).
  2. **Hubungkan dengan Materi & Fitur Website OutBubble secara Spesifik**:
     - Kamu harus memandu user ke materi di web ini! Tautkan topik dengan modul spesifik di tab **Materi** kita (misalnya: Modul **M01: Algoritma & Attention Economy** untuk isu kecanduan medsos, **M02: Filter Bubble** untuk lini masa searah, **M03: Echo Chamber** untuk komunitas baperan, **M04: Fragmentasi Sosial**, atau **M05: Polarisasi Algoritma**).
     - Jangan lupa sarankan mereka melatih kepekaan lewat **Kuis Labirin & Simulasi**, menuangkan suara di **Forum Diskusi**, atau menuangkan emosi di tab **Refleksi** pribadi!
  3. **Gunakan Format Poin-Poin & Reasoning Menarik**:
     - Sajikan penjelasan secara bertahap dalam poin-poin terstruktur (gunakan bullet - untuk memulai setiap poin).
     - Berikan nama poin yang catchy, berani, dan bold (contoh: **- Candu Algoritma FYP Racun**).
     - Setiap poin wajib berisi **Analisis Konsep Sosial (2-3 kalimat)** dan **Reasoning Menarik & Relatable (1-2 kalimat)** menggunakan analogi asyik, santai, dan modern (misal menggunakan istilah "jempol gercep", "mabuk konfirmasi bias", "ruang gema baperan").
  4. **Akhiri dengan OutBubble Action Tip**:
     - Selalu akhiri responmu dengan langkah konkret pemecah gelembung (misal "**🫧 OutBubble Action:** Carilah minimal 3 akun opini yang bertolak belakang dengan pandanganmu hari ini untuk meremajakan algoritmamu!") diikuti dengan satu emoji gelembung 🫧.
  5. **Persona**: Super ramah, menyenangkan, jenaka, cerdas, kreatif, penuh dorongan positif, dan sama sekali tidak kaku!
`;

const SUGGESTED_TOPICS = [
  { label: '🫧 Apa itu Filter Bubble?', query: 'Tolong jelaskan secara mendalam tentang konsep Filter Bubble di media sosial dan bagaimana kaitannya dengan materi pelajaran OutBubble.' },
  { label: '🧐 Mengapa FYP medsos adiktif?', query: 'Mengapa lini masa atau FYP di media sosial terasa sangat adiktif? Sila jelaskan dikaitkan dengan materi Attention Economy!' },
  { label: '💰 Bagaimana Echo Chamber terbentuk?', query: 'Bagaimana terbentuknya fenomena Echo Chamber di grup diskusi kita dan apa hubungannya dengan Polarisasi Algoritma?' },
  { label: '🛡️ Tips memecahkan bias konfirmasi', query: 'Berikan aku langkah taktis dan seru untuk mendeteksi serta menghancurkan bias konfirmasi saat melihat informasi baru sehari-hari.' },
  { label: '🤖 Cara kerja algoritma sosmed', query: 'Bagaimana algoritma rahasia media sosial mengumpulkan data kebiasaan kita? Apakah data kita dijual?' }
];

interface BubulChatProps {
  onClose?: () => void;
}

const BubulMascot: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn("relative flex items-center justify-center", className)}>
    <div className="absolute inset-0 bg-gradient-to-tr from-blue-400 via-blue-300 to-white rounded-full animate-pulse blur-[2px]" />
    <div className="w-full h-full bg-gradient-to-br from-blue-400/80 to-indigo-500/80 rounded-full border-2 border-white shadow-inner flex items-center justify-center relative overflow-hidden">
      <div className="absolute top-1 left-2 w-1/2 h-1/2 bg-white/30 rounded-full blur-[4px]" />
      <div className="flex gap-2 mb-1">
        <div className="w-3 h-3 bg-[#031466] rounded-full" />
        <div className="w-3 h-3 bg-[#031466] rounded-full" />
      </div>
    </div>
    <div className="absolute bottom-1/4 left-1/4 w-3 h-1.5 bg-pink-300/50 rounded-full blur-[1px]" />
    <div className="absolute bottom-1/4 right-1/4 w-3 h-1.5 bg-pink-300/50 rounded-full blur-[1px]" />
  </div>
);

const BubulChat: React.FC<BubulChatProps> = ({ onClose }) => {
  const { user, chatHistory, setChatHistory } = useStore();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const isStandalone = !onClose;

  // Auto Scroll ke bawah
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [chatHistory, isTyping]);

  // Pesan Selamat Datang (Greeting) jika kosong
  useEffect(() => {
    if (chatHistory.length === 0) {
      const lastScore = user?.scores?.[user.scores.length - 1]?.score || 0;
      let greeting = "Halo! Aku Bubul si gelembung pintar! Siap membedah bagaimana algoritma media sosial memanipulasi timeline-mu hari ini? Berikan aku satu fenomena atau tren yang sedang ramai! 🫧";
      
      if (user?.scores && user.scores.length > 0) {
        greeting = lastScore > 50 
          ? "Skor labirin kuis kamu kemarin luar biasa! Kamu terbukti punya kepekaan tinggi terhadap **Filter Bubble**. Yuk, kita analisis studi kasus digital yang lebih menantang hari ini! 🫧" 
          : "Gelembung informasi di luar sana memang dirancang untuk mengurung kita. Tenang, mari kita bedah polanya dan cari cara menembusnya bersama-sama! 🫧";
      }
      setChatHistory([{ role: 'bubul', text: greeting }]);
    }
  }, [user, chatHistory.length, setChatHistory]);

  // Algoritma respons lokal super pintar (Smart Local AI Fallback) agar aplikasi 100% fungsional saat di-download atau dipindah ke Vercel
  const getClientFallbackResponse = (userMessage: string): string => {
    const textLower = userMessage.toLowerCase();
    
    if (textLower.includes("filter bubble") || textLower.includes("gelembung")) {
      return `Wah, hebat sekali kamu menanyakan tentang **Filter Bubble**! Di kehidupan nyata, netizen sering terisolasi dalam linimasa searah (seperti FYP TikTok atau konten X) karena algoritme terus memanjakan bias batin kita.

- **Tirai Gaib Lini Masa**: Algoritme pintar menyensor sudut pandang lain yang tidak kamu sukai agar kamu betah berlama-lama scrolling linimasa sepihak.
- **Kecanduan Dopamin**: Jempol kita dirancang untuk langsung klik tombol 'Suka' tanpa meneliti kebenarannya. Hal ini menciptakan dunia informasi palsu yang bias.

Dalami bahaya tersembunyi ini langsung di **M02: Filter Bubble** di tab **Materi** kita! Kamu juga bisa mengujinya langsung di menu **Kuis Labirin & Simulasi**.

🫧 OutBubble Action: Carilah minimal 3 akun opini yang bertolak belakang dengan pandanganmu hari ini untuk meremajakan algoritmamu! 🫧`;
    }
    
    if (textLower.includes("fyp") || textLower.includes("ads") || textLower.includes("attention") || textLower.includes("adiktif") || textLower.includes("candu") || textLower.includes("doomscrolling") || textLower.includes("sosmed") || textLower.includes("media sosial") || textLower.includes("instagram") || textLower.includes("tiktok")) {
      return `Hmm, kenapa ya FYP TikTok atau Reels Instagram bisa bikin candu sampai larat doomscrolling tengah malam? Jawabannya ada di **Attention Economy**!

- **Sistem Dopamin Instan**: Desain scroll-infinite (scrolling tanpa batas) sengaja menyadap senyawa biokimia di otak kita, membuat kita lapar akan kejutan visual berikutnya.
- **Komersialisasi Atensi**: Atensimu adalah ladang uang bagi korporasi teknologi iklan. Semakin lama kamu menatap layar, semakin melimpah pemasukan dolar mereka.

Dalami konsep luar biasa ini di **Materi M01: Algoritma & Attention Economy**!

🫧 OutBubble Action: Batasi waktu media sosialmu maksimal 30 menit per sesi dan matikan semua notifikasi non-esensial hari ini! 🫧`;
    }
    
    if (textLower.includes("echo chamber") || textLower.includes("ruang gema") || textLower.includes("kubu") || textLower.includes("politik") || textLower.includes("berantem") || textLower.includes("debat") || textLower.includes("netizen") || textLower.includes("komentar")) {
      return `Ah, fenomena **Echo Chamber** alias Ruang Gema adalah biang keladi kenapa netizen di kolom komentar sering sekali berantem saling tuding!

- **Komunitas Baperan**: Kita hanya berkumpul dengan orang-orang se-ideologi dan saling menggaungkan bias batin yang sama, sementara suara alternatif dianggap musuh. Kita merasa paling benar sendiri.
- **Polarisasi Akut**: Akibatnya masyarakat terpecah-belah menjadi kubu biner yang ekstrem tanpa ada dialog jalan tengah. Ini sangat melemahkan persatuan sosial kita.

Yuk baca rahasianya di **M03: Echo Chamber** di tab **Materi**! Kamu juga bisa melatih batinmu berdiskusi di **Perspective Garden (Forum)**.

🫧 OutBubble Action: Mulailah menyapa perdebatan dari sudut pandang netral di **Perspective Garden (Forum)** dan latih nalarmu! 🫧`;
    }
    
    if (textLower.includes("bias") || textLower.includes("konfirmasi") || textLower.includes("hoaks") || textLower.includes("percaya") || textLower.includes("fakta")) {
      return `Aha! **Bias Konfirmasi** adalah kecenderungan otak kita untuk hanya menerima informasi yang mendukung opini pribadi kita yang sudah ada sebelumnya.

- **Penyaring Otak Otomatis**: Kita gercep percaya hoaks jika hoaks itu menjelek-jelekkan kubu lawan, dan langsung skeptis pada fakta valid jika fakta itu membela kubu lawan. Ini adalah insting dasar manusia.
- **Perangkap Mental**: Ini adalah jebakan psikologis alami yang diglorifikasi oleh algoritme manipulatif kosmis. Kita mendadak buta akan kebenaran objektif yang ada.

Biasakan berpikir skeptis yang sehat, pelajari teorinya langsung di **Materi M04: Fragmentasi Sosial**!

🫧 OutBubble Action: Tulis refleksimu di tab **Refleksi** hari ini untuk menjernihkan pikiran dari bias konfirmasi yang terselubung! 🫧`;
    }
    
    if (textLower.includes("algoritma") || textLower.includes("cara kerja") || textLower.includes("rekomendasi") || textLower.includes("data") || textLower.includes("tracker") || textLower.includes("privasi")) {
      return `Membahas **cara kerja algoritme** memang seru sekaligus bergidik! Algoritme mencatat setiap detik jarimu berhenti pada suatu video, riwayat pencarian, bahkan chat intimmu.

- **Profiling Sempurna**: Data itu diolah secara real-time untuk membangun kepribadian digitalmu ("digital twin") sehingga mereka tahu apa tombol emosimu.
- **Labirin Eksplorasi**: Buktikan sendiri dengan bereksperimen di tab **Simulasi & Tes** kami untuk mengamati bagaimana rekomendasi konten membelokkan opini warga Indonesia!

Dalami rahasia algoritme ini lengkap di **M05: Polarisasi Algoritma** di tab **Materi**!

🫧 OutBubble Action: Reset history pencarian media sosialmu atau gunakan mode penyamaran secara berkala untuk merusak tracker mereka! 🫧`;
    }
    
    if (textLower.includes("outbubble") || textLower.includes("fitur") || textLower.includes("menu") || textLower.includes("belajar") || textLower.includes("materi")) {
      return `OutBubble adalah web petualangan literasi digital paling seru buat kamu! Berikut fitur-fitur keren yang wajib kamu jelajahi bersama Bubul:

- **Materi Interaktif**: Temukan modul M01 hingga M05 lengkap dengan infografis, istilah gaul, dan audio seru untuk membedah algoritme.
- **Perspective Garden (Forum)**: Diskusikan isu hangat siber secara anonim maupun riil tanpa takut dihujat.
- **Tes & Simulasi**: Jajal pre-test, simulasi gelembung, kuis labirin, dan post-test untuk mengukur tingkat kekebalan digitalmu!
- **Refleksi Harian**: Tulis jurnal refleksi untuk mendeteksi seberapa dalam kamu terjebak bias konfirmasi.

Semua fitur ini terintegrasi penuh untuk mendampingimu menjadi pahlawan pembuat nalar!

🫧 OutBubble Action: Selesaikan kuis labirin di tab **Tes & Simulasi** lalu pamerkan skor tertinggimu! 🫧`;
    }
    
    if (textLower.includes("hi") || textLower.includes("halo") || textLower.includes("hei") || textLower.includes("p ") || textLower.includes("siapa") || textLower.includes("bubul")) {
      return `Halo! Aku Bubul si gelembung asisten virtualmu yang cerdas, ceria, dan siap membelah gelembung informasi digital di sekelilingmu! 🫧

- **Misi Bubul**: Menyelamatkan remaja Indonesia dari cengkeraman adiktif algoritme, filter bubble, echo chamber, dan bias konfirmasi.
- **Teman Diskusi**: Kamu bebas menanyakan apa saja seputar media sosial, dopamin, FYP, hoaks, cara kerja algoritme, atau cara melatih nalar kritis.

Yuk jelajahi petualangan OutBubble ini dengan penuh keseruan! Coba tanyakan: "Mengapa FYP medsos adiktif?" atau "Bagaimana Echo Chamber terbentuk?".

🫧 OutBubble Action: Coba ketuk salah satu chip **Saran Topik Literasi** di atas untuk mulai berdiskusi denganku! 🫧`;
    }

    return `Halo! Aku Bubul si gelembung asisten virtualmu! Pertanyaanmu sangat menarik untuk diulas dari kacamata literasi digital digital.

- **Waspadai Algoritma**: Di era digital sekarang, apa yang kita lihat di layar HP dikoordinasikan penuh oleh kepentingan retensi atensi.
- **Pecahkan Gelembungmu**: Jangan pasif menerima asupan informasi. Selalu saring, cek lintas platform, dan berdiskusilah dengan saksama.

Kamu bisa melatih pemahamanmu di menu **Tes & Simulasi** lengkap dengan kuis interaktif seru!

🫧 OutBubble Action: Mari berdiskusi aktif di **Perspective Garden** dan asah terus literasi digitalmu bersama Bubul! 🫧`;
  };

  const sendQuery = async (userMsg: string) => {
    const newHistory = [...chatHistory, { role: 'user' as const, text: userMsg }];
    setChatHistory(newHistory);
    setIsTyping(true);

    let text = "";
    let fetchedSuccessfully = false;

    // A. LANGKAH 1: Coba hubungi API Gemini langsung lewat client-side jika VITE_GEMINI_API_KEY terkonfigurasi (Vercel/Offline-safe)
    const clientApiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (clientApiKey && clientApiKey !== "MY_GEMINI_API_KEY" && clientApiKey !== "") {
      try {
        console.log("Menghubungi Gemini secara langsung dari client-side...");
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${clientApiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              ...newHistory.slice(-8).map(m => ({
                role: m.role === 'bubul' ? 'model' : 'user',
                parts: [{ text: m.text }]
              }))
            ],
            systemInstruction: {
              parts: [{ text: SYSTEM_INSTRUCTION }]
            },
            generationConfig: {
              temperature: 0.7,
            }
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
            text = data.candidates[0].content.parts[0].text;
            fetchedSuccessfully = true;
            console.log("Respons Gemini direct-client berhasil didapatkan!");
          }
        } else {
          console.warn("Direct-client Gemini fetch gagal. Status:", response.status);
        }
      } catch (err) {
        console.warn("Direct-client Gemini throw error. Mencoba proxy backend...", err);
      }
    }

    // B. LANGKAH 2: Coba hubungi proxy backend Express /api/chat jika direct-client key tidak diset atau gagal
    if (!fetchedSuccessfully) {
      try {
        const recentHistory = newHistory.slice(-10);
        const contents = [
          { role: 'user' as const, parts: [{ text: `SYSTEM INSTRUCTION: ${SYSTEM_INSTRUCTION}` }] },
          ...recentHistory.map(m => ({
            role: m.role === 'bubul' ? 'model' as const : 'user' as const,
            parts: [{ text: m.text }],
          }))
        ];

        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents })
        });

        if (res.ok) {
          const data = await res.json();
          if (data.text) {
            text = data.text;
            fetchedSuccessfully = true;
            console.log("Respons via proxy API backend berhasil didapatkan!");
          }
        } else {
          console.warn("Proxy backend chat gagal. Status:", res.status);
        }
      } catch (error) {
        console.warn("Proxy backend server terputus/offline. Mengaktifkan mesin lokal...", error);
      }
    }

    // C. LANGKAH 3: Fallback akhir jika backend 404 / 500 / offline (seperti Vercel murni / download zip)
    if (!fetchedSuccessfully) {
      console.log("Menjalankan Smart Local AI Fallback untuk merespons pertanyaan...");
      text = getClientFallbackResponse(userMsg);
    }

    setChatHistory([...newHistory, { role: 'bubul', text: text }]);
    setIsTyping(false);
  };

  const handleSend = () => {
    if (!input.trim() || isTyping) return;
    const userMsg = input;
    setInput('');
    sendQuery(userMsg);
  };

  const handlePredefined = (text: string) => {
    if (isTyping) return;
    sendQuery(text);
  };

  const handleClearHistory = () => {
    if (window.confirm("Hapus seluruh memori percakapan dengan Bubul? Percakapan baru akan dimulai.")) {
      setChatHistory([]);
    }
  };

  // Render pesan yang diperkuat untuk mendukung heading kustom, bold, dan list yang lebih rapi
  const renderMessage = (text: string) => {
    return text.split('\n').map((line, i) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return <div key={i} className="h-2" />;

      const isBullet = trimmedLine.startsWith('-');
      // Mengubah **teks** menjadi elemen strong dengan styling khusus agar menonjol secara visual
      const formattedLine = trimmedLine.replace(/\*\*(.*?)\*\*/g, '<strong class="text-[#031466] font-extrabold bg-blue-50/50 px-1 rounded">$1</strong>');
      
      if (isBullet) {
        return (
          <div key={i} className="flex items-start gap-2 ml-2 my-2 text-slate-700 text-xs md:text-sm leading-relaxed">
            <span className="text-blue-500 mt-1.5 shrink-0 text-xs">•</span>
            <span dangerouslySetInnerHTML={{ __html: formattedLine.replace(/^- /, '') }} />
          </div>
        );
      }
      
      return (
        <p key={i} className="mb-2.5 text-slate-700 text-xs md:text-sm font-medium leading-relaxed" dangerouslySetInnerHTML={{ __html: formattedLine }} />
      );
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 30, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 350, damping: 28 }}
      className={cn(
        "w-full flex flex-col bg-white/95 backdrop-blur-2xl rounded-[32px] shadow-[0_25px_80px_-15px_rgba(3,20,102,0.22)] border-2 border-slate-100 relative overflow-hidden transition-all duration-300",
        isStandalone 
          ? "max-w-4xl h-[700px] mx-auto mt-2" 
          : "max-w-[480px] h-[620px]"
      )}
    >
      {/* HEADER */}
      <div className="relative pt-10 pb-4 px-6 bg-gradient-to-b from-blue-50/70 to-transparent flex flex-col items-center border-b border-slate-100/60">
        <motion.div 
          animate={{ y: [-5, 5, -5] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          className="absolute -top-[50px] w-24 h-24 pointer-events-none drop-shadow-2xl"
        >
          <BubulMascot className="w-full h-full" />
        </motion.div>

        {/* Action Buttons in Header */}
        <div className="absolute top-4 right-4 flex items-center gap-1.5 z-10">
          <button 
            onClick={handleClearHistory}
            title="Reset Percakapan"
            disabled={chatHistory.length <= 1 && !isTyping}
            className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-indigo-600 rounded-full transition-all shadow-sm flex items-center justify-center disabled:opacity-40 disabled:hover:bg-slate-50 disabled:hover:text-slate-400"
          >
            <Trash2 size={16} />
          </button>
          
          {onClose && (
            <button 
              onClick={onClose}
              title="Tutup Chat"
              className="p-2 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full transition-all shadow-sm flex items-center justify-center"
            >
              <X size={16} strokeWidth={2.5} />
            </button>
          )}
        </div>

        <div className="text-center mt-12">
          <h2 className="text-lg font-black text-[#031466] flex items-center justify-center gap-1.5 tracking-tight">
            Bubul Labirin AI <Sparkles size={15} className="text-yellow-500 fill-yellow-400 animate-pulse animate-duration-1000" />
          </h2>
          <div className="flex items-center justify-center gap-2 mt-1">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-ping shrink-0" />
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Koneksi Gemini Aktif</span>
            <span className="text-slate-300">|</span>
            <span className="text-[10px] text-[#031466] font-bold">Memori Aktif ({chatHistory.length} chat)</span>
          </div>
        </div>
      </div>

      {/* AREA PESAN */}
      <div ref={scrollRef} className="flex-1 p-5 overflow-y-auto space-y-4 custom-scrollbar bg-[#f8faff]/50">
        {chatHistory.map((msg, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            key={i} 
            className={cn("flex items-end gap-2.5", msg.role === 'user' ? "flex-row-reverse" : "flex-row")}
          >
            {msg.role === 'bubul' ? (
              <BubulMascot className="w-7 h-7 rounded-full shrink-0 shadow-sm" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-[#031466] text-white flex items-center justify-center shrink-0 shadow-sm">
                <User size={12} />
              </div>
            )}

            <div className={cn(
              "max-w-[85%] px-4.5 py-3 shadow-sm transition-all text-xs md:text-sm overflow-hidden", 
              msg.role === 'bubul' 
                ? "bg-white text-slate-800 rounded-[22px] rounded-bl-[6px] border border-slate-100" 
                : "bg-gradient-to-br from-blue-600 to-indigo-750 text-white rounded-[22px] rounded-br-[6px] font-medium"
            )}>
              {msg.role === 'bubul' ? renderMessage(msg.text) : msg.text}
            </div>
          </motion.div>
        ))}
        
        {/* LOADING INDICATOR */}
        <AnimatePresence>
          {isTyping && (
            <motion.div 
              initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-center gap-3"
            >
               <BubulMascot className="w-7 h-7 opacity-60 animate-bounce" />
               <div className="px-4 py-2 bg-white rounded-full border border-blue-50/60 flex items-center gap-2 shadow-sm">
                  <RefreshCw size={11} className="animate-spin text-[#031466]" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Bubul sedang menganalisis...</span>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* TOPIC SUGGESTION CHIPS */}
      <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-100/80">
        <div className="flex items-center gap-1 mb-2">
          <HelpCircle size={12} className="text-[#031466]" />
          <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">
            Saran Topik Literasi
          </p>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1.5 no-scrollbar scroll-smooth">
          {SUGGESTED_TOPICS.map((topic, i) => (
            <button
              key={i}
              onClick={() => handlePredefined(topic.query)}
              disabled={isTyping}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200/60 hover:border-[#031466]/40 text-[11px] text-[#031466] font-bold rounded-full shadow-sm whitespace-nowrap transition-all duration-200 active:scale-95 disabled:opacity-50 shrink-0"
            >
              {topic.label}
            </button>
          ))}
        </div>
      </div>

      {/* INPUT AREA */}
      <div className="p-4 bg-white border-t border-slate-100 rounded-b-[32px]">
        <div className="relative flex items-center bg-slate-50/70 border border-slate-200/80 focus-within:border-[#031466] focus-within:bg-white focus-within:shadow-md focus-within:shadow-[#031466]/5 rounded-full transition-all p-1.5">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={isTyping}
            placeholder="Tanyakan atau tempel studi kasus media sosial..."
            className="w-full pl-4 pr-12 py-2.5 bg-transparent outline-none text-xs md:text-sm font-semibold text-[#031466] placeholder:text-slate-400 placeholder:font-medium disabled:opacity-50"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="absolute right-2 w-9 h-9 bg-gradient-to-br from-[#031466] to-indigo-600 disabled:from-slate-200 disabled:to-slate-300 disabled:text-slate-400 text-white rounded-full flex items-center justify-center shadow-md active:scale-95 transition-all shrink-0"
          >
            <Send size={14} className="-ml-0.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default BubulChat;
