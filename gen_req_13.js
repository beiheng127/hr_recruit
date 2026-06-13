const fs = require('fs');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, WidthType, AlignmentType, BorderStyle, TabStopPosition,
  TabStopType, PageBreak, Header, Footer, SectionType,
  TableOfContents, ShadingType, VerticalAlign
} = require('docx');

const DEST = 'C:/Users/ruia3/Desktop/大三下校内课程/软件工程实训/2. 需求分析规格说明书-13.docx';

// ─── Helper: make a bordered cell ───
function cell(text, opts = {}) {
  const { bold, shading, align, colSpan, width, fontSize } = opts;
  const children = [];
  if (text) children.push(new TextRun({ text: String(text), bold, size: fontSize || 22, font: '宋体' }));
  return new TableCell({
    children: [new Paragraph({ children, alignment: align || AlignmentType.CENTER, spacing: { before: 60, after: 60 } })],
    width: width ? { size: width, type: WidthType.PERCENTAGE } : undefined,
    columnSpan: colSpan,
    shading: shading ? { type: ShadingType.CLEAR, fill: shading } : undefined,
    verticalAlign: VerticalAlign.CENTER,
  });
}

function noBorderCell(text, opts = {}) {
  const { bold, align, fontSize } = opts;
  const children = [];
  if (text) children.push(new TextRun({ text: String(text), bold, size: fontSize || 28, font: '黑体' }));
  return new TableCell({
    children: [new Paragraph({ children, alignment: align || AlignmentType.CENTER, spacing: { before: 100, after: 100 } })],
    verticalAlign: VerticalAlign.CENTER,
  });
}

// ─── Helper: plain paragraph ───
function para(text, opts = {}) {
  const { bold, indent, heading, fontSize, spacing } = opts;
  const children = [];
  if (text) children.push(new TextRun({ text: String(text), bold, size: fontSize || 22, font: '宋体' }));
  return new Paragraph({
    children,
    heading,
    indent: indent ? { firstLine: 440 } : undefined,
    spacing: spacing || { before: 40, after: 40 },
  });
}

function heading(text, level) {
  return para(text, { bold: true, heading: HeadingLevel['HEADING_' + level], fontSize: level === 1 ? 32 : (level === 2 ? 28 : 26) });
}

// ─── Use case data ───
const useCases = [
  {
    id: 'UC01', name: '登录系统', actor: 'HR专员、部门经理、系统管理员、候选人',
    brief: '用户输入正确的账号和密码登录系统，系统验证身份后允许用户进入对应权限的功能界面。',
    pre: '用户已注册账号，系统处于运行状态。',
    post: '用户登录成功，系统记录登录日志，生成JWT Token并返回给客户端。',
    basic: [
      '用户访问系统登录页面，系统显示登录表单（账号、密码输入框及登录按钮）。',
      '用户输入正确的账号（手机号/邮箱）和密码，点击"登录"按钮。',
      '系统验证账号密码，验证通过后生成JWT Token。',
      '系统跳转到系统首页（Dashboard），根据角色加载不同的功能菜单。',
      '系统在顶部导航栏显示当前用户名，侧边栏加载对应角色的功能模块。'
    ],
    alt: [
      '2a. 用户输入错误的密码：系统提示"账号或密码错误，请重新输入"，保留账号输入框内容，清空密码框，用户可重新输入。',
      '2b. 用户输入的账号不存在：系统提示"该账号未注册，请联系管理员"。',
      '3a. 连续5次密码错误：系统锁定账号30分钟，提示"账号已被临时锁定，请30分钟后重试"。',
      '2c. 用户不输入账号或密码直接点击登录：系统提示"请输入账号和密码"，焦点定位到第一个空白输入框。'
    ]
  },
  {
    id: 'UC02', name: '退出登录', actor: '所有已登录用户',
    brief: '用户点击退出登录按钮，系统清除当前会话信息，返回登录页面。',
    pre: '用户已登录系统。',
    post: '用户会话被清除，JWT Token失效，页面跳转至登录页。',
    basic: [
      '用户在系统右上角用户菜单中点击"退出登录"按钮。',
      '系统弹出确认对话框："确定要退出登录吗？"。',
      '用户点击"确定"，系统清除前端存储的JWT Token和用户信息。',
      '系统跳转至登录页面，显示"您已安全退出"的提示信息。'
    ],
    alt: [
      '2a. 用户点击"取消"：系统关闭确认对话框，用户保持在当前页面。',
      '3a. Token已在服务端过期：系统仍允许正常退出，清除本地数据后跳转登录页。'
    ]
  },
  {
    id: 'UC03', name: '新建招聘岗位', actor: 'HR专员',
    brief: 'HR专员在岗位管理模块中创建新的招聘岗位，填写岗位名称、所属部门、招聘人数、薪资范围、岗位要求等基本信息，系统保存岗位记录。',
    pre: 'HR专员已登录系统，拥有岗位管理权限。',
    post: '岗位记录创建成功，状态为"草稿"，可在岗位列表中查看。',
    basic: [
      'HR专员点击"岗位管理"→"新建岗位"按钮，系统显示岗位信息填写表单。',
      'HR专员填写岗位名称、所属部门、招聘人数、薪资范围、工作地点、学历要求等必填字段。',
      'HR专员在富文本编辑器中详细描述岗位职责和任职要求。',
      'HR专员点击"保存草稿"，系统校验表单数据完整性。',
      '校验通过后系统创建岗位记录，状态为"草稿"，在岗位列表中新增一条记录。'
    ],
    alt: [
      '4a. 必填字段为空：系统高亮显示未填写的必填字段，提示"请填写必填项"。',
      '4b. 岗位名称重复：系统提示"该岗位名称已存在，请更换名称或添加后缀区分"。',
      '4c. 薪资范围不合理：系统提示"最低薪资不能大于最高薪资"。'
    ]
  },
  {
    id: 'UC04', name: '发布招聘岗位', actor: 'HR专员',
    brief: 'HR专员将草稿状态的岗位正式发布，对外可见，候选人可以投递该岗位。',
    pre: '岗位存在且状态为"草稿"或"已关闭"。',
    post: '岗位状态变为"已发布"，可在招聘门户展示，候选人可投递。',
    basic: [
      'HR专员在岗位列表中找到状态为"草稿"的岗位，点击"发布"按钮。',
      '系统弹出确认对话框："确定要发布该岗位吗？发布后不可修改岗位名称和部门。"',
      'HR专员点击"确定"，系统将岗位状态更新为"已发布"。',
      '系统记录发布时间，并在岗位列表中更新状态显示为"已发布"（绿色标签）。'
    ],
    alt: [
      '2a. 岗位信息不完整（缺少JD描述等）：系统提示"岗位信息不完整，请先完善岗位JD描述后再发布"。',
      '3a. 发布操作失败（网络异常）：系统提示"发布失败，请稍后重试"，岗位状态保持不变。'
    ]
  },
  {
    id: 'UC05', name: '关闭招聘岗位', actor: 'HR专员',
    brief: 'HR专员将已发布岗位关闭，停止接收新的候选人投递。',
    pre: '岗位存在且状态为"已发布"。',
    post: '岗位状态变为"已关闭"，不再接受投递，已投递的候选人流程不受影响。',
    basic: [
      'HR专员在岗位列表中找到状态为"已发布"的岗位，点击"关闭"按钮。',
      '系统弹出确认对话框："关闭后岗位将不再接受新的投递。已投递的候选人流程不受影响。确定要关闭吗？"',
      'HR专员点击"确定"，系统将岗位状态更新为"已关闭"。',
      '系统记录关闭时间，岗位列表状态显示为"已关闭"（灰色标签）。'
    ],
    alt: [
      '2a. 岗位下有面试进行中的候选人：系统提示"该岗位下有N个候选人正在进行面试，建议等待面试流程结束后再关闭"。HR可选择"仍要关闭"或"取消"。',
      '3a. 关闭操作失败：系统提示"操作失败，请稍后重试"。'
    ]
  },
  {
    id: 'UC06', name: '查询招聘岗位', actor: 'HR专员、部门经理',
    brief: '用户根据岗位状态、所属部门、岗位名称关键词等条件筛选和搜索招聘岗位列表。',
    pre: '用户已登录系统。',
    post: '系统返回符合条件的岗位列表，支持分页展示。',
    basic: [
      '用户进入"岗位管理"页面，系统默认按创建时间倒序显示所有岗位。',
      '用户在筛选栏选择状态（全部/草稿/已发布/已关闭）、部门等条件。',
      '用户在搜索框中输入岗位名称关键词（如"Java"），点击搜索或按回车。',
      '系统执行MySQL全文搜索+条件过滤，返回匹配的岗位列表。',
      '列表展示岗位名称、部门、状态、招聘人数、发布时间等信息，支持分页浏览。'
    ],
    alt: [
      '3a. 搜索结果为空：系统显示"未找到匹配的岗位，请尝试其他关键词"。',
      '3b. 用户输入特殊字符（如SQL注入）：系统进行参数校验，过滤危险字符，防止SQL注入。',
      '2a. 筛选条件无匹配：显示空结果并提示"当前筛选条件下无岗位记录"。'
    ]
  },
  {
    id: 'UC07', name: '编辑招聘岗位', actor: 'HR专员',
    brief: 'HR专员修改已存在岗位的部分信息（如岗位描述、薪资范围、招聘人数等）并保存更新。',
    pre: '岗位存在且状态为"草稿"或"已关闭"；已发布的岗位仅允许修改非核心字段。',
    post: '岗位信息更新保存成功，操作记录写入操作日志。',
    basic: [
      'HR专员在岗位列表中点击某个岗位的"编辑"按钮。',
      '系统加载岗位详细信息并显示编辑表单，各字段预填当前值。',
      'HR专员修改需要更新的字段内容（如调整薪资范围、修改JD描述等）。',
      'HR专员点击"保存"，系统校验修改后的数据合法性。',
      '校验通过后系统更新数据库记录，并记录操作日志（谁、何时、改了哪个岗位）。'
    ],
    alt: [
      '3a. 已发布岗位修改核心字段（岗位名称/部门）：系统提示"已发布岗位不允许修改岗位名称和部门，如需修改请先关闭岗位"。允许修改薪资、JD等非核心字段。',
      '4a. 表单校验不通过：系统高亮错误字段并提示具体错误信息。',
      '5a. 保存时发生并发冲突（其他HR同时编辑）：系统提示"该岗位信息已被他人修改，请刷新后重试"。'
    ]
  },
  {
    id: 'UC08', name: '上传并解析简历', actor: 'HR专员',
    brief: 'HR专员选择简历文件（Word/PDF/图片格式）上传到系统，系统保存原始文件并调用AI解析提取结构化信息。',
    pre: 'HR专员已登录系统。',
    post: '简历文件保存成功，结构化信息（姓名、学历、工作经历等）提取并回填到简历记录。',
    basic: [
      'HR专员进入"简历管理"页面，点击"上传简历"按钮。',
      '系统弹出文件选择对话框，支持选择Word(.docx)、PDF、图片格式文件。',
      'HR专员选择一个或多个简历文件，点击"开始上传"。',
      '系统接收文件，保存到文件服务器（uploads/resume/目录），创建ResumeFile和ResumeInfo数据库记录。',
      '系统调用AI进行简历解析，提取关键结构化信息（姓名、手机号、邮箱、学历、工作经历等）。',
      '解析完成后，系统回填ResumeInfo表的对应字段，简历列表刷新显示解析状态。'
    ],
    alt: [
      '3a. 上传文件格式不支持：系统提示"仅支持Word(.docx)、PDF和图片格式的简历文件"。',
      '3b. 文件大小超过10MB：系统提示"文件大小不能超过10MB"。',
      '5a. AI解析失败（文件内容无法识别）：系统标记为"解析失败"，提示"该简历暂不支持自动解析，请手动填写信息"。',
      '5b. 上传过程中网络中断：系统提示"上传失败，请检查网络连接后重试"，未保存的文件不创建记录。'
    ]
  },
  {
    id: 'UC09', name: '查询简历列表', actor: 'HR专员、部门经理',
    brief: '用户通过各种条件（关键词、学历、工作年限、人才库状态、投递状态等）筛选和搜索简历。',
    pre: '用户已登录系统，拥有简历查看权限。',
    post: '系统返回符合条件的简历列表，支持分页和排序。',
    basic: [
      '用户进入"简历管理"页面，系统默认按创建时间倒序显示所有简历。',
      '用户在搜索框中输入关键词（姓名、手机号、技术关键词），系统执行全文搜索。',
      '用户在筛选栏选择学历、工作年限范围、人才库状态等筛选条件。',
      '系统组合搜索和筛选条件，查询数据库并返回匹配的简历列表。',
      '列表展示简历基本信息：姓名、手机号、学历、工作年限、匹配岗位数、人才库状态等。'
    ],
    alt: [
      '2a. 全文搜索无结果：系统提示"未找到匹配的简历，请尝试其他关键词"。',
      '3a. 筛选条件组合无结果：系统提示"当前筛选条件下无符合条件的简历"。',
      '4a. 查询超时：系统提示"查询超时，请缩小查询范围后重试"。'
    ]
  },
  {
    id: 'UC10', name: '查看简历详情', actor: 'HR专员、部门经理',
    brief: '用户点击某份简历查看详细信息，包括AI解析后的结构化数据、原文件预览、投递记录和时间线。',
    pre: '简历记录存在。',
    post: '系统展示完整的简历详情页面，包括所有结构化字段和相关记录。',
    basic: [
      '用户在简历列表中点击某份简历的"查看"按钮或简历名称。',
      '系统加载简历详情页，展示基本信息（姓名、性别、年龄、手机号、邮箱等）。',
      '页面下方展示教育经历列表（学校、专业、学历、起止时间）。',
      '再下方展示工作经历列表（公司、职位、工作描述、起止时间）。',
      '最下方展示该候选人的投递记录时间线（何时投递了哪个岗位，当前所处阶段）。',
      '右侧提供原始简历文件在线预览功能。'
    ],
    alt: [
      '2a. 简历解析状态为"未解析"：详情页显示"该简历尚未解析，部分信息暂不可用"，HR可手动触发解析。',
      '4a. 工作经历的某条记录不完整：标注"信息缺失"，但正常展示已有内容。',
      '6a. 原始文件预览失败：显示"文件预览暂时不可用"，但不影响其他信息展示。'
    ]
  },
  {
    id: 'UC11', name: '候选人投递岗位', actor: 'HR专员（代为投递）、候选人',
    brief: 'HR专员将候选人的简历与某个招聘岗位关联，创建投递记录，候选人进入该岗位的招聘流程。',
    pre: '简历和岗位记录均存在。',
    post: '投递记录创建成功（applicant_job表），候选人进入该岗位的初始阶段（初筛）。',
    basic: [
      'HR专员在简历详情页点击"投递岗位"按钮。',
      '系统弹出岗位选择对话框，显示当前所有"已发布"状态的岗位列表，支持搜索过滤。',
      'HR专员选择一个或多个目标岗位，点击"确认投递"。',
      '系统为每个岗位创建一条投递记录，设置初始阶段为"初筛"。',
      '系统在候选人时间线中添加投递事件，简历列表中更新"投递岗位数"。'
    ],
    alt: [
      '2a. 无"已发布"状态的岗位：对话框提示"当前没有可投递的岗位，请先发布岗位"。',
      '3a. 候选人已投递过该岗位：系统提示"该候选人已投递过此岗位，请勿重复投递"。',
      '4a. 投递操作失败：系统提示"投递失败，请稍后重试"。'
    ]
  },
  {
    id: 'UC12', name: '安排面试', actor: 'HR专员',
    brief: 'HR专员为通过初筛的候选人安排面试，指定面试官、面试时间和地点，系统创建面试安排并发送通知。',
    pre: '候选人已投递岗位且通过了初筛阶段。',
    post: '面试安排创建成功，面试官和候选人收到通知。',
    basic: [
      'HR专员在招聘管道看板中将候选人从"初筛"阶段拖拽至"面试"阶段，或在简历详情页点击"安排面试"。',
      '系统弹出面试安排表单，需填写：面试时间、面试形式（现场/视频）、面试地点、面试官（可多选）。',
      'HR专员从面试官列表中选择1~3位面试官（从部门经理和HR中选择）。',
      'HR专员设置面试时长（默认45分钟）和面试通知方式（邮件/短信/站内信）。',
      'HR专员点击"确认安排"，系统创建面试记录并发送通知给所有面试官和候选人。'
    ],
    alt: [
      '2a. 面试时间与已有面试冲突（面试官已被占用）：系统提示"该时间段面试官XXX已有安排，请重新选择时间"。',
      '3a. HR专员未选择任何面试官：系统提示"请至少选择一位面试官"。',
      '5a. 通知发送失败（邮件服务不可用）：系统仍创建面试安排，但提示"通知发送失败，请手动通知相关人员"。'
    ]
  },
  {
    id: 'UC13', name: '填写面试评价', actor: '面试官（部门经理）',
    brief: '面试结束后，面试官登录系统为候选人填写面试评价，包括各项能力评分和综合评价。',
    pre: '面试已安排且面试时间已过（或标记为已完成），面试官已登录。',
    post: '面试评价保存成功，候选人该轮面试状态更新为"已评价"。',
    basic: [
      '面试官在"我的面试"页面看到待评价的面试记录，点击"填写评价"。',
      '系统显示评价表单，包含：专业能力评分（1-5分）、沟通能力评分（1-5分）、团队协作评分（1-5分）、综合评价（文本）。',
      '面试官填写各项评分，输入综合评价文字（建议、是否推荐进入下一轮等）。',
      '面试官可选择"通过"或"不通过"作为本轮面试结论。',
      '面试官点击"提交评价"，系统保存评价记录并更新面试状态。'
    ],
    alt: [
      '3a. 面试官未填写综合评价且点击提交：系统提示"请填写综合评价"，综合评价为必填项。',
      '4a. 面试官未选择通过/不通过：系统提示"请选择本轮面试结论"。',
      '5a. 提交时网络异常：系统提示"提交失败，请检查网络后重试"，保留已填写内容。'
    ]
  },
  {
    id: 'UC14', name: 'AI生成面试评价摘要', actor: 'HR专员',
    brief: 'HR专员在多轮面试完成后，触发AI对候选人所有面试评价进行汇总分析，生成综合评价摘要。',
    pre: '候选人至少完成了一轮面试，且已有面试评价记录。',
    post: 'AI生成的面试评价摘要保存至面试记录，HR可在候选人详情页查看。',
    basic: [
      'HR专员在候选人详情页面的"面试评价"区域点击"AI生成摘要"按钮。',
      '系统收集该候选人所有轮次的面试评价内容（评分+文本评价）作为AI输入。',
      '系统调用DeepSeek API，将评价内容发送给AI模型进行分析。',
      'AI返回综合性摘要，包括：候选人优势、待改进项、综合推荐等级（强烈推荐/推荐/保留/不推荐）。',
      '系统将AI生成的摘要保存至数据库，并在页面上显示摘要内容。'
    ],
    alt: [
      '2a. 候选人没有任何面试评价：系统提示"该候选人暂无面试评价记录，无法生成摘要"。',
      '3a. AI服务调用失败（API超时或配额耗尽）：系统提示"AI服务暂时不可用，请稍后重试"。',
      '3b. AI返回内容为空：系统提示"AI未能生成有效摘要，请检查评价内容是否完整"。'
    ]
  },
  {
    id: 'UC15', name: '发送录用通知（Offer）', actor: 'HR专员',
    brief: 'HR专员为通过全部面试的候选人创建并发送录用通知，包含薪资、入职时间、岗位等关键信息。',
    pre: '候选人所有轮次面试均已通过，状态为"待发Offer"。',
    post: 'Offer记录创建成功，候选人收到录用通知（邮件/站内信），状态更新为"已发Offer"。',
    basic: [
      'HR专员在招聘管道看板中将候选人从最后一个面试阶段拖拽至"Offer"阶段，或点击"发送Offer"。',
      '系统弹出Offer信息填写表单：薪资、试用期薪资、入职日期、试用期时长、直属上级、工作地点、福利待遇等。',
      'HR专员填写完整信息后，可选择使用通知模板或手动编写邮件内容。',
      'HR专员点击"发送Offer"，系统创建Offer记录并生成邮件（包含Offer详细信息）。',
      '系统通过邮件和站内信通知候选人，候选人状态更新为"已发Offer"。'
    ],
    alt: [
      '3a. 必填字段（薪资、入职日期）为空：系统提示"请填写薪资和入职日期等必填信息"。',
      '3b. 入职日期设置在过去：系统提示"入职日期不能早于当前日期"。',
      '5a. 邮件发送失败：系统提示"邮件发送失败，请手动通知候选人"，Offer记录正常保存。'
    ]
  },
  {
    id: 'UC16', name: '确认入职', actor: 'HR专员',
    brief: 'HR专员确认候选人已到岗入职，系统将候选人状态更新为"已入职"，并自动创建员工档案。',
    pre: '候选人已接受Offer且到达入职日期。',
    post: '候选人状态更新为"已入职"，员工档案自动创建，候选人信息迁移至员工模块。',
    basic: [
      'HR专员在"Offer管理"页面找到"已接受Offer"状态且入职日期已到的记录，点击"确认入职"。',
      '系统弹出确认对话框，显示待确认信息：姓名、岗位、部门、入职日期、薪资等。',
      'HR专员确认无误后点击"确认"，系统将候选人状态改为"已入职"。',
      '系统自动创建员工档案（employee_archive表），将候选人基本信息迁移为员工信息。',
      '系统记录入职操作日志，关闭该候选人的所有其他投递流程（如有多岗位投递）。'
    ],
    alt: [
      '2a. 确认前候选人实际未到岗：HR取消操作，标记为"未按时入职"，系统提示"请与候选人确认后重新操作"。',
      '3b. 系统创建员工档案时发生数据库错误：系统回滚操作，提示"入职确认失败，请稍后重试"。'
    ]
  },
  {
    id: 'UC17', name: 'AI生成岗位JD', actor: 'HR专员',
    brief: 'HR专员输入岗位的基本信息（名称、部门、核心要求），AI自动生成专业、规范的招聘职位描述（JD）。',
    pre: 'HR专员已登录，DeepSeek AI服务可用。',
    post: '生成的JD文本返回，HR可复制到岗位编辑表单中。',
    basic: [
      'HR专员在"AI中心"页面点击"AI生成JD"，进入JD生成界面。',
      'HR专员填写岗位名称、所属部门、核心要求关键词（如"3年Java开发经验，熟悉Spring Boot"）。',
      'HR专员点击"生成"，系统将参数拼接到提示词模板中，发送给DeepSeek API。',
      'AI返回专业JD文本，包含：岗位职责、任职要求、我们提供（福利待遇）三部分。',
      'HR专员可对生成的JD文本进行编辑修改，确认后可"应用到岗位"或"复制到剪贴板"。'
    ],
    alt: [
      '2a. 输入信息为空或过于简短（少于10个字）：系统提示"请提供更详细的岗位信息以获得更好的生成效果"。',
      '3a. AI返回内容不符合预期（无结构化格式）：系统提示"生成结果不够理想，建议调整关键词后重试"。',
      '3b. API调用超时：系统提示"AI服务响应超时，请稍后重试"。'
    ]
  },
  {
    id: 'UC18', name: 'AI候选人-岗位匹配评分', actor: 'HR专员',
    brief: 'HR专员选择一份简历和一个岗位，系统调用AI进行语义级别的匹配分析，计算匹配度评分并给出分析理由。',
    pre: '简历和岗位记录均存在，简历已通过AI解析含有结构化数据。',
    post: '匹配评分和分析结果保存到ai_match_record表，HR可在简历列表和岗位管理中查看。',
    basic: [
      'HR专员在简历详情页或岗位详情页点击"AI匹配评分"按钮。',
      '如果从简历页进入，弹出岗位选择对话框；如果从岗位页进入，弹出简历选择对话框。',
      'HR专员选择目标对象后点击"开始匹配"，系统将简历信息和岗位要求发送给AI。',
      'AI返回匹配结果，包括：综合匹配度百分比、技能匹配情况、经验匹配情况、综合评语。',
      '系统保存匹配记录，并在页面上以雷达图+文字形式展示分析结果。'
    ],
    alt: [
      '3a. 简历未解析（结构化数据为空）：系统提示"该简历尚未解析，请先解析简历后再进行匹配评分"，并提供"先解析"按钮。',
      '3b. 岗位JD描述为空：系统提示"该岗位尚未填写JD描述，匹配评分结果可能不够准确"。',
      '4a. AI服务不可用：系统提示"AI匹配服务暂时不可用，请稍后重试"。'
    ]
  },
  {
    id: 'UC19', name: '查看招聘数据大屏', actor: 'HR专员、部门经理、系统管理员',
    brief: '用户打开实时数据大屏，以可视化图表形式查看招聘核心指标和趋势。',
    pre: '用户已登录系统。',
    post: '数据大屏展示，图表数据实时更新。',
    basic: [
      '用户点击导航栏的"数据大屏"，系统全屏展示数据仪表盘。',
      '页面顶部显示核心指标卡片：在招岗位数、本月简历数、面试进行中数、本月入职人数。',
      '左侧展示部门招聘分布饼图、岗位类型分布柱状图。',
      '中间展示近6个月简历投递趋势折线图。',
      '右侧展示各招聘渠道来源占比饼图和招聘漏斗（投递→初筛→面试→Offer→入职）转化率。',
      '底部表格滚动展示最近收到的简历和最新面试安排。',
      '系统每30秒通过WebSocket自动刷新数据，无须手动刷新页面。'
    ],
    alt: [
      '1a. WebSocket连接失败：系统降级为每60秒HTTP轮询获取数据，页面右上角显示"实时连接已断开"提示。',
      '3a. 某项数据为空（如本月无线下面试）：对应图表显示"暂无数据"。',
      '6a. 大屏长时间无操作：可选是否开启自动轮播模式（每10秒切换展示区域）。'
    ]
  },
  {
    id: 'UC20', name: '管理招聘流程管道', actor: 'HR专员',
    brief: 'HR专员在可视化看板（Kanban Board）上通过拖拽操作，将候选人卡片从当前阶段移动到后续阶段，实现招聘流程的可视化管理。',
    pre: '候选人已投递岗位，招聘流程管道已配置。',
    post: '候选人阶段更新，触发对应的通知和状态变更。',
    basic: [
      'HR专员进入"招聘管道"页面，系统以看板形式展示各阶段的候选人卡片。',
      '看板列按流程阶段排列：初筛→面试→二面→Offer→入职，每列显示该阶段的候选人卡片。',
      '每个卡片显示候选人姓名、简历摘要、当前停留时长（超过3天高亮提醒）。',
      'HR专员将候选人卡片从一个阶段列拖拽到下一个阶段列。',
      '系统自动更新候选人阶段状态，记录阶段变更时间，触发对应通知（如进入面试阶段通知面试官）。',
      '候选人时间线中新增一条阶段变更记录。'
    ],
    alt: [
      '4a. 拖拽操作违反流程顺序（跳过必要阶段）：系统提示"请按流程顺序操作，当前不可跳过XX阶段"。',
      '4b. 候选人已在目标阶段：系统提示"该候选人已在目标阶段，无需重复操作"。',
      '5a. 网络断开导致拖拽失败：卡片回弹到原始位置，系统提示"操作失败，请检查网络后重试"。'
    ]
  },
  {
    id: 'UC21', name: '管理通知模板', actor: 'HR专员',
    brief: 'HR专员创建、编辑和管理各类通知模板（面试通知、Offer通知、拒绝通知等），模板支持变量替换。',
    pre: 'HR专员已登录系统。',
    post: '通知模板保存成功，后续发送通知时可选择对应模板。',
    basic: [
      'HR专员进入"系统管理"→"通知模板"页面，系统显示已有的通知模板列表。',
      'HR专员点击"新建模板"，进入模板编辑页面。',
      'HR专员填写模板名称、模板类型（面试通知/Offer通知/拒绝通知/自定义）、邮件标题。',
      'HR专员在富文本编辑器中编写模板正文，可使用变量占位符（如"{{候选人姓名}}"、"{{岗位名称}}"、"{{面试时间}}"等）。',
      'HR专员点击"保存"，系统校验模板内容后保存到数据库。'
    ],
    alt: [
      '4a. 模板标题为空：系统提示"请输入模板标题"。',
      '4b. 模板正文包含未定义的变量：系统提示"变量{{XXX}}不在支持的变量列表中，请检查"，并列出可用变量。',
      '5a. 同名模板已存在：系统提示"该名称的模板已存在，请使用不同的名称"。'
    ]
  },
  {
    id: 'UC22', name: '查看操作日志', actor: '系统管理员',
    brief: '系统管理员查看系统中所有用户的操作日志，包括操作人、时间、操作类型、操作对象、操作详情和IP地址。',
    pre: '系统管理员已登录，拥有操作日志查看权限。',
    post: '系统按条件显示操作日志列表，支持搜索和导出。',
    basic: [
      '系统管理员进入"系统管理"→"操作日志"页面，系统默认按时间倒序显示最近的操作日志。',
      '每条日志展示：操作人姓名、操作时间、操作类型（新增/修改/删除/登录/登出）、操作对象（模块名）、操作详情（如"发布岗位[高级Java工程师]"）、IP地址。',
      '系统管理员可按操作类型、操作人、时间范围筛选日志记录。',
      '系统管理员可在搜索框中输入关键词（如岗位名称、操作人姓名）进行搜索。'
    ],
    alt: [
      '2a. 日志记录过多（查询结果超过10万条）：系统自动限制为最近1万条，并提示"显示最近10000条日志，如需查看更早记录请缩小时间范围"。',
      '3a. 筛选条件无匹配日志：系统提示"未找到匹配的操作日志记录"。'
    ]
  }
];

// ─── Build the document ───
async function main() {
  const sections = [];

  // Helper: Full-width table
  function fullTable(rows, colWidths) {
    return new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: rows.map((row, ri) =>
        new TableRow({
          children: row.map((c, ci) => cell(c, {
            width: colWidths ? colWidths[ci] : undefined,
            bold: ri === 0,
            shading: ri === 0 ? 'BDD7EE' : undefined
          }))
        })
      ),
      borders: {
        top: { style: BorderStyle.SINGLE, size: 1 },
        bottom: { style: BorderStyle.SINGLE, size: 1 },
        left: { style: BorderStyle.SINGLE, size: 1 },
        right: { style: BorderStyle.SINGLE, size: 1 },
        insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
        insideVertical: { style: BorderStyle.SINGLE, size: 1 },
      }
    });
  }

  // ── Section 1: Cover page ──
  const coverChildren = [
    para(''),
    para(''),
    para(''),
    new Table({
      width: { size: 80, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({ children: [noBorderCell('山东理工大学 ∙ 计算机科学与技术学院', { fontSize: 32 })] }),
        new TableRow({ children: [noBorderCell('[需求规格说明书]', { bold: true, fontSize: 36 })] }),
        new TableRow({ children: [noBorderCell('[人力资源招聘管理系统]', { bold: true, fontSize: 34 })] }),
      ],
      columnWidths: [100],
    }),
    para(''),
    para(''),
    para('组     号：第13组', { fontSize: 24 }),
    para('日     期：2026年6月', { fontSize: 24 }),
    para('版本  号：V1.0', { fontSize: 24 }),
  ];

  sections.push({
    properties: { type: SectionType.NEXT_PAGE },
    children: coverChildren,
  });

  // ── Section 2: Scoring + Grade + TOC ──
  const scoringTable = fullTable([
    ['评分任务', '分值', '评分项', '说明'],
    ['小组任务', '7', '用例图', '参与者正确完整'],
    ['小组任务', '7', '用例图', '无遗漏需求'],
    ['小组任务', '7', '用例图', '非功能性需求定义合理'],
    ['小组任务', '7', '用例图', '用例名称能够表示用例功能'],
    ['小组任务', '7', '用例图', '用例模型规范'],
    ['小组任务', '7', '用例图', '用例编号规范'],
    ['个人任务', '8', '用例规约描述', '项目完整'],
    ['个人任务', '8', '用例规约描述', '流程描述正确'],
    ['个人任务', '8', '用例规约描述', '主流程与扩展流程清晰'],
    ['个人任务', '8', '用例规约描述', '必须信息明确'],
  ], [15, 10, 30, 45]);

  const gradeTable = fullTable([
    ['姓名', '个人任务分工', '个人任务成绩', '小组任务成绩', '需求分析阶段得分'],
    ['李亚恒', 'UC01登录系统\nUC02退出登录', '', '', ''],
    ['', 'UC03新建岗位\nUC04发布岗位', '', '', ''],
    ['', 'UC05关闭岗位\nUC06查询岗位', '', '', ''],
    ['', 'UC07编辑岗位\nUC08上传简历', '', '', ''],
    ['', 'UC09查询简历\nUC10查看简历详情', '', '', ''],
    ['', 'UC11投递岗位\nUC12安排面试', '', '', ''],
    ['', 'UC13填写面试评价\nUC14 AI生成摘要', '', '', ''],
    ['', 'UC15发送Offer\nUC16确认入职', '', '', ''],
    ['', 'UC17 AI生成JD\nUC18 AI匹配评分', '', '', ''],
    ['', 'UC19数据大屏\nUC20管理招聘管道', '', '', ''],
    ['', 'UC21管理通知模板\nUC22查看操作日志', '', '', ''],
  ], [12, 28, 20, 20, 20]);

  sections.push({
    properties: { type: SectionType.NEXT_PAGE },
    children: [
      heading('评分标准', 1),
      scoringTable,
      para(''),
      heading('成绩评价', 1),
      gradeTable,
      para(''),
      heading('目  录', 1),
      new TableOfContents('目录', { hyperlink: true, headingStyleRange: '1-3' }),
    ],
  });

  // ── Section 3: Chapter 1 ──
  const ch1children = [
    heading('1 需求概述', 1),

    heading('1.1 文档目的', 2),
    para('本文档描述了人力资源招聘管理系统的用户需求，明确了系统的功能和非功能性需求，作为后续系统设计、开发和测试的依据。', { indent: true }),
    para('主要目标包括：明确系统必须实现的全部功能；定义各功能的用例模型（用例图及用例规约）；为系统测试提供需求基准。', { indent: true }),

    heading('1.2 读者对象', 2),
    para('本文档的读者范围包括：', { indent: true }),
    para('1. 需求分析人员——用于确认需求完整性'),
    para('2. 设计人员——用于指导系统架构和数据库设计'),
    para('3. 开发人员——用于理解功能需求并实现代码'),
    para('4. 项目管理人员——用于跟踪项目进度和需求变更'),
    para('5. 测试人员——用于编写测试用例和验证系统功能'),

    heading('1.3 参考文档', 2),
    para('[1] 《软件工程综合实训任务书》，山东理工大学计算机科学与技术学院。'),
    para('[2] 《分组选题表-第13组》，山东理工大学计算机科学与技术学院。'),
    para('[3] 《人力资源招聘管理系统实训计划书V2.0》，第13组。'),
    para('[4] 《Spring Boot官方文档》，https://spring.io/projects/spring-boot。'),
    para('[5] 《MySQL 8.0 Reference Manual - Full-Text Search Functions》，Oracle Corporation。'),

    heading('1.4 原始功能需求', 2),
    para('本系统为AI驱动的人力资源招聘管理平台，原始功能需求源自《分组选题表》的基本功能描述，经团队扩展后形成以下功能模块：', { indent: true }),
    para('基础功能模块（6个）：', { bold: true }),
    para('1. 招聘岗位管理模块——岗位的创建、编辑、发布、关闭、查询，支持按部门/状态/关键词筛选搜索。'),
    para('2. 简历管理模块——简历上传、AI解析、简历列表查询、简历详情查看、候选人投递岗位。'),
    para('3. 面试管理模块——面试安排（含面试官分配）、面试评价填写、面试记录查询。'),
    para('4. 录用入职模块——Offer发送、入职确认、员工档案自动创建。'),
    para('5. 报表统计模块——招聘数据大屏（看板），实时展示核心指标和趋势图表。'),
    para('6. 系统管理模块——用户登录/登出、权限控制、操作日志记录与查看。'),
    para('差异化创新功能（14项）：', { bold: true }),
    para('1. 候选人-岗位智能匹配评分  2. AI生成岗位JD  3. AI生成面试题  4. 面试评价AI摘要  5. 招聘管道看板（拖拽）  6. 实时数据大屏  7. 邮件/通知模板系统  8. 候选人时间线（可配置流程）  9. 多轮面试+面试委员会  10. 人才储备库/黑名单  11. 文件在线预览  12. WebSocket实时通知  13. MySQL全文搜索  14. AOP操作日志'),

    heading('1.5 非功能性需求', 2),
    para('1. 安全性：用户密码采用BCrypt加密存储；JWT Token有效期24小时，支持刷新；操作日志完整记录，包含操作人、时间、操作类型、IP地址；防止SQL注入和XSS攻击。', { indent: true }),
    para('2. 性能：系统核心接口响应时间不超过3秒；支持同时在线用户数不少于50人；数据库查询在合理索引下不超过1秒；MySQL全文搜索支持百万级简历数据的高效检索。', { indent: true }),
    para('3. 可用性：系统可用性达到99%；关键操作有确认提示；错误信息友好可读，不暴露技术细节（如SQL错误堆栈）；界面采用Element Plus组件库，风格统一美观。', { indent: true }),
    para('4. 兼容性：前端兼容Chrome 100+、Edge 100+浏览器；后端基于Spring Boot 3.2，兼容Java 17+；数据库MySQL 8.0+。', { indent: true }),
    para('5. 可维护性：采用前后端分离架构，RESTful API设计规范；关键业务逻辑有AOP日志记录；数据库迁移用Flyway管理，版本可追溯。', { indent: true }),

    new Paragraph({ children: [new PageBreak()] }),

    // ── Chapter 2 ──
    heading('2 用例模型', 1),

    heading('2.1 用例列表', 2),
    para('系统用例如表2-1所示。', { indent: true }),
    para('表2-1 系统用例列表', { alignment: AlignmentType.CENTER, bold: true }),
  ];

  // Actor-Use Case table (Table 3)
  const actorRows = [
    ['参与者', '用例', '用例简介'],
    ['HR专员', 'UC03 新建招聘岗位', '创建新的招聘岗位记录'],
    ['HR专员', 'UC04 发布招聘岗位', '将草稿岗位对外发布'],
    ['HR专员', 'UC05 关闭招聘岗位', '停止岗位接收投递'],
    ['HR专员/部门经理', 'UC06 查询招聘岗位', '按条件搜索岗位列表'],
    ['HR专员', 'UC07 编辑招聘岗位', '修改已存在岗位的信息'],
    ['HR专员', 'UC08 上传并解析简历', '上传简历文件并AI解析'],
    ['HR专员/部门经理', 'UC09 查询简历列表', '按条件搜索简历'],
    ['HR专员/部门经理', 'UC10 查看简历详情', '查看简历完整信息和时间线'],
    ['HR专员/候选人', 'UC11 候选人投递岗位', '建立简历与岗位的关联'],
    ['HR专员', 'UC12 安排面试', '指定面试官、时间、地点'],
    ['面试官', 'UC13 填写面试评价', '打分并填写评价内容'],
    ['HR专员', 'UC14 AI生成面试评价摘要', 'AI汇总多轮面试评价'],
    ['HR专员', 'UC15 发送录用通知（Offer）', '生成并发送Offer'],
    ['HR专员', 'UC16 确认入职', '确认入职并创建员工档案'],
    ['HR专员', 'UC17 AI生成岗位JD', 'AI自动生成专业职位描述'],
    ['HR专员', 'UC18 AI候选人-岗位匹配评分', 'AI计算简历与岗位的匹配度'],
    ['HR专员/部门经理', 'UC19 查看招聘数据大屏', '实时可视化招聘数据'],
    ['HR专员', 'UC20 管理招聘流程管道', '看板拖拽管理候选人阶段'],
    ['HR专员', 'UC21 管理通知模板', '创建和编辑邮件/通知模板'],
    ['所有用户', 'UC01 登录系统', '身份验证登录'],
    ['所有用户', 'UC02 退出登录', '安全退出系统'],
    ['系统管理员', 'UC22 查看操作日志', '查看系统操作日志记录'],
  ];

  ch1children.push(fullTable(actorRows, [15, 40, 45]));

  ch1children.push(para(''));

  ch1children.push(heading('2.2 用例图', 2));
  ch1children.push(para('系统的用例图如图2-1所示。'));
  ch1children.push(para('请贴图', { alignment: AlignmentType.CENTER }));
  ch1children.push(para('图2-1 系统用例图', { alignment: AlignmentType.CENTER, bold: true }));

  ch1children.push(new Paragraph({ children: [new PageBreak()] }));

  // ── 2.3 Use Case Specifications ──
  ch1children.push(heading('2.3 用例规格说明（用例描述）', 2));
  ch1children.push(para('说明：小组成员根据自己的分工，分别选择不同的用例，每人创建2个用例规约。不应包括注册、登录等常规操作。建议选择用例为核心业务用例+数据增改操作用例。', { indent: true }));
  ch1children.push(para('选择描述的用例功能不能过于简单，基本事件流至少应包含2次交互（4个步骤）；扩展流至少应包含2种异常处理情况。'));
  ch1children.push(para('选择描述的用例粒度不宜过大，用例图及用例规约描述中用例名称应避免采用"**管理"字样。'));
  ch1children.push(para(''));

  for (const uc of useCases) {
    ch1children.push(heading(`2.3.${useCases.indexOf(uc) + 1} ${uc.id} ${uc.name}用例`, 3));

    // Use case detail table (no borders)
    const ucRows = [
      ['用例编号', uc.id],
      ['用例名称', uc.name],
      ['参与者', uc.actor],
      ['简要描述', uc.brief],
      ['前置条件', uc.pre],
      ['后置条件', uc.post],
      ['基本事件流', uc.basic.join('\n')],
      ['扩展事件流', uc.alt.join('\n')],
    ];

    const ucTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: ucRows.map(([label, value], ri) =>
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: label, bold: true, size: 22, font: '宋体' })], alignment: AlignmentType.CENTER })],
              width: { size: 15, type: WidthType.PERCENTAGE },
              shading: { type: ShadingType.CLEAR, fill: 'F2F2F2' },
              verticalAlign: VerticalAlign.TOP,
            }),
            new TableCell({
              children: String(value).split('\n').map(line => new Paragraph({ children: [new TextRun({ text: line, size: 22, font: '宋体' })], spacing: { before: 20, after: 20 } })),
              width: { size: 85, type: WidthType.PERCENTAGE },
              verticalAlign: VerticalAlign.TOP,
            }),
          ],
        })
      ),
      borders: {
        top: { style: BorderStyle.SINGLE, size: 1 },
        bottom: { style: BorderStyle.SINGLE, size: 1 },
        left: { style: BorderStyle.SINGLE, size: 1 },
        right: { style: BorderStyle.SINGLE, size: 1 },
        insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
        insideVertical: { style: BorderStyle.SINGLE, size: 1 },
      }
    });

    ch1children.push(ucTable);

    // Add page break before next UC if it's a new module
    const moduleStarts = [0, 2, 6, 11, 14, 16, 19];
    if (moduleStarts.includes(useCases.indexOf(uc) + 1)) {
      ch1children.push(new Paragraph({ children: [new PageBreak()] }));
    } else {
      ch1children.push(para(''));
    }
  }

  sections.push({
    properties: { type: SectionType.NEXT_PAGE },
    children: ch1children,
  });

  // ── Build & Save ──
  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: '宋体', size: 22 },
        },
      },
    },
    sections,
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(DEST, buffer);
  console.log('Done: 需求分析规格说明书-13.docx generated (' + (buffer.length / 1024).toFixed(0) + ' KB)');
}

main().catch(e => { console.error(e); process.exit(1); });
