'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { compressImage, ImageDecodeError } from '@/lib/compressImage'
import { toLocalISODate } from '@/lib/date'
import { useAutoGrowTextarea } from '@/hooks/useAutoGrowTextarea'
import type { Event } from '@/types'
import { IconX, IconUpload } from '@tabler/icons-react'

type Props = {
  event?: Event
  registrationCount?: number
  onClose: () => void
  onSaved: () => void
}

const inputClass = 'w-full px-2.5 py-2 border border-stone-200 rounded-md text-sm text-stone-800 bg-white focus:outline-none focus:border-admin-accent-light transition-colors font-[inherit]'
const labelClass = 'block text-[12.5px] font-semibold text-stone-700 mb-1'

export default function EventModal({ event, registrationCount = 0, onClose, onSaved }: Props) {
  const [title, setTitle] = useState(event?.title ?? '')
  const [description, setDescription] = useState(event?.description ?? '')
  const [dateTBD, setDateTBD] = useState(!!event && !event.event_date)
  const [eventDate, setEventDate] = useState(event?.event_date ?? '')
  const [startTime, setStartTime] = useState(event?.event_start_time?.slice(0, 5) ?? '')
  const [endTime, setEndTime] = useState(event?.event_end_time?.slice(0, 5) ?? '')
  const [maxCapacity, setMaxCapacity] = useState(event?.max_capacity?.toString() ?? '')
  const [published, setPublished] = useState(event?.published ?? false)
  const [saving, setSaving] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [errors, setErrors] = useState<{ date?: string; maxCapacity?: string }>({})
  const [confirmTimeChange, setConfirmTimeChange] = useState(false)
  const descriptionRef = useAutoGrowTextarea(description)

  const today = toLocalISODate(new Date())
  const endTimeInvalid = !dateTBD && !!endTime && !!startTime && endTime <= startTime

  function validate() {
    const e: { date?: string; maxCapacity?: string } = {}
    if (!dateTBD && eventDate && eventDate < today) e.date = 'Datoen har allerede vært'
    if (maxCapacity && Number(maxCapacity) <= 0) e.maxCapacity = 'Må være minst 1'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(event?.image_url ?? null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [localPreview, setLocalPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const previewSrc = localPreview ?? existingImageUrl

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadError(null)
    try {
      const compressed = await compressImage(file)
      setSelectedFile(compressed)
      setLocalPreview(URL.createObjectURL(compressed))
    } catch (err) {
      setUploadError(err instanceof ImageDecodeError ? err.message : 'Bildet kunne ikke leses.')
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  function handleRemoveImage() {
    setSelectedFile(null)
    setLocalPreview(null)
    setExistingImageUrl(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const finalEventDate = dateTBD ? null : (eventDate || null)
  const finalStartTime = dateTBD ? null : (startTime || null)
  const finalEndTime = dateTBD ? null : (endTime || null)

  const timeChanged = !!event && (
    finalEventDate !== event.event_date ||
    finalStartTime !== (event.event_start_time?.slice(0, 5) ?? null) ||
    finalEndTime !== (event.event_end_time?.slice(0, 5) ?? null)
  )

  function handleSaveClick() {
    if (!title.trim() || (!dateTBD && (!eventDate || !startTime)) || endTimeInvalid) return
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
      const { data, error } = await supabase.storage.from('images').upload(path, selectedFile, { cacheControl: '2678400' })
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
      event_date: finalEventDate,
      event_start_time: finalStartTime,
      event_end_time: finalEndTime,
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
          <button onClick={onClose} disabled={saving} className="p-1 rounded-md hover:bg-stone-100 text-stone-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
            <IconX size={16} />
          </button>
        </div>

        {confirmTimeChange ? (
          <div className="p-8 text-center flex flex-col items-center gap-4">
            <p className="text-[14px] text-stone-700">
              Dette arrangementet har {registrationCount} påmeldt{registrationCount === 1 ? '' : 'e'} som ikke varsles automatisk om denne endringen.
            </p>
            <p className="text-[12.5px] text-stone-500">
              {dateTBD
                ? 'Lagre uten å varsle, eller avbryt og bruk «Avlys» i «Oppdatering til påmeldte» i stedet hvis arrangementet faktisk er avlyst.'
                : 'Lagre uten å varsle, eller avbryt og bruk «Oppdatering til påmeldte» i stedet.'}
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
                className="inline-flex items-center px-3 py-1.5 text-[13px] font-medium rounded-md bg-admin-accent border border-admin-accent text-white hover:bg-admin-accent-hover transition-colors"
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
              ref={descriptionRef}
              className={inputClass + ' resize-none overflow-hidden min-h-18'}
              value={description ?? ''}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          <label className="flex items-center gap-2 text-[13.5px] text-stone-700 cursor-pointer">
            <input
              type="checkbox"
              checked={dateTBD}
              onChange={e => { setDateTBD(e.target.checked); setErrors({}) }}
              className="accent-admin-accent"
            />
            Dato ikke bestemt ennå
          </label>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className={labelClass}>Dato {dateTBD ? '' : '*'}</label>
              <input
                type="date"
                disabled={dateTBD}
                className={inputClass + (errors.date ? ' border-red-400' : '') + (dateTBD ? ' opacity-50 cursor-not-allowed' : '')}
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
              <label className={labelClass}>Starttid {dateTBD ? '' : '*'}</label>
              <input
                type="time"
                disabled={dateTBD}
                className={inputClass + (dateTBD ? ' opacity-50 cursor-not-allowed' : '')}
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label className={labelClass}>Sluttid</label>
              <input
                type="time"
                disabled={dateTBD}
                className={inputClass + (endTimeInvalid ? ' border-red-400' : '') + (dateTBD ? ' opacity-50 cursor-not-allowed' : '')}
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
                  <Image src={previewSrc} alt="" fill unoptimized sizes="352px" className="object-cover" />
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
            <input type="checkbox" checked={published} onChange={e => setPublished(e.target.checked)} className="accent-admin-accent" />
            Publisert
          </label>
        </div>

        {uploadError && (
          <div className="mx-5 mb-2 px-3 py-2 bg-red-50 border border-red-200 rounded-md text-[12.5px] text-red-600">
            {uploadError}
          </div>
        )}

        <div className="flex justify-end gap-2 px-5 py-3.5 border-t border-stone-200 shrink-0">
          <button onClick={onClose} disabled={saving} className="inline-flex items-center px-3 py-1.5 text-[13px] font-medium rounded-md border border-stone-200 bg-white text-stone-700 hover:bg-stone-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            Avbryt
          </button>
          <button
            onClick={handleSaveClick}
            disabled={saving || !title.trim() || (!dateTBD && (!eventDate || !startTime)) || endTimeInvalid}
            className="inline-flex items-center px-3 py-1.5 text-[13px] font-medium rounded-md bg-admin-accent border border-admin-accent text-white hover:bg-admin-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
