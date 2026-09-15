import React, { useState } from 'react';

interface HelpSupportViewProps {
  onBack: () => void;
}

export const HelpSupportView: React.FC<HelpSupportViewProps> = ({ onBack }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [issueText, setIssueText] = useState('');

  const faqs = [
    {
      q: 'Is StayDirect really 100% Zero Brokerage?',
      a: 'Yes, absolutely! We connect students directly to hostel and PG owners. You will never be asked for any brokerage, brokerage agreement fee, or middleman commission.',
    },
    {
      q: 'How do I schedule a physical room visit?',
      a: 'Open any hostel listing, click the "Book Visit" button, pick your preferred date and time, and confirm. The owner will be notified immediately to welcome you for a walkthrough.',
    },
    {
      q: 'What documents are required for student check-in?',
      a: 'Most verified Pune hostels require: (1) College / University ID card or admission letter, (2) Government Photo ID (Aadhaar or Passport), and (3) 2 passport size photographs.',
    },
    {
      q: 'How does the refundable security deposit work?',
      a: 'Standard Pune hostels ask for 1 to 2 months of refundable security deposit paid directly to the owner. This is refunded upon move-out subject to notice period guidelines.',
    },
    {
      q: 'I am a property owner. How do I list my hostel or PG?',
      a: 'Simply switch to "Owner Hub" via the top header or side drawer, click "+ Add New Hostel", enter your property details and photos, and publish for instant visibility.',
    },
  ];

  const filteredFaqs = faqs.filter(
    (f) =>
      f.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueText.trim()) return;
    setReportSubmitted(true);
    setIssueText('');
    setTimeout(() => setReportSubmitted(false), 3000);
  };

  return (
    <div className="flex flex-col w-full pb-28 space-y-4 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-2 pt-1">
        <button
          type="button"
          onClick={onBack}
          className="w-10 h-10 -ml-1 rounded-full flex items-center justify-center text-[#111C2D] hover:bg-[#E7EEFF]"
        >
          <span className="material-symbols-outlined text-[24px]">arrow_back</span>
        </button>
        <div>
          <h1 className="text-xl font-bold text-[#111C2D]">Help & Support</h1>
          <p className="text-xs text-[#404945]">FAQs & Student Assistance Desk</p>
        </div>
      </div>

      {/* Search Support */}
      <div className="relative flex items-center">
        <span className="material-symbols-outlined absolute left-3 text-[#707975] text-[18px]">
          search
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search questions or topics..."
          className="w-full h-11 pl-9 pr-3 bg-white border border-[#E2E8F0] rounded-xl text-xs text-[#111C2D] shadow-xs focus:outline-none focus:border-[#006C49]"
        />
      </div>

      {/* Quick Help Channels */}
      <div className="grid grid-cols-2 gap-2.5">
        <a
          href="https://wa.me/919822044551?text=Hi%20StayDirect%20Support,%20I%20need%20assistance"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white border border-[#E2E8F0] p-3 rounded-2xl flex items-center gap-2.5 shadow-xs hover:border-[#25D366] transition-colors"
        >
          <div className="w-10 h-10 rounded-xl bg-[#25D366]/15 text-[#25D366] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[20px]">chat</span>
          </div>
          <div className="min-w-0">
            <span className="text-xs font-bold text-[#111C2D] block truncate">WhatsApp Us</span>
            <span className="text-[10px] text-[#25D366] font-semibold">Fast reply</span>
          </div>
        </a>

        <a
          href="tel:+919822044551"
          className="bg-white border border-[#E2E8F0] p-3 rounded-2xl flex items-center gap-2.5 shadow-xs hover:border-[#006C49] transition-colors"
        >
          <div className="w-10 h-10 rounded-xl bg-[#E8F5EE] text-[#006C49] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[20px]">call</span>
          </div>
          <div className="min-w-0">
            <span className="text-xs font-bold text-[#111C2D] block truncate">Student Desk</span>
            <span className="text-[10px] text-[#404945]">9 AM - 8 PM</span>
          </div>
        </a>
      </div>

      {/* Frequently Asked Questions */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-bold text-[#111C2D] px-1">Frequently Asked Questions</span>

        {filteredFaqs.map((faq, idx) => {
          const isOpen = openFaq === idx;
          return (
            <div
              key={idx}
              className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-xs transition-all"
            >
              <button
                type="button"
                onClick={() => setOpenFaq(isOpen ? null : idx)}
                className="w-full p-3.5 text-left flex items-center justify-between gap-2"
              >
                <span className="text-xs font-bold text-[#111C2D]">{faq.q}</span>
                <span className="material-symbols-outlined text-[18px] text-[#707975] shrink-0">
                  {isOpen ? 'expand_less' : 'expand_more'}
                </span>
              </button>

              {isOpen && (
                <div className="px-3.5 pb-3.5 pt-0 text-xs text-[#404945] leading-relaxed border-t border-[#F0F3FF]">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Report an Issue or Feedback */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-xs">
        <h3 className="text-xs font-bold text-[#111C2D] mb-1">Report an Issue or Suggestion</h3>
        <p className="text-[11px] text-[#404945] mb-2.5">
          Notice an incorrect price or unresponsive hostel? Let our team know.
        </p>

        {reportSubmitted ? (
          <div className="bg-[#E8F5EE] text-[#006C49] p-3 rounded-xl text-xs font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            <span>Thank you! Your feedback has been forwarded to the Pune audit team.</span>
          </div>
        ) : (
          <form onSubmit={handleReportSubmit} className="flex flex-col gap-2">
            <textarea
              rows={2}
              value={issueText}
              onChange={(e) => setIssueText(e.target.value)}
              placeholder="Describe what happened or request a specific hostel..."
              className="w-full p-2.5 bg-[#F0F3FF] border border-[#E2E8F0] rounded-xl text-xs text-[#111C2D] focus:outline-none focus:border-[#006C49] resize-none"
            />
            <button
              type="submit"
              className="h-9 bg-[#00362A] text-white rounded-xl text-xs font-bold hover:bg-[#124E3F] transition-colors self-end px-4"
            >
              Submit Report
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
