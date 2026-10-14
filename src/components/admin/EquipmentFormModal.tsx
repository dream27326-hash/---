import React, { useState, useEffect } from 'react';
import { Equipment, EquipmentCategory, EquipmentStatus } from '../../types';
import { compressImageFile, PRESET_EQUIPMENT_IMAGES } from '../../utils/imageUtils';
import {
  X,
  Upload,
  Image as ImageIcon,
  Check,
  AlertCircle,
  Package,
} from 'lucide-react';

interface EquipmentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Equipment, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  initialData?: Equipment | null;
}

const CATEGORIES: EquipmentCategory[] = [
  'กล้องถ่ายภาพและวิดีโอ',
  'ไมโครโฟนและอุปกรณ์เสียง',
  'ขาตั้งกล้องและกิมบอล',
  'โปรเจกเตอร์และจอภาพ',
  'อุปกรณ์ไฟสตูดิโอ',
  'แท็บเล็ตและคอมพิวเตอร์',
  'อุปกรณ์เสริมและสายสัญญาณ',
  'อื่นๆ',
];

export const EquipmentFormModal: React.FC<EquipmentFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState<EquipmentCategory>('กล้องถ่ายภาพและวิดีโอ');
  const [totalQuantity, setTotalQuantity] = useState(1);
  const [availableQuantity, setAvailableQuantity] = useState(1);
  const [status, setStatus] = useState<EquipmentStatus>('available');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');

  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showPresets, setShowPresets] = useState(false);

  useEffect(() => {
    if (initialData) {
      setCode(initialData.code);
      setName(initialData.name);
      setCategory(initialData.category);
      setTotalQuantity(initialData.totalQuantity);
      setAvailableQuantity(initialData.availableQuantity);
      setStatus(initialData.status);
      setImageUrl(initialData.imageUrl);
      setDescription(initialData.description);
    } else {
      setCode('');
      setName('');
      setCategory('กล้องถ่ายภาพและวิดีโอ');
      setTotalQuantity(1);
      setAvailableQuantity(1);
      setStatus('available');
      setImageUrl(PRESET_EQUIPMENT_IMAGES[0].url);
      setDescription('');
    }
    setErrorMsg('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('กรุณาเลือกไฟล์รูปภาพเท่านั้น (JPG, PNG, WebP)');
      return;
    }

    setUploadingImage(true);
    setErrorMsg('');
    try {
      const compressedDataUrl = await compressImageFile(file, 800, 0.75);
      setImageUrl(compressedDataUrl);
    } catch (err) {
      console.error('Image compression error:', err);
      setErrorMsg('ไม่สามารถอ่านไฟล์รูปภาพได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !name.trim()) {
      setErrorMsg('กรุณากรอกรหัสอุปกรณ์และชื่ออุปกรณ์');
      return;
    }

    if (totalQuantity < 1) {
      setErrorMsg('จำนวนทั้งหมดต้องมากกว่าหรือเท่ากับ 1');
      return;
    }

    if (availableQuantity > totalQuantity) {
      setErrorMsg('จำนวนคงเหลือต้องไม่มากกว่าจำนวนทั้งหมด');
      return;
    }

    setSaving(true);
    setErrorMsg('');
    try {
      await onSave({
        code: code.trim().toUpperCase(),
        name: name.trim(),
        category,
        totalQuantity: Number(totalQuantity),
        availableQuantity: Number(availableQuantity),
        status,
        imageUrl: imageUrl.trim() || PRESET_EQUIPMENT_IMAGES[0].url,
        description: description.trim(),
      });
      onClose();
    } catch (err) {
      console.error(err);
      setErrorMsg('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-100 my-6">
        {/* Header in Turquoise */}
        <div className="bg-gradient-to-r from-teal-700 via-teal-600 to-cyan-600 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-snug">
                {initialData ? 'แก้ไขข้อมูลอุปกรณ์' : 'เพิ่มอุปกรณ์ใหม่ในระบบ'}
              </h3>
              <p className="text-xs text-teal-100">ภาควิชาเทคโนโลยีการศึกษา</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Code & Name */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                รหัสอุปกรณ์ <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="เช่น CAM-01, MIC-02"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-semibold uppercase focus:outline-hidden focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ชื่ออุปกรณ์ <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="เช่น Sony Alpha 7 IV Mirrorless Kit"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Category & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                หมวดหมู่อุปกรณ์
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as EquipmentCategory)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500 bg-white"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                สถานะความพร้อมของอุปกรณ์
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as EquipmentStatus)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500 bg-white font-medium"
              >
                <option value="available">พร้อมใช้งาน (Available)</option>
                <option value="maintenance">กำลังซ่อมบำรุง (Maintenance)</option>
                <option value="inactive">งดให้บริการชั่วคราว (Inactive)</option>
              </select>
            </div>
          </div>

          {/* Quantities */}
          <div className="grid grid-cols-2 gap-3 p-3.5 bg-teal-50/60 rounded-xl border border-teal-100">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                จำนวนทั้งหมดในคลัง (ชิ้น)
              </label>
              <input
                type="number"
                min="1"
                required
                value={totalQuantity}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 1;
                  setTotalQuantity(val);
                  if (!initialData) setAvailableQuantity(val);
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                จำนวนคงเหลือพร้อมยืม (ชิ้น)
              </label>
              <input
                type="number"
                min="0"
                max={totalQuantity}
                required
                value={availableQuantity}
                onChange={(e) => setAvailableQuantity(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold text-teal-700 bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Image Upload & Management */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700">รูปภาพอุปกรณ์</label>

            {/* Current Image Preview */}
            <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="w-20 h-20 rounded-lg overflow-hidden bg-white border border-slate-200 shrink-0">
                <img
                  src={imageUrl}
                  alt="preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=400&q=80';
                  }}
                />
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap gap-2">
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 transition-colors shadow-xs">
                    <Upload className="w-3.5 h-3.5 text-teal-600" />
                    <span>{uploadingImage ? 'กำลังอัปโหลด...' : 'อัปโหลดรูปภาพจากเครื่อง'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageFileUpload}
                      disabled={uploadingImage}
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => setShowPresets(!showPresets)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-100 transition-colors"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-teal-600" />
                    <span>เลือกรูปภาพจากรายการสำเร็จรูป</span>
                  </button>
                </div>

                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="หรือวางลิงก์รูปภาพ (Image URL)..."
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-hidden focus:ring-1 focus:ring-teal-500 bg-white"
                />
              </div>
            </div>

            {/* Preset Selector */}
            {showPresets && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-5 gap-2 max-h-48 overflow-y-auto">
                {PRESET_EQUIPMENT_IMAGES.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      setImageUrl(preset.url);
                      setShowPresets(false);
                    }}
                    className={`p-1.5 rounded-lg border text-left transition-all group ${
                      imageUrl === preset.url
                        ? 'border-teal-500 bg-teal-50 ring-1 ring-teal-500'
                        : 'border-slate-200 bg-white hover:border-teal-300'
                    }`}
                  >
                    <img
                      src={preset.url}
                      alt={preset.label}
                      className="w-full h-12 object-cover rounded mb-1"
                    />
                    <div className="text-[10px] text-slate-700 font-medium truncate">
                      {preset.label}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              รายละเอียด อุปกรณ์ในชุด และเงื่อนไขการใช้งาน
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="เช่น มีเลนส์ 24-70mm, แบตเตอรี่ 2 ก้อน, สายชาร์จ, เมมโมรี่การ์ด 64GB, และกระเป๋าใส่กล้อง"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 text-rose-700 rounded-xl text-xs border border-rose-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 rounded-xl text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 shadow-md shadow-teal-600/20 disabled:opacity-50 transition-all flex items-center gap-2"
            >
              {saving ? 'กำลังบันทึก...' : initialData ? 'บันทึกการแก้ไข' : 'เพิ่มอุปกรณ์'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
