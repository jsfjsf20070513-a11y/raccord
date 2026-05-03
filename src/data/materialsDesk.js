export const materialsLedger = [
  {
    id: 'schedule',
    section: '课程表',
    priority: '最高',
    accepted: '文字 / Excel / 截图',
    needed: '周几、时间、课程名。',
    purpose: '替换首页课表。',
  },
  {
    id: 'gallery',
    section: '相册图版',
    priority: '最高',
    accepted: '原图 / 压缩包 / 分批上传',
    needed: '日期、地点、标题、6-12 张图。',
    purpose: '替换示意图版。',
  },
  {
    id: 'resources',
    section: '课程资源',
    priority: '高',
    accepted: '链接列表 / 书单 / 网盘说明',
    needed: '分类、标题、链接或出处。',
    purpose: '补书架目录。',
  },
  {
    id: 'profile',
    section: '班级与学院信息',
    priority: '中',
    accepted: '一句话说明 / 正式称谓',
    needed: '学院全称、班级常用称呼。',
    purpose: '校正首页文字。',
  },
]

export const materialsDeliveryGuide = [
  '课表直接给文字最好；截图也可以。',
  '图片按活动分组给我即可。',
  '资源先给链接和分类即可。',
]

export const materialsUploadChecklist = [
  {
    label: '课程表最小字段',
    detail: '周几、时间段、课程名称。',
  },
  {
    label: '单次活动相册最小字段',
    detail: '日期、地点、活动标题、6 张以上图片。',
  },
  {
    label: '资源最小字段',
    detail: '分类、标题、链接或出处。',
  },
]

export const uploadPathNote =
  '图片会先整理到站内路径；外链也可先接临时版本。'
