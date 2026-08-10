'use client'

import { useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Event } from '@/types'
import { IconX, IconUpload } from '@tabler/icons-react'

type Props = {
  event?: Event
  registrationCount?: number
  onClose: () => void
  onSaved: () => void
}

const inputClass = 'w-full px-2.5 py-2 border border-stone-200 rounded-md text-sm text-stone-800 bg-white focus:outline-none focus:border-pink-400 transition-colors font-[inherit]'
const labelClass = 'block text-[12.5px] font-semibold text-stone-700 mb-1'

export default function EventModal({ event, registrationCount = 0, onClose, onSaved }: Props) {
  const [title, setTitle] = useState(event?.title ?? '')
  const [description, setDescription] = useState(event?.description ?? '')
  const [eventDate, setEventDate] = useState(event?.event_date ?? '')
  const [startTime, setStartTime] = useState(event?.event_start_time?.slice(0, 5) ?? '')
  const [endTime, setEndTime] = useState(event?.event_end_time?.slice(0, 5) ?? '')
  const [maxCapacity, setMaxCapacity] = useState(event?.max_capacity?.toString() ?? '')
  const [published, setPublished] = useState(event?.published ?? false)
  const [saving, setSaving] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [errors, setErrors] = useState<{ date?: string; maxCapacity?: string }>({})
  const [confirmTimeChange, setConfirmTimeChange] = useState(false)

  const today = new Date().toISOString().slice(0, 10)
  const endTimeInvalid = !!endTime && !!startTime && endTime <= startTime

  function validate() {
    const e: { date?: string; maxCapacity?: string } = {}
    if (eventDate && eventDate < today) e.date = 'Datoen har allerede vært'
    if (maxCapacity && Number(maxCapacity) <= 0) e.maxCapacity = 'Må være minst 1'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(event?.image_url ?? null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [localPreview, setLocalPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const previewSrc = localPreview ?? existingImageUrl

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setSelectedFile(file)
    setLocalPreview(URL.createObjectURL(file))
  }

  function handleRemoveImage() {
    setSelectedFile(null)
    setLocalPreview(null)
    setExistingImageUrl(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const timeChanged = !!event && (
    eventDate !== event.event_date ||
    startTime !== event.event_start_time.slice(0, 5) ||
    endTime !== (event.event_end_time?.slice(0, 5) ?? '')
  )

  function handleSaveClick() {
    if (!title.trim() || !eventDate || !startTime || endTimeInvalid) return
    if (!validate()) return
    if (timeChanged && registrationCount > 0) {
      setConfirmTimeChange(true)
      return
    }
    doSave()
  }

  async function doSave() {
    setSaving(true)
    setUploadError(null)

    let finalImageUrl: string | null = existingImageUrl

    if (selectedFile) {
      const ext = selectedFile.name.split('.').pop()
      const path = `events/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { data, error } = await supabase.storage.from('images').upload(path, selectedFile)
      if (error) {
        setUploadError(`Bildeopplasting feilet: ${error.message}`)
        setSaving(false)
        return
      }
      const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(data.path)
      finalImageUrl = publicUrl
    }

    const payload = {
      title: title.trim(),
      description: description.trim() || null,
      image_url: finalImageUrl,
      event_date: eventDate,
      event_start_time: startTime,
      event_end_time: endTime || null,
      max_capacity: maxCapacity ? Number(maxCapacity) : null,
      published,
    }

    if (event) {
      await supabase.from('events').update(payload).eq('id', event.id)
    } else {
      await supabase.from('events').insert(payload)
    }

    setSaving(false)
    onSaved()
    onClose()
  }

  return (
    <div
      className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-6"
    >
      <div className="bg-white rounded-xl w-full max-w-md shadow-2xl flex flex-col max-h-[85vh]">

        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200 shrink-0">
          <div className="text-[15px] font-semibold text-stone-800">
            {event ? 'Rediger arrangement' : 'Nytt arrangement'}
          </div>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-stone-100 text-stone-400 transition-colors">
            <IconX size={16} />
          </button>
        </div>

        {confirmTimeChange ? (
          <div className="p-8 text-center flex flex-col items-center gap-4">
            <p className="text-[14px] text-stone-700">
              Dette arrangementet har {registrationCount} påmeldt{registrationCount === 1 ? '' : 'e'} som ikke varsles automatisk om denne endringen.
            </p>
            <p className="text-[12.5px] text-stone-500">
              Lagre uten å varsle, eller avbryt og bruk «Oppdatering til påmeldte» i stedet.
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setConfirmTimeChange(false)}
                className="inline-flex items-center px-3 py-1.5 text-[13px] font-medium rounded-md border border-stone-200 bg-white text-stone-700 hover:bg-stone-50 transition-colors"
              >
                Avbryt
              </button>
              <button
                onClick={() => { setConfirmTimeChange(false); doSave() }}
                className="inline-flex items-center px-3 py-1.5 text-[13px] font-medium rounded-md bg-pink-500 border border-pink-500 text-white hover:bg-pink-600 transition-colors"
              >
                Lagre uten å varsle
              </button>
            </div>
          </div>
        ) : (
        <>
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-3.5">
          <div>
            <label className={labelClass}>Tittel *</label>
            <input className={inputClass} value={title} onChange={e => setTitle(e.target.value)} />
          </div>

          <div>
            <label className={labelClass}>Beskrivelse</label>
            <textarea
              className={inputClass + ' resize-y min-h-18'}
              value={description ?? ''}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className={labelClass}>Dato *</label>
              <input
                type="date"
                className={inputClass + (errors.date ? ' border-red-400' : '')}
                value={eventDate}
                min={today}
                onChange={e => { setEventDate(e.target.value); setErrors(prev => ({ ...prev, date: undefined })) }}
              />
              {errors.date && <p className="text-[11.5px] text-red-500 mt-1">{errors.date}</p>}
            </div>
            <div className="flex-1">
              <label className={labelClass}>Maks antall</label>
              <input
                type="number"
                min="1"
                className={inputClass + (errors.maxCapacity ? ' border-red-400' : '')}
                value={maxCapacity}
                onChange={e => { setMaxCapacity(e.target.value); setErrors(prev => ({ ...prev, maxCapacity: undefined })) }}
                placeholder="Ubegrenset"
              />
              {errors.maxCapacity && <p className="text-[11.5px] text-red-500 mt-1">{errors.maxCapacity}</p>}
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className={labelClass}>Starttid *</label>
              <input
                type="time"
                className={inputClass}
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label className={labelClass}>Sluttid</label>
              <input
                type="time"
                className={inputClass + (endTimeInvalid ? ' border-red-400' : '')}
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
              />
              {endTimeInvalid && <p className="text-[11.5px] text-red-500 mt-1">Må være etter starttid</p>}
            </div>
          </div>

          <div>
            <label className={labelClass}>Bilde</label>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            <div className="w-88 max-w-full">
              {previewSrc ? (
                <div className="relative rounded-lg overflow-hidden border border-stone-200 aspect-video">
                  <img src={previewSrc} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 p-1 bg-white/80 rounded-full hover:bg-white transition-colors shadow-sm"
                  >
                    <IconX size={13} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full aspect-video flex flex-col items-center justify-center gap-2 border border-dashed border-stone-300 rounded-lg text-[13px] text-stone-400 hover:bg-stone-50 hover:border-stone-400 transition-colors"
                >
                  <IconUpload size={15} /> Last opp bilde
                </button>
              )}
            </div>
          </div>

          <label className="flex items-center gap-2 text-[13.5px] text-stone-700 cursor-pointer">
            <input type="checkbox" checked={published} onChange={e => setPublished(e.target.checked)} />
            Publisert
          </label>
        </div>

        {uploadError && (
          <div className="mx-5 mb-2 px-3 py-2 bg-red-50 border border-red-200 rounded-md text-[12.5px] text-red-600">
            {uploadError}
          </div>
        )}

        <div className="flex justify-end gap-2 px-5 py-3.5 border-t border-stone-200 shrink-0">
          <button onClick={onClose} className="inline-flex items-center px-3 py-1.5 text-[13px] font-medium rounded-md border border-stone-200 bg-white text-stone-700 hover:bg-stone-50 transition-colors">
            Avbryt
          </button>
          <button
            onClick={handleSaveClick}
            disabled={saving || !title.trim() || !eventDate || !startTime || endTimeInvalid}
            className="inline-flex items-center px-3 py-1.5 text-[13px] font-medium rounded-md bg-pink-500 border border-pink-500 text-white hover:bg-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Lagrer…' : event ? 'Lagre' : 'Opprett'}
          </button>
        </div>
        </>
        )}

      </div>
    </div>
  )
}
