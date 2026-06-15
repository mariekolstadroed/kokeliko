import Image from 'next/image'
import logo from '@/assets/logo-hvit.png'
import { IconBrandInstagram, IconBrandFacebook, IconBrandTiktok, IconMapPin, IconPhone, IconMail } from '@tabler/icons-react'

const socials = [
  { icon: <IconBrandInstagram size={18} />, href: 'https://www.instagram.com/kokelikokaffebar/', label: 'Instagram' },
  { icon: <IconBrandFacebook size={18} />, href: 'https://www.facebook.com/kokeliko.no', label: 'Facebook' },
  { icon: <IconBrandTiktok size={18} />, href: 'https://www.tiktok.com/@kokelikokaffebar', label: 'TikTok' },
]

const contact = [
  { icon: <IconMapPin size={16} />, text: 'Elvegangen 9' },
  { icon: <IconPhone size={16} />, text: '+47 123 45 678' },
  { icon: <IconMail size={16} />, text: 'elin@kokeliko.no' },
]

export default function Footer() {
  return (
    <footer className="bg-[#2e1608]">
      <div className="px-6 py-14 grid grid-cols-3 items-center gap-8 max-w-7xl mx-auto">

        <Image src={logo} alt="Kokeliko" className="brightness-90 w-auto h-13" />

        <div className="flex items-center justify-center gap-4">
          {socials.map(({ icon, href, label }) => (
            <a
              key={label}
              href={href}
              aria-label={label}
              className="w-12 h-12 rounded-full border border-[#c9a882]/40 flex items-center justify-center text-[#c9a882] hover:border-[#c9a882] transition-colors"
            >
              {icon}
            </a>
          ))}
        </div>

        <div className="flex flex-col items-end gap-3 text-[#c9a882]">
          <p className="font-special-elite text-xl tracking-wide mb-1">Kontakt</p>
          {contact.map(({ icon, text }) => (
            <div key={text} className="flex items-center gap-2 text-sm">
              {icon}
              <span>{text}</span>
            </div>
          ))}
        </div>

      </div>

      <div className="border-t border-[#c9a882]/20 py-5 text-center text-[#c9a882]/60 text-xs">
        © {new Date().getFullYear()} Kokeliko
      </div>
    </footer>
  )
}
