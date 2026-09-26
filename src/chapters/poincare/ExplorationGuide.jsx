import './Exploration.css'

const STEPS = [
  { world: 'plan', key: 'placed', label: '改变', title: '留下两个起点', hint: '把蓝点拖到两个相隔一点的位置，松手留下记录。方向键也可以。' },
  { world: 'carnet', key: 'recalled', label: '找回', title: '找回一次过去', hint: '展开笔迹，再选一个与当前不同的旧起点。画面会回到那次选择。' },
  { world: 'limite', key: 'observed', label: '见证', title: '看见分岔的时刻', hint: '推进到红线，或看完整段轨迹。松手会暂停，也可以拖动时间。' },
]

export default function ExplorationGuide({ world, artifact, onWorld, disabled }) {
  const step = STEPS.find((item) => item.world === world)
  const count = STEPS.filter((item) => artifact.discoveries[item.key]).length
  const feedback = count === 3
    ? '三处的联系已被你发现。再换个起点，能让分岔来得更晚吗？'
    : world === 'plan' && artifact.discoveries.placed
      ? '两个不同的起点已留下。去「找回」，看看过去能否改变现在。'
      : world === 'carnet' && artifact.discoveries.recalled
        ? '你找回了一次过去。去「见证」，亲手推进它的未来。'
        : world === 'limite' && artifact.discoveries.observed
          ? '你已经看见了这次变化。其他两处，还藏着你的选择。'
          : null

  return (
    <div className="poincare-exploration">
      <nav className="poincare-discoveries" aria-label="三处探索">
        {STEPS.map((item, index) => (
          <button key={item.world} type="button" onClick={() => onWorld(item.world)}
            disabled={disabled} aria-current={world === item.world ? 'step' : undefined}
            data-complete={artifact.discoveries[item.key]}>
            <span aria-hidden="true">{artifact.discoveries[item.key] ? '✓' : `0${index + 1}`}</span>
            {item.label}<span className="sr-only">{artifact.discoveries[item.key] ? '，已发现' : '，未发现'}</span>
          </button>
        ))}
        <span className="poincare-discovery-count">发现 {count} / 3</span>
      </nav>
      <h2>{step.title}</h2>
      <p className="poincare-instruction">{step.hint}</p>
      <p className="poincare-discovery-feedback" role="status">{feedback || '\u00a0'}</p>
    </div>
  )
}
