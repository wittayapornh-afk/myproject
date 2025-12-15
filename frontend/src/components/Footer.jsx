import React from 'react';
import { Link } from 'react-router-dom';
// นำเข้าไอคอน
import { Facebook, Instagram, Twitter, Send, MapPin, Phone, Mail, ChevronRight, ShoppingBag, MessageCircle } from 'lucide-react';

function Footer() {
  return (
    <footer className="bg-[#1D2D27] text-white/80 pt-20 pb-10 mt-auto font-sans">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Brand & Concept */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm group-hover:bg-white/20 transition">
                <ShoppingBag size={20} className="text-white" />
              </div>
              <span className="text-2xl font-black tracking-tight text-white">SHOP.</span>
            </Link>
            <p className="text-sm leading-7 text-gray-400 font-light">
              เราคัดสรรสินค้าคุณภาพดีที่สุด เพื่อไลฟ์สไตล์ที่ลงตัวของคุณ ส่งตรงถึงหน้าบ้านด้วยความใส่ใจในทุกขั้นตอน
            </p>
            <div className="flex gap-4 pt-2">
                <a href="#" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#1877F2] hover:text-white transition-all text-gray-400"><Facebook size={16} /></a>
                <a href="#" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#E4405F] hover:text-white transition-all text-gray-400"><Instagram size={16} /></a>
                <a href="#" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#1DA1F2] hover:text-white transition-all text-gray-400"><Twitter size={16} /></a>
                <a href="#" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#06C755] hover:text-white transition-all text-gray-400"><MessageCircle size={16} /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold mb-6 uppercase tracking-widest text-xs">เมนูแนะนำ</h3>
            <ul className="space-y-3 text-sm text-gray-400 font-medium">
              <li><Link to="/" className="hover:text-[#4ADE80] transition flex items-center gap-2"><ChevronRight size={14} /> หน้าแรก</Link></li>
              <li><Link to="/shop" className="hover:text-[#4ADE80] transition flex items-center gap-2"><ChevronRight size={14} /> สินค้าทั้งหมด</Link></li>
              <li><Link to="/cart" className="hover:text-[#4ADE80] transition flex items-center gap-2"><ChevronRight size={14} /> ตะกร้าสินค้า</Link></li>
              <li><Link to="/profile" className="hover:text-[#4ADE80] transition flex items-center gap-2"><ChevronRight size={14} /> บัญชีของฉัน</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-bold mb-6 uppercase tracking-widest text-xs">ติดต่อเรา</h3>
            <ul className="space-y-4 text-sm text-gray-400 font-medium">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-[#305949] mt-0.5 text-green-400" />
                <span>123 อาคารสยามทาวเวอร์ ชั้น 15,<br/>ถนนสุขุมวิท, กรุงเทพฯ 10330</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-green-400" />
                <span>02-123-4567</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-green-400" />
                <span>hello@myshop.com</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-white font-bold mb-6 uppercase tracking-widest text-xs">รับข่าวสารโปรโมชั่น</h3>
            <p className="text-xs text-gray-400 mb-4">สมัครสมาชิกเพื่อรับส่วนลดและข่าวสารใหม่ๆ</p>
            <div className="relative">
                <input 
                    type="email" 
                    placeholder="อีเมลของคุณ" 
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#305949] focus:bg-white/10 transition" 
                />
                <button className="absolute right-1.5 top-1.5 bg-[#305949] hover:bg-[#234236] text-white p-2 rounded-lg transition shadow-lg">
                    <Send size={14} />
                </button>
            </div>
          </div>
        </div>

        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
          <p>© 2025 My Shop. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition">นโยบายความเป็นส่วนตัว</a>
            <a href="#" className="hover:text-white transition">เงื่อนไขการใช้งาน</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;