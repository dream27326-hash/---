import { EquipmentCategory } from '../types';

export interface SampleEquipmentItem {
  code: string;
  name: string;
  category: EquipmentCategory;
  totalQuantity: number;
  availableQuantity: number;
  status: 'available';
  imageUrl: string;
  description: string;
}

export const SAMPLE_EQUIPMENT_DATA: SampleEquipmentItem[] = [
  {
    code: 'CAM-01',
    name: 'Sony Alpha 7 IV Mirrorless Camera Kit',
    category: 'กล้องถ่ายภาพและวิดีโอ',
    totalQuantity: 4,
    availableQuantity: 4,
    status: 'available',
    imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
    description: 'กล้องฟูลเฟรมความละเอียดสูง 33MP บันทึกวิดีโอ 4K 60p 10-bit พร้อมเลนส์ Sony 24-70mm F2.8 GM, แบตเตอรี่ 2 ก้อน, แท่นชาร์จ และกระเป๋าใส่กล้อง',
  },
  {
    code: 'CAM-02',
    name: 'Panasonic Lumix GH5 Mark II Kit',
    category: 'กล้องถ่ายภาพและวิดีโอ',
    totalQuantity: 3,
    availableQuantity: 3,
    status: 'available',
    imageUrl: 'https://images.unsplash.com/photo-1502982720700-bfff97f2ecac?auto=format&fit=crop&w=800&q=80',
    description: 'กล้องวิดีโอสายงานผลิตสื่อ Micro Four Thirds บันทึก 4K All-Intra รองรับ Live Streaming พร้อมเลนส์ Leica 12-60mm F2.8-4.0',
  },
  {
    code: 'MIC-01',
    name: 'Rode Wireless PRO Wireless Microphone Kit',
    category: 'ไมโครโฟนและอุปกรณ์เสียง',
    totalQuantity: 6,
    availableQuantity: 6,
    status: 'available',
    imageUrl: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=800&q=80',
    description: 'ชุดไมค์ลอยไร้สายคู่ Dual-channel บันทึกเสียง On-board 32-bit float พร้อมเคสชาร์จ, ไมค์หนีบปกเสื้อ 2 ชิ้น และสายต่อสมาร์ตโฟน/กล้อง',
  },
  {
    code: 'MIC-02',
    name: 'Shure MV7X Podcast & Voiceover Microphone',
    category: 'ไมโครโฟนและอุปกรณ์เสียง',
    totalQuantity: 5,
    availableQuantity: 5,
    status: 'available',
    imageUrl: 'https://images.unsplash.com/photo-1583795128727-6ec3642408f8?auto=format&fit=crop&w=800&q=80',
    description: 'ไมโครโฟนบันทึกเสียงบรรยายและพอดแคสต์ระดับสตูดิโอ Dynamic Microphone ทิศทางรับเสียง Cardioid ตัดเสียงรบกวนรอบข้างดีเยี่ยม',
  },
  {
    code: 'TRI-01',
    name: 'Manfrotto 504X Fluid Video Head Tripod',
    category: 'ขาตั้งกล้องและกิมบอล',
    totalQuantity: 6,
    availableQuantity: 6,
    status: 'available',
    imageUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
    description: 'ขาตั้งกล้องวิดีโอมืออาชีพ หัวน้ำมัน Fluid Head แพน-ทิลต์นุ่มนวล รองรับน้ำหนักกล้องสูงสุด 12 กก. มีระดับน้ำวัดสมดุล',
  },
  {
    code: 'GIM-01',
    name: 'DJI RS 3 Pro Gimbal Stabilizer',
    category: 'ขาตั้งกล้องและกิมบอล',
    totalQuantity: 3,
    availableQuantity: 3,
    status: 'available',
    imageUrl: 'https://images.unsplash.com/photo-1581591524425-c7e0978865fc?auto=format&fit=crop&w=800&q=80',
    description: 'ไม้กันสั่น 3 แกนสำหรับงานถ่ายภาพยนตร์ ผลิตจากคาร์บอนไฟเบอร์ รองรับน้ำหนักกล้องภาพยนตร์ พร้อมชุดมอเตอร์ Focus Focus และ RavenEye',
  },
  {
    code: 'PROJ-01',
    name: 'BenQ LW500 Laser Classroom Projector',
    category: 'โปรเจกเตอร์และจอภาพ',
    totalQuantity: 4,
    availableQuantity: 4,
    status: 'available',
    imageUrl: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=800&q=80',
    description: 'เครื่องฉายโปรเจกเตอร์เลเซอร์สำหรับห้องเรียนและห้องสัมมนา ความสว่าง 3,600 ANSI Lumens คมชัด สู้แสงในห้องเรียนได้ดีเยี่ยม พอร์ต HDMI x2',
  },
  {
    code: 'LGT-01',
    name: 'Godox SL60W LED Video Light Studio Kit',
    category: 'อุปกรณ์ไฟสตูดิโอ',
    totalQuantity: 4,
    availableQuantity: 4,
    status: 'available',
    imageUrl: 'https://images.unsplash.com/photo-1527011046414-4781f1f94f8c?auto=format&fit=crop&w=800&q=80',
    description: 'ชุดไฟสตูดิโอต่อเนื่อง LED อุณหภูมิสี 5600K Daylight ค่า CRI 95+ พร้อมซอฟต์บ็อกซ์ Octa 80 ซม. และขาตั้งไฟสแตนเลส',
  },
  {
    code: 'TAB-01',
    name: 'Apple iPad Pro 12.9" with Apple Pencil 2',
    category: 'แท็บเล็ตและคอมพิวเตอร์',
    totalQuantity: 5,
    availableQuantity: 5,
    status: 'available',
    imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80',
    description: 'แท็บเล็ตสำหรับงานเขียนสื่อการสอน นวัตกรรม และออกแบบกราฟิก จอภาพ Liquid Retina XDR พร้อม Apple Pencil รุ่นที่ 2 และ Smart Folio Case',
  },
  {
    code: 'CAP-01',
    name: 'Elgato Cam Link 4K Video Capture Dongle',
    category: 'อุปกรณ์เสริมและสายสัญญาณ',
    totalQuantity: 8,
    availableQuantity: 8,
    status: 'available',
    imageUrl: 'https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&w=800&q=80',
    description: 'อุปกรณ์แปลงสัญญาณ HDMI เข้าสู่คอมพิวเตอร์แบบ Real-time ความละเอียดสูงสุด 4K 30fps หรือ 1080p 60fps สำหรับ Live สอนออนไลน์',
  },
];
