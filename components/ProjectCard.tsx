'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function ProjectCard({ p, onChanged }: any) {
  const [comment, setComment] = useState('')

  const intent = async (level: 'watch'|'raise'|'commit') => {
    const { error } = await supabase.from('intents').insert({ project_id: p.id, level })
    if (error) alert(error.message); else onChanged?.()
  }

  const addComment = async () => {
    if (!comment.trim()) return
    const { error } = await supabase.from('comments').insert({ project_id: p.id, text: comment.trim() })
    if (error) alert(error.message); else { setComment(''); onChanged?.() }
  }

  const addUpdate = async () => {
    const text = prompt('What did you do? (short)')
    if (!text) return
    const { error } = await supabase.from('updates').insert({ project_id: p.id, text })
    if (error) alert(error.message); else onChanged?.()
  }

  return (
    <div className="card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold">{p.title}</h3>
          <p className="text-white/80 mt-1">{p.purpose}</p>
          <div className="text-xs text-white/60 mt-2">
            {p.tags?.map((t: string) => <span key={t} className="mr-2">#{t}</span>)}
          </div>
        </div>
        <a href={`/project/${p.id}`} className="btn">Open</a>
      </div>

      <div className="mt-4 flex gap-2">
        <button className="btn" onClick={() => intent('watch')}>👀 気になる</button>
        <button className="btn" onClick={() => intent('raise')}>✋ 手伝いたい</button>
        <button className="btn" onClick={() => intent('commit')}>🚀 今週やる</button>
        <button className="btn ml-auto" onClick={addUpdate}>＋ 進捗を投稿</button>
      </div>

      <div className="mt-4">
        <div className="label mb-1">コメント</div>
        <div className="flex gap-2">
          <input className="input" placeholder="一言自己紹介やアイデア" value={comment} onChange={e => setComment(e.target.value)} />
          <button className="btn" onClick={addComment}>送信</button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
        <div className="card">
          <div className="label">参加温度</div>
          <div className="mt-2">👀 {p.watch_count ?? 0} / ✋ {p.raise_count ?? 0} / 🚀 {p.commit_count ?? 0}</div>
        </div>
        <div className="card">
          <div className="label">コメント</div>
          <div className="mt-2">{p.comment_count ?? 0}</div>
        </div>
        <div className="card">
          <div className="label">進捗</div>
          <div className="mt-2">{p.update_count ?? 0}</div>
        </div>
      </div>
    </div>
  )
}
