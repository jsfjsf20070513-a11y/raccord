import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader'

export default function NotFound() {
  return (
    <article className="page-column">
      <PageHeader
        kicker="404"
        title="Page not found · 页面未找到"
        summary="Like searching for a point that does not exist on the real number line. · 这就像在实数轴上寻找一个不存在的点。"
        backTo="/"
        backLabel="Back to title page · 返回扉页"
      />
      <section className="page-section">
        <p>
          The page you were looking for has no record on file, or the link has expired. ·
          你要寻找的页面暂时没有对应记录，或者链接已经失效。
        </p>
        <p>
          <Link to="/">Return home · 回到首页</Link>
        </p>
      </section>
    </article>
  )
}
