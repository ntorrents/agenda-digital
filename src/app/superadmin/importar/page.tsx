'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FileSpreadsheet, UploadCloud, Info, AlertTriangle, CheckCircle2, ChevronRight, Download } from 'lucide-react'

export default function SuperadminImportPage() {
  const [selectedSchool, setSelectedSchool] = useState<string>('')
  const [file, setFile] = useState<File | null>(null)
  
  // Fake state to simulate steps
  const [step, setStep] = useState<1 | 2 | 3>(1)
  
  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto">
      
      <div>
        <h2 className="text-3xl font-black text-white tracking-tight">Importació Massiva (Excel)</h2>
        <p className="text-stone-400 mt-1 text-sm">Pobla tota una escola (aules, educadors i alumnes) en un sol clic.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Flow */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Step 1: School */}
          <div className={`bg-stone-900 border ${step >= 1 ? 'border-violet-500/50 shadow-lg shadow-violet-500/10' : 'border-stone-800'} rounded-[24px] p-6 transition-all`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-black ${step >= 1 ? 'bg-violet-600 text-white' : 'bg-stone-800 text-stone-500'}`}>1</div>
              <h3 className="text-lg font-bold text-white">Selecciona l'Escola Destí</h3>
            </div>
            
            <select 
              value={selectedSchool}
              onChange={(e) => {
                setSelectedSchool(e.target.value)
                if (e.target.value && step === 1) setStep(2)
              }}
              className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-3 text-stone-200 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
            >
              <option value="" disabled>-- Selecciona una escola --</option>
              {/* Fake options for UI mockup */}
              <option value="school_1">Llar d'Infants Sol</option>
              <option value="school_2">Escola Bressol La Lluna</option>
              <option value="school_3">Little Kids Pineda</option>
            </select>
          </div>

          {/* Step 2: Upload File */}
          <div className={`bg-stone-900 border ${step >= 2 ? 'border-violet-500/50 shadow-lg shadow-violet-500/10' : 'border-stone-800 opacity-50 pointer-events-none'} rounded-[24px] p-6 transition-all`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-black ${step >= 2 ? 'bg-violet-600 text-white' : 'bg-stone-800 text-stone-500'}`}>2</div>
              <h3 className="text-lg font-bold text-white">Puja l'arxiu Excel</h3>
            </div>
            
            <label className="border-2 border-dashed border-stone-700 hover:border-violet-500 bg-stone-950/50 hover:bg-violet-500/5 rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all group">
              <UploadCloud className="h-12 w-12 text-stone-600 group-hover:text-violet-500 mb-3 transition-colors" />
              <p className="text-stone-300 font-bold mb-1">Arrossega l'arxiu aquí o fes clic per explorar</p>
              <p className="text-stone-500 text-xs">Suporta format .xlsx o .csv</p>
              <input type="file" className="hidden" accept=".xlsx,.csv" onChange={(e) => {
                if(e.target.files?.[0]) {
                  setFile(e.target.files[0])
                  setStep(3)
                }
              }} />
            </label>
            
            {file && (
              <div className="mt-4 bg-stone-950 border border-stone-800 rounded-xl p-3 flex items-center gap-3">
                <FileSpreadsheet className="h-5 w-5 text-emerald-500" />
                <div className="flex-1">
                  <p className="text-sm font-bold text-stone-200">{file.name}</p>
                  <p className="text-[10px] text-stone-500">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              </div>
            )}
          </div>

          {/* Step 3: Validate & Execute */}
          <div className={`bg-stone-900 border ${step === 3 ? 'border-violet-500/50 shadow-lg shadow-violet-500/10' : 'border-stone-800 opacity-50 pointer-events-none'} rounded-[24px] p-6 transition-all`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-black ${step === 3 ? 'bg-violet-600 text-white' : 'bg-stone-800 text-stone-500'}`}>3</div>
              <h3 className="text-lg font-bold text-white">Revisió i Execució</h3>
            </div>
            
            {step === 3 && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-violet-500/10 border border-violet-500/20">
                  <h4 className="text-sm font-bold text-violet-300 mb-2">Resum de la lectura:</h4>
                  <ul className="space-y-2 text-sm text-stone-300">
                    <li className="flex items-center justify-between">Aules trobades: <span className="font-bold text-white">4</span></li>
                    <li className="flex items-center justify-between">Educadors trobats: <span className="font-bold text-white">8</span></li>
                    <li className="flex items-center justify-between">Alumnes trobats: <span className="font-bold text-white">45</span></li>
                  </ul>
                </div>
                
                <button className="w-full bg-violet-600 hover:bg-violet-700 text-white font-black py-4 rounded-xl shadow-lg shadow-violet-600/20 transition-all flex items-center justify-center gap-2">
                  <UploadCloud className="h-5 w-5" /> Iniciar Importació a la Base de Dades
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Instructions & Format */}
        <div className="space-y-4">
          <div className="bg-stone-900 border border-stone-800 rounded-[24px] p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Info className="h-5 w-5 text-violet-500" /> Format Obligatori
            </h3>
            
            <p className="text-sm text-stone-400 mb-6 leading-relaxed">
              L'arxiu Excel ha de tenir exactament <strong className="text-white">3 pestanyes</strong> (Fulles) amb els noms i columnes següents:
            </p>

            <div className="space-y-4">
              
              <div className="border border-stone-800 rounded-xl p-3 bg-stone-950/50">
                <h4 className="text-sm font-black text-stone-200 mb-2 flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-amber-500"></div> Fulla 1: Aules
                </h4>
                <ul className="text-xs text-stone-400 space-y-1 list-disc pl-4">
                  <li><code className="text-stone-300">Nom_Aula</code> (Ex: P2 B)</li>
                  <li><code className="text-stone-300">Nivell</code> (Ex: I0, I1, I2)</li>
                  <li><code className="text-stone-300">Capacitat</code> (Ex: 20)</li>
                </ul>
              </div>

              <div className="border border-stone-800 rounded-xl p-3 bg-stone-950/50">
                <h4 className="text-sm font-black text-stone-200 mb-2 flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-cyan-500"></div> Fulla 2: Educadors
                </h4>
                <ul className="text-xs text-stone-400 space-y-1 list-disc pl-4">
                  <li><code className="text-stone-300">Nom_Complet</code></li>
                  <li><code className="text-stone-300">Email</code></li>
                  <li><code className="text-stone-300">Password</code> (Opcional, def: 123456)</li>
                  <li><code className="text-stone-300">Aula_Assignada</code> (Deu coincidir amb Fulla 1)</li>
                </ul>
              </div>

              <div className="border border-stone-800 rounded-xl p-3 bg-stone-950/50">
                <h4 className="text-sm font-black text-stone-200 mb-2 flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500"></div> Fulla 3: Alumnes
                </h4>
                <ul className="text-xs text-stone-400 space-y-1 list-disc pl-4">
                  <li><code className="text-stone-300">Nom</code></li>
                  <li><code className="text-stone-300">Cognoms</code></li>
                  <li><code className="text-stone-300">Data_Naixement</code> (YYYY-MM-DD)</li>
                  <li><code className="text-stone-300">Genere</code> (M/F)</li>
                  <li><code className="text-stone-300">Aula_Assignada</code></li>
                  <li><code className="text-stone-300">Email_Familiar</code></li>
                  <li><code className="text-stone-300">Nom_Familiar</code></li>
                  <li><code className="text-stone-300">Relacio</code> (mother/father/tutor)</li>
                </ul>
              </div>

            </div>

            <button className="w-full mt-6 bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm">
              <Download className="h-4 w-4" /> Descarregar Plantilla .xlsx
            </button>

          </div>
        </div>

      </div>

    </div>
  )
}
