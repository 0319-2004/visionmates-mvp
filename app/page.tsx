'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import ProjectCard from '@/components/ProjectCard'

export default function HomePage() {
  const [projects, setProjects] = useState<any[]>([])
  const [title, setTitle] = useState('')
  const [purpose, setPurpose] = useState('')
  const [tags, setTags] = useState('')

  const fetchProjects = async () => {
    const { data, error } = await supabase
      .rpc('list_projects_with_counts')
    if (error) console.error(error); else setProjects(data ?? [])
  }

  useEffect(() => { fetchProjects() }, [])

  const createProject = async () => {
    if (!title.trim() || !purpose.trim()) return alert('タイトルと目的は必須です')
    const tagArr = tags.split(',').map(s => s.trim()).filter(Boolean)
    const { error } = await supabase.from('projects').insert({ title, purpose, tags: tagArr })
    if (error) alert(error.message); else { setTitle(''); setPurpose(''); setTags(''); fetchProjects() }
  }

  return (
    <main>
      <div className="card mb-6">
        <h2 className="text-lg font-semibold mb-3">新規プロジェクト</h2>
        <div className="grid md:grid-cols-3 gap-3">
          <div>
            <div className="label">タイトル</div>
            <input className="input" value={title} onChange={e=>setTitle(e.target.value)} placeholder="1週間で〇〇の試作を作る" />
          </div>
          <div className="md:col-span-2">
            <div className="label">目的（140字）</div>
            <input className="input" value={purpose} onChange={e=>setPurpose(e.target.value)} placeholder="何を検証/達成したいか" />
          </div>
          <div className="md:col-span-3">
            <div className="label">タグ（カンマ区切り）</div>
            <input className="input" value={tags} onChange={e=>setTags(e.target.value)} placeholder="社会課題, 観光, アプリ" />
          </div>
        </div>
        <div className="mt-3">
          <button className="btn" onClick={createProject}>作成</button>
        </div>
      </div>

      <div className="grid gap-4">
        {projects.map(p => <ProjectCard key={p.id} p={p} onChanged={fetchProjects} />)}
        {projects.length === 0 && <div className="text-white/60">まだプロジェクトはありません。</div>}
      </div>
    </main>
  )
}
