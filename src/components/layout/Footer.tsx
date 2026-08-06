import { IconBrandInstagram, IconBrandFacebook, IconBrandTiktok, IconMapPin, IconPhone, IconMail, type Icon } from '@tabler/icons-react'

const socials: { Icon: Icon; href: string; label: string }[] = [
  { Icon: IconBrandInstagram, href: 'https://www.instagram.com/kokelikokaffebar/', label: 'Instagram' },
  { Icon: IconBrandFacebook, href: 'https://www.facebook.com/kokeliko.no', label: 'Facebook' },
  { Icon: IconBrandTiktok, href: 'https://www.tiktok.com/@kokelikokaffebar', label: 'TikTok' },
]

const contact = [
  { icon: <IconMapPin size={16} />, text: 'Elvegangen 9' },
  { icon: <IconPhone size={16} />, text: '+47 940 88 782' },
  { icon: <IconMail size={16} />, text: 'elin@kokeliko.no' },
]

export default function Footer() {
  return (
    <footer className="bg-1">
      <div className="px-6 md:px-10 lg:px-6 py-14 max-lg:py-10 grid grid-cols-1 md:grid-cols-3 items-center gap-8 max-w-7xl mx-auto">

        <div className="logo brightness-90 w-auto h-10 lg:h-13 max-lg:mx-auto" role="img" aria-label="Kokeliko" />

        <div className="flex items-center justify-center gap-4">
          {socials.map(({ Icon, href, label }) => (
            <a
              key={label}
              href={href}
              aria-label={label}
              className="w-10 h-10 lg:w-14 lg:h-14 rounded-full border border-(--color-4)/40 flex items-center justify-center text-3 hover:border-(--color-4) transition-colors"
            >
              <Icon size={18} className="lg:hidden" />
              <Icon size={26} className="hidden lg:block" />
            </a>
          ))}
        </div>

        <div className="flex flex-col items-end max-md:items-center gap-3 text-3">
          <p className="font-special-elite text-xl tracking-wide mb-1 text-3">Kontakt</p>
          {contact.map(({ icon, text }) => (
            <div key={text} className="flex items-center gap-2 text-sm">
              {icon}
              <span>{text}</span>
            </div>
          ))}
        </div>

      </div>

      <div className="border-t border-(--color-4)/20 py-5 text-center text-3/60 text-xs">
        © {new Date().getFullYear()} Kokeliko
      </div>
    </footer>
  )
}
