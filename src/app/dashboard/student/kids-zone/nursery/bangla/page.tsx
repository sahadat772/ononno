'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import KidsZoneShell from '@/components/kids/KidsZoneShell'

// Restored via path - SEE ARTIFACT
export default function NurseryBanglaPage() {
  return (
    <KidsZoneShell title="বাংলা" subtitle="বর্ণমালা শিখি" emoji="🔤" stars={0}>
      <p className="text-center text-slate-400">লোড হচ্ছে… deploy fix in progress</p>
      <Link href="/dashboard/student/kids-zone" className="mt-4 block text-center text-sky-400">
        ← Kids Zone
      </Link>
    </KidsZoneShell>
  )
}
