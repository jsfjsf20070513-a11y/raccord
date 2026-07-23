import { useEffect, useState } from 'react'
import { useAuth } from '../context/useAuth'
import { useWorld } from '../context/useWorld'
import { resourceCategories } from '../data/resourceCatalog'
import PlanChantierDesktop from '../experiences/desktop/plan/PlanChantierDesktop'
import PlanChantierMobile from '../experiences/mobile/plan/PlanChantierMobile'
import useExperienceMode from '../experiences/shared/useExperienceMode'
import { normalizeResourcePayload, submitOpsSubmission } from '../lib/opsQueue'

// 资源增补 ResourceCurate — design contract: centered « Curation de ressources »
// masthead → a 4-field submit form (书架 / 标题 / 链接 / 理由) → 待审 confirmation.
// Reached from 协作 (II 资源增补). The submission goes through the real ops queue
// (submitOpsSubmission → 审核 → 并入 resourceCatalog).
const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X']
const SHELVES = resourceCategories.map((category, index) => ({
  value: category.label,
  label: `${ROMAN[index] || index + 1} · ${category.label}`,
}))
const EMPTY = { category: resourceCategories[0]?.label || '', title: '', url: '', tag: '', description: '' }

export default function ResourceCurate() {
  const { user } = useAuth()
  const { setWorld } = useWorld()
  const mode = useExperienceMode()
  const [form, setForm] = useState(EMPTY)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(null)

  useEffect(() => {
    setWorld('plan')
  }, [setWorld])

  const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }))

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    if (!user) {
      setError('推荐资源需要先登录。')
      return
    }
    setSubmitting(true)
    try {
      const next = await submitOpsSubmission('resource', normalizeResourcePayload(form), user)
      setDone({ title: next?.payload?.title || form.title || '未命名资源' })
      setForm(EMPTY)
    } catch (err) {
      setError(err?.message || '提交失败,请稍后重试。')
    } finally {
      setSubmitting(false)
    }
  }

  const again = () => {
    setDone(null)
    setError('')
    setForm(EMPTY)
  }

  const Chantier = mode === 'mobile' ? PlanChantierMobile : PlanChantierDesktop
  return (
    <Chantier
      user={user}
      form={form}
      shelves={SHELVES}
      onField={set}
      onSubmit={submit}
      submitting={submitting}
      error={error}
      done={done}
      onAgain={again}
    />
  )
}
