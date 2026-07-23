import PoincarePassageField from '../../components/material/PoincarePassageField'
import './PoincareChapterDesktop.css'

export default function PoincarePassageDesktop(props) {
  return (
    <div
      className="poincare-passage-desktop"
      data-passage={`${props.from}-${props.to}`}
      aria-hidden="true"
    >
      <PoincarePassageField {...props} />
    </div>
  )
}
