'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { compressImage, ImageDecodeError } from '@/lib/compressImage'
import { useAutoGrowTextarea } from '@/hooks/useAutoGrowTextarea'
import type { Category, MenuItem } from '@/types'
import { IconPhoto, IconUpload, IconX } from '@tabler/icons-react'

type Props = {
  item?: MenuItem
  categories: Category[]
  defaultCategoryId?: string
  onClose: () => void
  onSaved: () => void
}

const inputClass = 'w-full px-2.5 py-2 border border-stone-200 rounded-md text-sm text-stone-800 bg-white focus:outline-none focus:border-admin-accent-light transition-colors font-[inherit]'
const labelClass = 'block text-[12.5px] font-semibold text-stone-700 mb-1'

export default function MenuItemModal({ item, categories, defaultCategoryId, onClose, onSaved }: Props) {
  const [name, setName] = useState(item?.name ?? '')
  const [description, setDescription] = useState(item?.description ?? '')
  const [allergens, setAllergens] = useState(item?.allergens ?? '')
  const [price, setPrice] = useState(item?.price?.toString() ?? '')
  const [categoryId, setCategoryId] = useState(item?.category_id ?? defaultCategoryId ?? categories[0]?.id ?? '')
  const [available, setAvailable] = useState(item?.available ?? true)
  const [saving, setSaving] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(item?.image_url ?? null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [localPreview, setLocalPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const descriptionRef = useAutoGrowTextarea(description ?? '')

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

  async function handleSave() {
    if (!name.trim() || !categoryId) return
    setSaving(true)

    let finalImageUrl: string | null = existingImageUrl

    if (selectedFile) {
      const ext = selectedFile.name.split('.').pop()
      const path = `menu/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
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
      name: name.trim(),
      description: description.trim() || null,
      allergens: allergens.trim() || null,
      price: price ? Number(price) : null,
      category_id: categoryId,
      image_url: finalImageUrl,
      available,
    }

    if (item) {
      await supabase.from('menu_items').update(payload).eq('id', item.id)
    } else {
      await supabase.from('menu_items').insert(payload)
    }

    setSaving(false)
    onSaved()
    onClose()
  }

  return (
    <div
      className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-6"
    >
      <div className="bg-white rounded-xl w-full max-w-md shadow-2xl flex flex-col max-h-[90vh]">

        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200">
          <div className="text-[15px] font-semibold text-stone-800">
            {item ? 'Rediger element' : 'Nytt element'}
          </div>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-stone-100 text-stone-400 transition-colors">
            <IconX size={16} />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-4 overflow-y-auto flex-1">
          <div>
            <label className={labelClass}>Navn *</label>
            <input className={inputClass} value={name} onChange={e => setName(e.target.value)} />
          </div>

          <div>
            <label className={labelClass}>Innhold</label>
            <textarea
              ref={descriptionRef}
              className={inputClass + ' block resize-none overflow-hidden min-h-17'}
              value={description ?? ''}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label className={labelClass}>Allergener</label>
            <input
              className={inputClass}
              value={allergens ?? ''}
              onChange={e => setAllergens(e.target.value)}
            />
          </div>

          <div className="flex gap-3 items-start">
            <div>
              <label className={labelClass}>Bilde</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              {previewSrc ? (
                <div className="relative rounded-lg overflow-hidden border border-stone-200 aspect-square w-40">
                  <Image src={previewSrc} alt="" fill unoptimized sizes="160px" className="object-cover" />
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
                  className="w-40 aspect-square flex flex-col items-center justify-center gap-2 border border-dashed border-stone-300 rounded-lg text-[13px] text-stone-400 hover:bg-stone-50 hover:border-stone-400 transition-colors"
                >
                  <IconUpload size={15} />
                  Last opp bilde
                </button>
              )}
            </div>
            <div className="flex-1 flex flex-col gap-3.5">
              <div>
                <label className={labelClass}>Pris (kr)</label>
                <input className={inputClass} type="number" min="0" value={price} onChange={e => setPrice(e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Kategori *</label>
                <select className={inputClass} value={categoryId} onChange={e => setCategoryId(e.target.value)}>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <label className="flex items-center gap-2 text-[13.5px] text-stone-700 cursor-pointer">
                <input type="checkbox" checked={available} onChange={e => setAvailable(e.target.checked)} className="accent-admin-accent" />
                Synlig på menyen
              </label>
            </div>
          </div>
        </div>

        {uploadError && (
          <div className="mx-5 mb-2 px-3 py-2 bg-red-50 border border-red-200 rounded-md text-[12.5px] text-red-600">
            {uploadError}
          </div>
        )}
        <div className="flex justify-end gap-2 px-5 py-3.5 border-t border-stone-200 shrink-0">
          <button
            onClick={onClose}
            className="inline-flex items-center px-3 py-1.5 text-[13px] font-medium rounded-md border border-stone-200 bg-white text-stone-700 hover:bg-stone-50 transition-colors"
          >
            Avbryt
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !name.trim()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium rounded-md bg-admin-accent border border-admin-accent text-white hover:bg-admin-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <IconPhoto size={14} /> Lagrer…
              </>
            ) : 'Lagre'}
          </button>
        </div>

      </div>
    </div>
  )
}
