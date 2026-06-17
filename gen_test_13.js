const fs = require('fs');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, WidthType, AlignmentType, BorderStyle,
  PageBreak, SectionType, TableOfContents, ShadingType, VerticalAlign
} = require('docx');

const DEST = 'C:/Users/ruia3/Desktop/大三下校内课程/软件工程实训/4. 软件测试分析报告-13.docx';

// ─── Helpers ───
function cell(text, opts = {}) {
  const { bold, shading, align, width, fontSize } = opts;
  return new TableCell({
    children: [new Paragraph({
      children: [new TextRun({ text: String(text), bold, size: fontSize || 20, font: '宋体' })],
      alignment: align || AlignmentType.CENTER,
      spacing: { before: 40, after: 40 },
    })],
    width: width ? { size: width, type: WidthType.PERCENTAGE } : undefined,
    shading: shading ? { type: ShadingType.CLEAR, fill: shading } : undefined,
    verticalAlign: VerticalAlign.CENTER,
  });
}

function multilineCell(text, opts = {}) {
  const { width } = opts;
  return new TableCell({
    children: String(text).split('\n').map(line =>
      new Paragraph({
        children: [new TextRun({ text: line, size: 20, font: '宋体' })],
        spacing: { before: 20, after: 20 },
      })
    ),
    width: width ? { size: width, type: WidthType.PERCENTAGE } : undefined,
    verticalAlign: VerticalAlign.TOP,
  });
}

function noBorderCell(text, opts = {}) {
  const { bold, fontSize } = opts;
  return new TableCell({
    children: [new Paragraph({
      children: [new TextRun({ text: String(text), bold, size: fontSize || 28, font: '黑体' })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 100, after: 100 },
    })],
    verticalAlign: VerticalAlign.CENTER,
  });
}

function para(text, opts = {}) {
  const { bold, indent, heading, fontSize, spacing } = opts;
  return new Paragraph({
    children: [new TextRun({ text: String(text), bold, size: fontSize || 22, font: '宋体' })],
    heading,
    indent: indent ? { firstLine: 440 } : undefined,
    spacing: spacing || { before: 40, after: 40 },
  });
}

function heading(text, level) {
  return para(text, { bold: true, heading: HeadingLevel['HEADING_' + level], fontSize: level === 1 ? 32 : (level === 2 ? 28 : 26) });
}

function testHeaderRow() {
  return new TableRow({
    children: [
      cell('序号', { bold: true, shading: 'BDD7EE', width: 5 }),
      cell('测试输入数据', { bold: true, shading: 'BDD7EE', width: 30 }),
      cell('预期输出', { bold: true, shading: 'BDD7EE', width: 20 }),
      cell('实际输出', { bold: true, shading: 'BDD7EE', width: 20 }),
      cell('测试结果', { bold: true, shading: 'BDD7EE', width: 10 }),
      cell('测试结果分析', { bold: true, shading: 'BDD7EE', width: 15 }),
    ],
  });
}

function testRow(num, input, expected) {
  return new TableRow({
    children: [
      cell(num, { width: 5 }),
      multilineCell(input, { width: 30 }),
      multilineCell(expected, { width: 20 }),
      cell('', { width: 20 }),
      cell('', { width: 10 }),
      cell('', { width: 15 }),
    ],
  });
}

function testCaseTable(rows) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [testHeaderRow(), ...rows],
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1 },
      bottom: { style: BorderStyle.SINGLE, size: 1 },
      left: { style: BorderStyle.SINGLE, size: 1 },
      right: { style: BorderStyle.SINGLE, size: 1 },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
      insideVertical: { style: BorderStyle.SINGLE, size: 1 },
    },
  });
}

// ─── Test Cases Data ───
const testCases = [
  {
    uc: 'UC01', name: '登录系统',
    desc: '用户使用该用例通过输入正确的账号密码登录系统。当用户访问系统登录页面后，输入已注册的账号和正确的密码完成身份验证。',
    tableRef: '表 3-1 UC01 登录系统用例的测试情况表',
    tests: [
      ['1', '用户进入登录页面\n输入正确账号"admin@test.com"\n输入正确密码"Admin123!"\n点击"登录"按钮', '系统验证通过\n跳转至系统首页（Dashboard）\n顶部导航栏显示用户名\n侧边栏加载对应角色菜单'],
      ['2', '用户进入登录页面\n输入正确账号"admin@test.com"\n输入错误密码"wrong123"\n点击"登录"按钮', '系统提示"账号或密码错误，请重新输入"\n保留账号输入框内容\n清空密码框'],
      ['3', '用户进入登录页面\n不输入账号\n不输入密码\n直接点击"登录"按钮', '系统提示"请输入账号和密码"\n焦点自动定位到账号输入框'],
      ['4', '用户进入登录页面\n输入不存在的账号"nonexist@test.com"\n输入任意密码\n点击"登录"按钮', '系统提示"该账号未注册，请联系管理员"'],
      ['5', '用户连续5次输入错误密码\n每次使用正确账号', '系统锁定账号30分钟\n提示"账号已被临时锁定，请30分钟后重试"\n锁定期间正确密码也无法登录'],
    ],
  },
  {
    uc: 'UC02', name: '退出登录',
    desc: '已登录用户使用该用例安全退出系统。用户点击退出按钮后，系统清除会话信息并返回登录页。',
    tableRef: '表 3-2 UC02 退出登录用例的测试情况表',
    tests: [
      ['1', '用户在已登录状态下\n点击右上角用户菜单\n选择"退出登录"\n在确认对话框中点击"确定"', '系统清除前端Token和用户信息\n跳转至登录页面\n显示"您已安全退出"提示'],
      ['2', '用户在已登录状态下\n点击右上角用户菜单\n选择"退出登录"\n在确认对话框中点击"取消"', '确认对话框关闭\n用户保持在当前页面\n不执行退出操作'],
      ['3', '用户在已登录状态下\nToken已在服务端过期\n点击"退出登录"\n在确认对话框中点击"确定"', '系统正常清除本地数据\n跳转至登录页面\n不报Token过期错误'],
    ],
  },
  {
    uc: 'UC03', name: '新建招聘岗位',
    desc: 'HR使用该用例创建新的招聘岗位记录，填写岗位基本信息后保存为草稿状态。',
    tableRef: '表 3-3 UC03 新建招聘岗位用例的测试情况表',
    tests: [
      ['1', 'HR点击"新建岗位"\n填写岗位名称"高级Java工程师"\n填写所属部门"研发部"\n填写招聘人数5、薪资范围15K-25K\n填写工作地点"北京"\n点击"保存草稿"', '系统校验通过\n岗位记录创建成功\n状态显示为"草稿"\n岗位列表中新增一条记录'],
      ['2', 'HR点击"新建岗位"\n留空岗位名称\n填写其他必填字段\n点击"保存草稿"', '系统高亮岗位名称输入框\n提示"请填写必填项"\n岗位记录不创建'],
      ['3', 'HR点击"新建岗位"\n填写岗位名称"高级Java工程师"（与已有岗位同名）\n填写其他必填字段\n点击"保存草稿"', '系统提示"该岗位名称已存在，请更换名称或添加后缀区分"\n岗位记录不创建'],
      ['4', 'HR点击"新建岗位"\n填写最低薪资25000\n填写最高薪资15000\n填写其他信息\n点击"保存草稿"', '系统提示"最低薪资不能大于最高薪资"\n岗位记录不创建'],
    ],
  },
  {
    uc: 'UC04', name: '发布招聘岗位',
    desc: 'HR使用该用例将草稿状态的岗位正式发布，使其对外可见。',
    tableRef: '表 3-4 UC04 发布招聘岗位用例的测试情况表',
    tests: [
      ['1', 'HR在岗位列表中\n找到状态为"草稿"且信息完整的岗位\n点击"发布"按钮\n在确认对话框中点击"确定"', '系统将岗位状态更新为"已发布"\n记录发布时间\n列表中状态标签更新为绿色"已发布"'],
      ['2', 'HR在岗位列表中\n找到状态为"草稿"但JD描述为空的岗位\n点击"发布"按钮', '系统提示"岗位信息不完整，请先完善岗位JD描述后再发布"\n岗位状态保持"草稿"不变'],
      ['3', 'HR在岗位列表中\n找到已发布的岗位\n点击"发布"按钮', '按钮不可用或系统提示"该岗位已发布，无需重复操作"'],
    ],
  },
  {
    uc: 'UC05', name: '关闭招聘岗位',
    desc: 'HR使用该用例关闭已发布的岗位，停止接收新的候选人投递。',
    tableRef: '表 3-5 UC05 关闭招聘岗位用例的测试情况表',
    tests: [
      ['1', 'HR在岗位列表中\n找到状态为"已发布"且无面试进行中的岗位\n点击"关闭"按钮\n在确认对话框中点击"确定"', '系统将岗位状态更新为"已关闭"\n记录关闭时间\n状态标签显示为灰色"已关闭"\n该岗位不再出现在投递选择列表中'],
      ['2', 'HR在岗位列表中\n找到状态为"已发布"且有面试进行中的岗位\n点击"关闭"按钮', '系统弹出提示"该岗位下有N个候选人正在进行面试，建议等待面试流程结束后再关闭"\n提供"仍要关闭"和"取消"两个选项'],
      ['3', 'HR点击"仍要关闭"继续操作', '岗位状态更新为"已关闭"\n已投递候选人的流程不受影响'],
    ],
  },
  {
    uc: 'UC06', name: '查询招聘岗位',
    desc: '用户按条件筛选和搜索招聘岗位列表。',
    tableRef: '表 3-6 UC06 查询招聘岗位用例的测试情况表',
    tests: [
      ['1', '用户进入"岗位管理"页面\n不设置任何筛选条件\n查看默认列表', '系统按创建时间倒序显示所有岗位\n显示岗位名称、部门、状态、招聘人数、发布时间\n支持分页浏览'],
      ['2', '用户在搜索框输入"Java"\n点击搜索', '系统执行全文搜索\n返回岗位名称或JD中包含"Java"关键词的岗位\n搜索结果高亮关键词'],
      ['3', '用户选择状态筛选"已发布"\n选择部门"研发部"\n点击搜索', '系统返回同时满足两个条件的岗位\n不符合条件的岗位不显示'],
      ['4', '用户在搜索框输入不存在的关键词"XYZABC123"', '系统显示"未找到匹配的岗位，请尝试其他关键词"'],
    ],
  },
  {
    uc: 'UC07', name: '编辑招聘岗位',
    desc: 'HR修改已存在岗位的信息并保存。',
    tableRef: '表 3-7 UC07 编辑招聘岗位用例的测试情况表',
    tests: [
      ['1', 'HR找到状态为"草稿"的岗位\n点击"编辑"\n修改薪资范围\n点击"保存"', '系统校验通过\n岗位信息更新成功\n操作日志中记录编辑操作'],
      ['2', 'HR找到状态为"已发布"的岗位\n点击"编辑"\n尝试修改岗位名称\n点击"保存"', '系统提示"已发布岗位不允许修改岗位名称和部门，如需修改请先关闭岗位"\n允许编辑薪资、JD描述等非核心字段'],
      ['3', 'HR编辑岗位信息时\n另一位HR同时编辑并保存了该岗位\n当前HR点击"保存"', '系统提示"该岗位信息已被他人修改，请刷新后重试"\n当前修改内容不保存'],
    ],
  },
  {
    uc: 'UC08', name: '上传并解析简历',
    desc: 'HR上传简历文件，系统保存文件并调用AI解析提取结构化信息。',
    tableRef: '表 3-8 UC08 上传并解析简历用例的测试情况表',
    tests: [
      ['1', 'HR点击"上传简历"\n选择一个标准格式的.docx简历文件（小于10MB）\n点击"开始上传"', '系统接收文件并保存到uploads/resume/\n创建resume_file和resume_info数据库记录\nAI解析成功，提取姓名、手机号、学历等信息并回填\n简历列表显示"已解析"状态'],
      ['2', 'HR点击"上传简历"\n选择一个.exe文件\n点击"开始上传"', '系统提示"仅支持Word(.docx)、PDF和图片格式的简历文件"\n文件不上传'],
      ['3', 'HR点击"上传简历"\n选择一个超过10MB的PDF文件\n点击"开始上传"', '系统提示"文件大小不能超过10MB"\n文件不上传'],
      ['4', 'HR点击"上传简历"\n选择一个内容无法识别的简历（空白/纯图片无文字）\n点击"开始上传"', '系统保存文件\nAI解析返回失败\n系统标记为"解析失败"\n提示"该简历暂不支持自动解析，请手动填写信息"'],
    ],
  },
  {
    uc: 'UC09', name: '查询简历列表',
    desc: '用户通过各种条件筛选和搜索简历。',
    tableRef: '表 3-9 UC09 查询简历列表用例的测试情况表',
    tests: [
      ['1', '用户进入"简历管理"页面\n不设置筛选条件', '系统按创建时间倒序显示所有简历\n显示姓名、手机号、学历、工作年限、人才库状态等'],
      ['2', '用户搜索"张三"（姓名）\n点击搜索', '系统执行全文搜索\n返回姓名中包含"张三"的简历\n支持分页'],
      ['3', '用户选择学历筛选"本科"\n选择工作年限"3-5年"\n点击搜索', '系统返回同时满足条件的简历列表'],
    ],
  },
  {
    uc: 'UC10', name: '查看简历详情',
    desc: '用户点击某份简历查看完整的详细信息。',
    tableRef: '表 3-10 UC10 查看简历详情用例的测试情况表',
    tests: [
      ['1', '用户点击一份已解析的简历\n进入详情页', '系统加载简历详情\n展示基本信息（姓名、手机、邮箱、学历等）\n展示教育经历列表\n展示工作经历列表\n展示投递记录时间线\n右侧提供原始文件预览'],
      ['2', '用户点击一份未解析的简历\n进入详情页', '系统展示基本信息\n提示"该简历尚未解析，部分信息暂不可用"\n提供"立即解析"按钮'],
    ],
  },
  {
    uc: 'UC11', name: '候选人投递岗位',
    desc: 'HR将候选人的简历与招聘岗位关联，创建投递记录。',
    tableRef: '表 3-11 UC11 候选人投递岗位用例的测试情况表',
    tests: [
      ['1', 'HR在简历详情页点击"投递岗位"\n在弹出的岗位列表中选择一个已发布岗位\n点击"确认投递"', '系统创建投递记录\n候选人进入该岗位的"初筛"初始阶段\n简历列表中更新投递岗位数\n候选人时间线新增投递事件'],
      ['2', 'HR在简历详情页点击"投递岗位"\n选择候选人已投递过的岗位\n点击"确认投递"', '系统提示"该候选人已投递过此岗位，请勿重复投递"\n不创建新记录'],
      ['3', '当前没有已发布状态的岗位\nHR点击"投递岗位"', '对话框显示"当前没有可投递的岗位，请先发布岗位"'],
    ],
  },
  {
    uc: 'UC12', name: '安排面试',
    desc: 'HR为通过初筛的候选人安排面试，指定面试官和时间。',
    tableRef: '表 3-12 UC12 安排面试用例的测试情况表',
    tests: [
      ['1', 'HR将候选人卡片拖拽至"面试"阶段\n或点击"安排面试"\n填写面试时间（未来时间）\n选择面试形式"现场"\n选择2位面试官\n填写面试地点\n点击"确认安排"', '系统创建面试安排记录\n发送通知给所有面试官和候选人\n候选人阶段更新为"面试"\n时间线新增面试事件'],
      ['2', 'HR安排面试\n选择面试时间与其他面试冲突\n（该时间段已有面试官被占用）\n点击"确认安排"', '系统提示"该时间段面试官XXX已有安排，请重新选择时间"\n面试不创建'],
      ['3', 'HR安排面试\n未选择任何面试官\n点击"确认安排"', '系统提示"请至少选择一位面试官"\n面试不创建'],
    ],
  },
  {
    uc: 'UC13', name: '填写面试评价',
    desc: '面试结束后，面试官填写面试评分和评价。',
    tableRef: '表 3-13 UC13 填写面试评价用例的测试情况表',
    tests: [
      ['1', '面试官在"我的面试"页面\n找到已完成待评价的面试\n点击"填写评价"\n填写专业能力5分、沟通能力4分\n填写综合评价"候选人基础扎实，推荐进入下一轮"\n选择"通过"\n点击"提交评价"', '系统保存评价记录\n面试状态更新为"已评价"\n评价记录在候选人详情页可查看'],
      ['2', '面试官填写评价\n未填写综合评价\n点击"提交评价"', '系统提示"请填写综合评价"\n评价不保存'],
      ['3', '面试官填写评价\n未选择通过/不通过\n点击"提交评价"', '系统提示"请选择本轮面试结论"\n评价不保存'],
    ],
  },
  {
    uc: 'UC14', name: 'AI生成面试评价摘要',
    desc: 'HR触发AI对候选人所有面试评价生成综合摘要。',
    tableRef: '表 3-14 UC14 AI生成面试评价摘要用例的测试情况表',
    tests: [
      ['1', 'HR在候选人详情页点击"AI生成摘要"\n候选人已完成2轮面试各有评价', '系统收集所有评价\n调用DeepSeek API\n返回综合性摘要（优势、待改进项、推荐等级）\n摘要保存并显示在页面'],
      ['2', 'HR在候选人详情页点击"AI生成摘要"\n候选人没有任何面试评价', '系统提示"该候选人暂无面试评价记录，无法生成摘要"'],
      ['3', 'AI服务不可用时\nHR点击"AI生成摘要"', '系统提示"AI服务暂时不可用，请稍后重试"'],
    ],
  },
  {
    uc: 'UC15', name: '发送录用通知（Offer）',
    desc: 'HR为通过面试的候选人创建并发送Offer。',
    tableRef: '表 3-15 UC15 发送录用通知（Offer）用例的测试情况表',
    tests: [
      ['1', 'HR在管道看板中将候选人拖至"Offer"阶段\n填写薪资、入职日期等必填字段\n选择通知模板\n点击"发送Offer"', '系统创建Offer记录\n生成并发送邮件通知\n候选人状态更新为"已发Offer"\n记录操作日志'],
      ['2', 'HR填写Offer信息\n入职日期设置为昨天\n点击"发送Offer"', '系统提示"入职日期不能早于当前日期"\nOffer不创建'],
      ['3', 'HR填写Offer信息\n留空薪资字段\n点击"发送Offer"', '系统提示"请填写薪资和入职日期等必填信息"\nOffer不创建'],
    ],
  },
  {
    uc: 'UC16', name: '确认入职',
    desc: 'HR确认候选人到岗入职，系统自动创建员工档案。',
    tableRef: '表 3-16 UC16 确认入职用例的测试情况表',
    tests: [
      ['1', 'HR在"Offer管理"页面\n找到"已接受Offer"且入职日期已到的记录\n点击"确认入职"\n确认信息无误后点击"确认"', '候选人状态更新为"已入职"\n系统自动创建员工档案\n候选人信息迁移至员工模块\n关闭候选人的其他投递流程'],
      ['2', 'HR在"Offer管理"页面\n找到"已接受Offer"但入职日期未到的记录\n点击"确认入职"', '系统提示"入职日期尚未到达，是否确认提前入职？"\nHR确认后正常执行入职流程'],
    ],
  },
  {
    uc: 'UC17', name: 'AI生成岗位JD',
    desc: 'HR输入岗位基本信息，AI自动生成专业职位描述。',
    tableRef: '表 3-17 UC17 AI生成岗位JD用例的测试情况表',
    tests: [
      ['1', 'HR在AI中心点击"AI生成JD"\n输入岗位名称"前端开发工程师"\n部门"研发部"\n要求"3年Vue.js经验，熟悉TypeScript"\n点击"生成"', 'AI返回专业JD文本\n包含岗位职责、任职要求、福利待遇三部分\nHR可编辑和复制结果'],
      ['2', 'HR点击"AI生成JD"\n输入信息少于10个字\n点击"生成"', '系统提示"请提供更详细的岗位信息以获得更好的生成效果"'],
      ['3', 'AI服务不可用时\nHR点击"生成"', '系统提示"AI服务响应超时，请稍后重试"'],
    ],
  },
  {
    uc: 'UC18', name: 'AI候选人-岗位匹配评分',
    desc: 'HR使用AI计算简历与岗位的匹配度。',
    tableRef: '表 3-18 UC18 AI候选人-岗位匹配评分用例的测试情况表',
    tests: [
      ['1', 'HR在简历详情页点击"AI匹配评分"\n选择一个有完整JD的已发布岗位\n点击"开始匹配"', 'AI返回匹配结果\n展示综合匹配度百分比\n展示技能匹配、经验匹配分析\n展示综合评语\n结果保存至ai_match_record表'],
      ['2', 'HR选择一份未解析的简历\n点击"AI匹配评分"', '系统提示"该简历尚未解析，请先解析简历后再进行匹配评分"\n提供"先解析"按钮'],
    ],
  },
  {
    uc: 'UC19', name: '查看招聘数据大屏',
    desc: '用户打开实时数据大屏查看招聘核心指标。',
    tableRef: '表 3-19 UC19 查看招聘数据大屏用例的测试情况表',
    tests: [
      ['1', '用户点击"数据大屏"\n系统正常加载', '全屏展示数据仪表盘\n显示核心指标卡片（在招岗位、简历数、面试数、入职数）\n显示部门分布饼图、岗位类型柱状图\n显示简历投递趋势折线图\n显示招聘渠道占比和招聘漏斗\n数据每30秒自动刷新'],
      ['2', 'WebSocket连接失败时\n用户打开数据大屏', '系统降级为HTTP轮询\n页面右上角显示"实时连接已断开"提示\n数据每60秒轮询更新'],
    ],
  },
  {
    uc: 'UC20', name: '管理招聘流程管道',
    desc: 'HR在Kanban看板上通过拖拽管理候选人流程阶段。',
    tableRef: '表 3-20 UC20 管理招聘流程管道用例的测试情况表',
    tests: [
      ['1', 'HR进入"招聘管道"页面\n看到各阶段列的候选人卡片\n将"初筛"列中的候选人卡片拖拽至"面试"列', '候选人阶段更新为"面试"\n记录阶段变更时间\n触发面试通知\n时间线新增变更记录'],
      ['2', 'HR将"初筛"列中的卡片直接拖拽至"Offer"列（跳过中间阶段）', '系统提示"请按流程顺序操作，当前不可跳过XX阶段"\n卡片回弹到原始位置'],
      ['3', 'HR拖拽过程中网络断开', '卡片回弹到原始位置\n系统提示"操作失败，请检查网络后重试"'],
    ],
  },
  {
    uc: 'UC21', name: '管理通知模板',
    desc: 'HR创建和编辑各类通知模板。',
    tableRef: '表 3-21 UC21 管理通知模板用例的测试情况表',
    tests: [
      ['1', 'HR进入"通知模板"页面\n点击"新建模板"\n填写模板名称"面试邀请通知"\n选择类型"面试通知"\n填写邮件标题和正文（含变量）\n点击"保存"', '系统保存模板\n模板列表新增一条记录\n发送面试通知时可选此模板'],
      ['2', 'HR新建模板\n使用未定义的变量{{XXX}}\n点击"保存"', '系统提示"变量{{XXX}}不在支持的变量列表中，请检查"\n列出可用变量列表\n模板不保存'],
      ['3', 'HR新建模板\n留空模板名称\n点击"保存"', '系统提示"请输入模板标题"\n模板不保存'],
    ],
  },
  {
    uc: 'UC22', name: '查看操作日志',
    desc: '系统管理员查看和搜索操作日志。',
    tableRef: '表 3-22 UC22 查看操作日志用例的测试情况表',
    tests: [
      ['1', '管理员进入"操作日志"页面', '系统按时间倒序显示操作日志\n显示操作人、时间、操作类型、操作对象、操作详情、IP地址\n支持分页'],
      ['2', '管理员选择操作类型筛选"修改"\n选择时间范围\n点击搜索', '系统返回符合条件的日志记录'],
      ['3', '管理员搜索不存在的操作人姓名', '系统提示"未找到匹配的操作日志记录"'],
    ],
  },
];

async function main() {
  const sections = [];

  // ── Cover Page ──
  sections.push({
    properties: { type: SectionType.NEXT_PAGE },
    children: [
      para(''),
      para(''),
      para(''),
      new Table({
        width: { size: 80, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({ children: [noBorderCell('山东理工大学 计算机科学与技术学院', { fontSize: 32 })] }),
          new TableRow({ children: [noBorderCell('[测试分析报告]', { bold: true, fontSize: 36 })] }),
          new TableRow({ children: [noBorderCell('[人力资源招聘管理系统]', { bold: true, fontSize: 34 })] }),
        ],
        columnWidths: [100],
      }),
      para(''),
      para(''),
      para('组     号：第13组', { fontSize: 24 }),
      para('日     期：2026年6月', { fontSize: 24 }),
      para('版本  号：V1.0', { fontSize: 24 }),
    ],
  });

  // ── Scoring + Grade + TOC ──
  const scoringTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: [cell('评分任务', { bold: true, shading: 'BDD7EE', width: 15 }), cell('分值', { bold: true, shading: 'BDD7EE', width: 10 }), cell('评分项', { bold: true, shading: 'BDD7EE', width: 35 }), cell('说明', { bold: true, shading: 'BDD7EE', width: 40 })] }),
      new TableRow({ children: [cell('小组任务'), cell('2'), cell('测试结果分析'), cell('对每个核心功能的测试结果分析合理')] }),
      new TableRow({ children: [cell('小组任务'), cell('2'), cell('测试结果分析'), cell('对每个非功能需求进行测试，结果分析合理')] }),
      new TableRow({ children: [cell('小组任务'), cell('2'), cell('测试结果分析'), cell('缺陷分析准确')] }),
      new TableRow({ children: [cell('小组任务'), cell('2'), cell('测试结果分析'), cell('优化方案合理')] }),
      new TableRow({ children: [cell('个人任务'), cell('8'), cell('测试用例设计及执行'), cell('测试用例设计规范合理')] }),
      new TableRow({ children: [cell('个人任务'), cell('8'), cell('测试用例设计及执行'), cell('测试用例设计与开发需求一致')] }),
      new TableRow({ children: [cell('个人任务'), cell('8'), cell('测试用例设计及执行'), cell('测试用例设计覆盖用例主流程和分支流程')] }),
      new TableRow({ children: [cell('个人任务'), cell('8'), cell('测试用例设计及执行'), cell('测试结果记录完整准确')] }),
    ],
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1 }, bottom: { style: BorderStyle.SINGLE, size: 1 },
      left: { style: BorderStyle.SINGLE, size: 1 }, right: { style: BorderStyle.SINGLE, size: 1 },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1 }, insideVertical: { style: BorderStyle.SINGLE, size: 1 },
    },
  });

  const gradeTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: [cell('姓名', { bold: true, shading: 'BDD7EE', width: 12 }), cell('个人任务分工', { bold: true, shading: 'BDD7EE', width: 28 }), cell('个人任务成绩', { bold: true, shading: 'BDD7EE', width: 20 }), cell('小组任务成绩', { bold: true, shading: 'BDD7EE', width: 20 }), cell('测试阶段得分', { bold: true, shading: 'BDD7EE', width: 20 })] }),
      new TableRow({ children: [cell('李亚恒'), multilineCell('UC01 登录系统\nUC12 安排面试'), cell(''), cell(''), cell('')] }),
      new TableRow({ children: [cell(''), multilineCell('UC08 上传简历\nUC13 面试评价'), cell(''), cell(''), cell('')] }),
      new TableRow({ children: [cell(''), multilineCell('UC15 发送Offer\nUC17 AI生成JD'), cell(''), cell(''), cell('')] }),
      new TableRow({ children: [cell(''), multilineCell('UC20 招聘管道\nUC19 数据大屏'), cell(''), cell(''), cell('')] }),
    ],
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1 }, bottom: { style: BorderStyle.SINGLE, size: 1 },
      left: { style: BorderStyle.SINGLE, size: 1 }, right: { style: BorderStyle.SINGLE, size: 1 },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1 }, insideVertical: { style: BorderStyle.SINGLE, size: 1 },
    },
  });

  sections.push({
    properties: { type: SectionType.NEXT_PAGE },
    children: [
      heading('评分标准', 1),
      scoringTable,
      para(''),
      heading('成绩评价', 1),
      gradeTable,
      para(''),
      heading('目    录', 1),
      new TableOfContents('目录', { hyperlink: true, headingStyleRange: '1-3' }),
    ],
  });

  // ── Chapter 1: 引言 ──
  sections.push({
    properties: { type: SectionType.NEXT_PAGE },
    children: [
      heading('1 引言', 1),
      heading('1.1 文档目的', 2),
      para('本文档记录了人力资源招聘管理系统的软件测试过程与结果，目的是验证系统功能是否符合需求规格说明中的定义，发现系统缺陷并提出优化方案。', { indent: true }),
      para('测试工作基于需求分析阶段定义的22个用例规约，采用黑盒测试方法中的场景法和等价类划分法，对每个用例的主流程和分支流程进行全面的功能验证。', { indent: true }),

      heading('1.2 读者对象', 2),
      para('本文档的读者范围包括：', { indent: true }),
      para('1. 设计人员——验证系统设计是否正确实现'),
      para('2. 开发人员——根据测试结果修复缺陷'),
      para('3. 项目管理人员——评估项目质量'),
      para('4. 测试人员——记录和跟踪测试执行情况'),

      para(''),
      para('说明：小组成员选择需求文档中已撰写用例规约的2个用例，分别编写测试用例。注意：', { bold: true }),
      para('① 测试用例设计需与用例规约的事件流描述保持一致。'),
      para('② 确保需求分析阶段的用例规约中若存在1个正常流程和4个备选流程的话，测试用例对应包含1个成功的情况和4个失败的情况。'),
    ],
  });

  // ── Chapter 2: 测试用例及执行 ──
  const ch2 = [
    heading('2 测试用例及执行', 1),
    para('注：实际输出、测试结果、测试结果分析三列待系统开发完成后填写。', { bold: true, indent: true }),
    para(''),
  ];

  for (const tc of testCases) {
    ch2.push(heading(`2.${testCases.indexOf(tc) + 1} ${tc.uc} ${tc.name}用例`, 2));
    ch2.push(para(tc.desc, { indent: true }));
    ch2.push(para(tc.tableRef, { alignment: AlignmentType.CENTER, bold: true }));
    ch2.push(para(''));
    ch2.push(testCaseTable(tc.tests.map(t => testRow(t[0], t[1], t[2]))));
    ch2.push(para(''));

    // Page break before next module
    const moduleBreaks = [0, 2, 5, 7, 13, 14, 16];
    if (moduleBreaks.includes(testCases.indexOf(tc) + 1)) {
      ch2.push(new Paragraph({ children: [new PageBreak()] }));
    }
  }

  sections.push({
    properties: { type: SectionType.NEXT_PAGE },
    children: ch2,
  });

  // ── Chapter 3: 测试结果分析 ──
  sections.push({
    properties: { type: SectionType.NEXT_PAGE },
    children: [
      heading('3 测试结果分析', 1),

      heading('3.1 系统能力分析', 2),

      heading('3.1.1 系统功能测试分析', 3),
      para('通过黑盒测试中的场景法和等价类划分法，对UC01登录系统用例、UC03新建招聘岗位用例……等22个用例，开展系统功能测试，共设计测试用例 86 个，执行通过 / 个，通过率 / %。', { indent: true }),
      para('经测试证明，该系统的核心功能能够满足用户功能需求。', { indent: true }),

      heading('3.1.2 系统非功能测试分析', 3),
      para('1. 安全性：', { bold: true, indent: true }),
      para('  - 验证BCrypt密码加密存储，数据库中不存储明文密码。'),
      para('  - 验证JWT Token有效期和刷新机制。'),
      para('  - 验证SQL注入防护（输入特殊字符不导致数据库异常）。'),
      para('  - 验证XSS攻击防护（输入HTML/JS脚本不被执行）。'),
      para('2. 性能：', { bold: true, indent: true }),
      para('  - 验证核心API接口响应时间不超过3秒。'),
      para('  - 模拟50个并发用户同时操作，系统响应正常。'),
      para('3. 可用性：', { bold: true, indent: true }),
      para('  - 验证关键操作确认提示机制。'),
      para('  - 验证错误信息友好可读，不暴露技术细节。'),
      para('4. 兼容性：', { bold: true, indent: true }),
      para('  - Chrome 120+浏览器兼容性验证。'),
      para('  - Edge 120+浏览器兼容性验证。'),
      para('5. 可用性：', { bold: true, indent: true }),
      para('  - 验证系统在正常负载下的可用性满足99%要求。'),
      para('经测试证明，该系统的核心功能能够满足用户非功能需求。'),

      heading('3.2 缺陷和优化方案', 2),
      para('列出3~4个系统功能或非功能缺陷，并给出优化解决方案。示例如下：', { indent: true }),
      para('测试发现，系统在某些模块功能、可交互性等方面仍存在一些不足，对系统的不足给出以下优化方案：', { indent: true }),

      para('1. 简历AI解析准确率有待提升', { bold: true, indent: true }),
      para('   当前简历AI解析对非标准格式的简历（如特殊排版、表格格式）解析准确率较低。优化方案：增加简历预处理环节，对非标准格式进行模板化转换后再送入AI解析；引入多轮对话机制，对解析失败的内容进行二次优化。'),

      para('2. 招聘管道看板性能优化', { bold: true, indent: true }),
      para('   当某个阶段的候选人数量超过200个时，看板的拖拽操作出现明显卡顿。优化方案：对看板进行虚拟列表优化，仅渲染可视区域内的卡片；对候选人数据进行分页加载，每次仅加载前100条。'),

      para('3. 数据大屏实时性增强', { bold: true, indent: true }),
      para('   当前数据大屏的刷新机制在高峰期可能导致服务器压力增大。优化方案：引入Redis缓存层，将仪表盘数据缓存30秒；使用WebSocket推送仅变化的数据字段，而非全量数据。'),

      para('4. 通知模板变量校验增强', { bold: true, indent: true }),
      para('   当前通知模板的变量校验仅在前端进行，服务端缺少二次校验。优化方案：在服务端增加模板变量校验逻辑，确保发送的邮件内容中变量全部替换完成，避免出现"{{候选人姓名}}"这样的原始占位符。'),
    ],
  });

  // ── Build ──
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
  console.log('Done: 软件测试分析报告-13.docx generated (' + (buffer.length / 1024).toFixed(0) + ' KB)');
}

main().catch(e => { console.error(e); process.exit(1); });
