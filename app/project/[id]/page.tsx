'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import ProjectCard from '@/components/ProjectCard'

export default function ProjectPage({ params }: any) {
  const [project, setProject] = useState<any>(null)
  const [comments, setComments] = useState<any[]>([])
  const [updates, setUpdates] = useState<any[]>([])

  const load = async () => {
    const { data } = await supabase
      .rpc('get_project_with_counts', { pid: params.id })
    setProject(data?.[0])
    const { data: cs } = await supabase.from('comments').select('*').eq('project_id', params.id).order('created_at', { ascending: false })
    setComments(cs ?? [])
    const { data: us } = await supabase.from('updates').select('*').eq('project_id', params.id).order('created_at', { ascending: false })
    setUpdates(us ?? [])
  }

  useEffect(() => { load() }, [params.id])

  if (!project) return <main className="text-white/70">Loading...</main>

  return (
    <main className="grid gap-4">
      <ProjectCard p={project} onChanged={load} />

      <section className="card">
        <h3 className="text-lg font-semibold mb-3">進捗</h3>
        <ul className="space-y-2">
          {updates.map(u => (
            <li key={u.id} className="border-b border-white/10 pb-2">
              <div className="text-sm">{new Date(u.created_at).toLocaleString()}</div>
              <div>{u.text}</div>
            </li>
          ))}
          {updates.length === 0 && <div className="text-white/60">まだ進捗はありません。</div>}
        </ul>
      </section>

      <section className="card">
        <h3 className="text-lg font-semibold mb-3">コメント</h3>
        <ul className="space-y-2">
          {comments.map(c => (
            <li key={c.id} className="border-b border-white/10 pb-2">
              <div className="text-sm">{new Date(c.created_at).toLocaleString()}</div>
              <div>{c.text}</div>
            </li>
          ))}
          {comments.length === 0 && <div className="text-white/60">まだコメントはありません。</div>}
        </ul>
      </section>
    </main>
  )
}
