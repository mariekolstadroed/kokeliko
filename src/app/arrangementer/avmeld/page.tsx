import Image from 'next/image'
import bakgrunn from '@/assets/events/bakgrunn.jpg'
import AvmeldForm from './AvmeldForm'

export default async function AvmeldPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams

  return (
    <div className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden">
      <Image
        unoptimized
        src={bakgrunn}
        alt=""
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-1/30" />
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative z-10">
        <AvmeldForm token={token ?? null} />
      </div>
    </div>
  )
}
