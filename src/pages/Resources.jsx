import { useEffect, useMemo } from 'react'
import { useWorld } from '../context/useWorld'
import { resourceCategories } from '../data/resourceCatalog'
import PlanAtlasDesktop from '../experiences/desktop/plan/PlanAtlasDesktop'
import PlanAtlasMobile from '../experiences/mobile/plan/PlanAtlasMobile'
import useExperienceMode from '../experiences/shared/useExperienceMode'
import { useResourceCatalog } from '../hooks/useResourceCatalog'

// 资源 Resources — design contract: BIBLIOTHÈQUE 报头 → 书架索引(I–VIII)→
// 八个编号书架(罗马数字 + 思源宋体架名 + 细线条目:标题外链 / 暗红 mono 标签 / 中文简介)。
// 数据单一来源 resourceCatalog(经 useResourceCatalog 并入审核通过的增补);Appendix 已删。
function buildShelfOrder(catalogItems) {
  const preferred = resourceCategories.map((category) => category.label)
  const extras = Array.from(
    new Set(
      catalogItems
        .map((item) => item.category)
        .filter((category) => category && !preferred.includes(category)),
    ),
  ).sort((a, b) => a.localeCompare(b, 'zh-CN'))

  return [...preferred, ...extras]
}

export default function Resources() {
  const { setWorld } = useWorld()
  const mode = useExperienceMode()
  const { catalogItems } = useResourceCatalog()

  useEffect(() => {
    setWorld('plan')
  }, [setWorld])

  const shelves = useMemo(() => {
    const introByCategory = new Map(
      resourceCategories.map((category) => [category.label, category.intro]),
    )

    return buildShelfOrder(catalogItems)
      .map((category) => ({
        title: category,
        intro: introByCategory.get(category) || '',
        items: catalogItems.filter((item) => item.category === category),
      }))
      .filter((shelf) => shelf.items.length)
  }, [catalogItems])

  const shelfAnchors = useMemo(
    () => Object.fromEntries(shelves.map((shelf, index) => [shelf.title, `shelf-${index + 1}`])),
    [shelves],
  )

  const Atlas = mode === 'mobile' ? PlanAtlasMobile : PlanAtlasDesktop
  return <Atlas shelves={shelves} anchors={shelfAnchors} total={catalogItems.length} />
}
