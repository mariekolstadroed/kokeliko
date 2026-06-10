import RegularHours from './RegularHours'
import SpecialHours from './SpecialHours'

export default function HoursSection() {
  return (
    <div className="max-w-3xl mx-auto p-6 flex flex-col gap-4">
      <RegularHours />
      <SpecialHours />
    </div>
  )
}
