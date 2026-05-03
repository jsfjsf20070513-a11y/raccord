function trimValue(value = '') {
  return `${value}`.trim()
}

function normalizeListText(value = '') {
  return trimValue(value).replace(/[。；;]+$/u, '')
}

export function splitResourceMaterialsText(value = '') {
  return normalizeListText(value)
    .split(/[、,，]/u)
    .map((item) => item.trim())
    .filter(Boolean)
}

export function looksLikeResourceMaterials(value = '') {
  const items = splitResourceMaterialsText(value)
  if (items.length < 2) {
    return false
  }

  return items.every((item) => item.length <= 20)
}

export function getResourceLead(resource = {}) {
  return trimValue(resource.description || resource.materials)
}

export function getResourceMaterials(resource = {}) {
  const explicitMaterials = trimValue(resource.materials)
  if (explicitMaterials) {
    return splitResourceMaterialsText(explicitMaterials)
  }

  const description = trimValue(resource.description)
  if (!looksLikeResourceMaterials(description)) {
    return []
  }

  return splitResourceMaterialsText(description)
}

export function getResourceNote(resource = {}) {
  const description = trimValue(resource.description)
  if (description && !looksLikeResourceMaterials(description)) {
    return description
  }

  return ''
}

export function getResourceHeaderSummary(resource = {}) {
  const note = getResourceNote(resource)
  if (note) {
    return note
  }

  const meta = [trimValue(resource.category), trimValue(resource.tag)].filter(Boolean)
  return meta.join(' · ') || getResourceLead(resource) || '资源条目'
}
