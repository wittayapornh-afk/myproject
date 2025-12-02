// frontend/src/components/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="bg-[#263A33] text-white/80 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          {/* Column 1: Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2 group">
              <span className="text-3xl filter drop-shadow-md">🥦</span>
              <span className="text-2xl font-bold tracking-tight text-white">My Shop</span>
            </Link>
            <p className="text-sm leading-relaxed opacity-70">
              ร้านค้าออนไลน์ที่คัดสรรสินค้าคุณภาพ เป็นมิตรกับธรรมชาติ เพื่อชีวิตที่ลงตัวของคุณ
            </p>
          </div>

          {/* Column 2: Links */}
          <div>
            <h3 className="text-white font-bold mb-4 uppercase tracking-widest text-sm">เมนูลัด</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-white transition">หน้าแรก</Link></li>
              <li><Link to="/" className="hover:text-white transition">สินค้าทั้งหมด</Link></li>
              <li><Link to="/cart" className="hover:text-white transition">ตะกร้าสินค้า</Link></li>
              <li><Link to="/product/add" className="hover:text-white transition">ลงขายสินค้า</Link></li>
            </ul>
          </div>

          {/* Column 3: Contact */}
          <div>
            <h3 className="text-white font-bold mb-4 uppercase tracking-widest text-sm">ติดต่อเรา</h3>
            <ul className="space-y-2 text-sm opacity-70">
              <li>📍 123 ถนนสุขุมวิท, กรุงเทพฯ</li>
              <li>📞 02-123-4567</li>
              <li>✉️ hello@myshop.com</li>
              <li>⏰ เปิดทุกวัน 09:00 - 18:00</li>
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div>
            <h3 className="text-white font-bold mb-4 uppercase tracking-widest text-sm">ติดตามข่าวสาร</h3>
            <div className="flex flex-col gap-3">
                <input type="email" placeholder="อีเมลของคุณ" className="bg-white/10 border border-white/10 rounded-lg px-4 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:border-white/50" />
                <button className="bg-[#749B6B] hover:bg-[#85AD7A] text-white px-4 py-2 rounded-lg text-sm font-bold transition">สมัครรับข่าวสาร</button>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 text-center text-xs opacity-50">
          <p>© 2025 My Shop. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;