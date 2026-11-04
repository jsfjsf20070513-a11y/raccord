import PoincarePassageField from '../fields/PoincarePassageField.jsx'
import './PoincareChapterMobile.css'

export default function PoincarePassageMobile(props) {
  return (
    <div
      className="poincare-passage-mobile"
      data-passage={`${props.from}-${props.to}`}
      aria-hidden="true"
    >
      <PoincarePassageField {...props} compact />
    </div>
  )
}
