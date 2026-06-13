const fs = require('fs');
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
        AlignmentType, WidthType, BorderStyle, ShadingType, VerticalAlign,
        HeadingLevel, PageNumber, Header, Footer } = require('docx');

// ========== 需求分析规格说明书 ==========
const useCases = [
  { id: 'UC01', name: '登录系统', actor: 'HR专员/部门经理/管理员', desc: '用户输入账号密码，系统验证后允许登录', pre: '无', post: '用户登录成功，进入系统首页' },
  { id: 'UC02', name: '退出登录', actor: '所有用户', desc: '用户点击退出，系统清除会话', pre: '用户已登录', post: '用户退出到登录页' },
  { id: 'UC03', name: '新建招聘岗位', actor: 'HR专员', desc: 'HR填写岗位信息（名称、部门、要求等），系统保存并生成岗位记录', pre: 'HR已登录', post: '岗位草稿保存成功' },
  { id: 'UC04', name: '发布招聘岗位', actor: 'HR专员', desc: 'HR选择草稿状态岗位点击发布，系统将状态改为已发布', pre: '岗位状态为草稿', post: '岗位状态变为已发布，候选人可见' },
  { id: 'UC05', name: '关闭招聘岗位', actor: 'HR专员', desc: 'HR选择已发布岗位点击关闭，系统将状态改为已关闭', pre: '岗位状态为已发布', post: '岗位停止接收投递' },
  { id: 'UC06', name: '查询招聘岗位', actor: 'HR专员/部门经理', desc: '用户按条件（状态、部门、关键词）查询岗位列表', pre: '用户已登录', post: '显示符合条件的岗位列表' },
  { id: 'UC07', name: '编辑招聘岗位', actor: 'HR专员', desc: 'HR修改岗位信息并保存', pre: '岗位存在且为草稿或已关闭', post: '岗位信息更新' },
  { id: 'UC08', name: '上传简历', actor: 'HR专员', desc: 'HR选择简历文件上传，系统保存文件并创建简历记录', pre: 'HR已登录', post: '简历文件保存成功，简历记录创建' },
  { id: 'UC09', name: 'AI解析简历', actor: 'HR专员', desc: 'HR触发解析，系统调用AI提取简历结构化信息并回写', pre: '简历文件已上传', post: '简历结构化信息提取完成' },
  { id: 'UC10', name: '查询简历列表', actor: 'HR专员/部门经理', desc: '用户按条件（关键词、状态、人才库状态）查询简历', pre: '用户已登录', post: '显示符合条件的简历列表' },
  { id: 'UC11', name: '查看简历详情', actor: 'HR专员/部门经理', desc: '用户点击简历查看详细信息，包括解析后的结构化数据', pre: '简历存在', post: '显示简历详细信息' },
  { id: 'UC12', name: '安排面试', actor: 'HR专员', desc: 'HR选择简历和岗位，设置面试时间、地点、面试官，系统创建面试安排', pre: '简历已投递对应岗位', post: '面试安排创建成功，通知面试官和候选人' },
  { id: 'UC13', name: '填写面试评价', actor: '面试官', desc: '面试官填写面试评分和评价内容，系统保存评价记录', pre: '面试已安排且已完成', post: '面试评价保存成功' },
  { id: 'UC14', name: 'AI生成面试评价摘要', actor: 'HR专员', desc: 'HR触发摘要生成，系统调用AI对多条面试评价生成综合摘要', pre: '面试评价已填写', post: 'AI摘要生成完成' },
  { id: 'UC15', name: '发送录用通知（Offer）', actor: 'HR专员', desc: 'HR填写Offer信息（薪资、入职时间等），系统生成Offer记录并通知候选人', pre: '面试通过', post: 'Offer记录创建，候选人收到通知' },
  { id: 'UC16', name: '确认入职', actor: 'HR专员', desc: 'HR确认候选人入职，系统将状态改为已入职并创建员工档案', pre: '候选人接受Offer', post: '员工档案创建成功' },
  { id: 'UC17', name: 'AI生成岗位JD', actor: 'HR专员', desc: 'HR输入岗位基本信息，系统调用AI生成专业岗位描述', pre: '用户已登录', post: 'JD文本生成成功' },
  { id: 'UC18', name: 'AI候选人-岗位匹配评分', actor: 'HR专员', desc: 'HR选择简历和岗位，系统调用AI计算匹配度评分', pre: '简历和岗位均存在', post: '匹配评分生成并保存' },
  { id: 'UC19', name: '查看招聘数据大屏', actor: 'HR专员/部门经理', desc: '用户查看实时招聘数据仪表盘（岗位数、简历数、面试数、入职数）', pre: '用户已登录', post: '显示数据大屏' },
  { id: 'UC20', name: '管理招聘流程管道', actor: 'HR专员', desc: 'HR拖拽候选人卡片变更阶段（初筛→面试→Offer→入职），系统更新状态', pre: '候选人已投递', post: '候选人阶段更新，触发相应通知' },
  { id: 'UC21', name: '管理通知模板', actor: 'HR专员', desc: 'HR创建/编辑邮件通知模板，支持变量替换', pre: '用户已登录', post: '模板保存成功' },
  { id: 'UC22', name: '查看操作日志', actor: '系统管理员', desc: '管理员查看系统操作日志（谁、何时、做了什么）', pre: '管理员已登录', post: '显示操作日志列表' },
];

const borderNone = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
const borderThin = { style: BorderStyle.SINGLE, size: 1, color: '000000' };
const cellBorders = { top: borderThin, bottom: borderThin, left: borderThin, right: borderThin };

function h1(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text, bold: true, size: 32 })], spacing: { before: 240, after: 160 } });
}
function h2(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text, bold: true, size: 28 })], spacing: { before: 180, after: 120 } });
}
function h3(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun({ text, bold: true, size: 24 })], spacing: { before: 120, after: 80 } });
}
function p(text, indent = 0) {
  return new Paragraph({ children: [new TextRun(text || '')], indent: { left: indent }, spacing: { after: 80 } });
}
function boldP(label, text) {
  return new Paragraph({ children: [new TextRun({ text: label, bold: true }), new TextRun(text || '')], spacing: { after: 80 } });
}

function makeTable(headers, rows) {
  const colW = Math.floor(9360 / headers.length);
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: headers.map(() => colW),
    rows: [
      new TableRow({
        children: headers.map(h => new TableCell({
          borders: cellBorders,
          width: { size: colW, type: WidthType.DXA },
          shading: { fill: 'BDD7EE', type: ShadingType.CLEAR },
          margins: { top: 80, bottom: 80, left: 120, right: 120 },
          children: [new Paragraph({ children: [new TextRun({ text: h, bold: true })], alignment: AlignmentType.CENTER })],
        })),
      }),
      ...rows.map(row => new TableRow({
        children: row.map((cell, i) => new TableCell({
          borders: cellBorders,
          width: { size: colW, type: WidthType.DXA },
          margins: { top: 80, bottom: 80, left: 120, right: 120 },
          children: [typeof cell === 'string' ? new Paragraph({ children: [new TextRun(cell)], alignment: AlignmentType.LEFT }) : cell],
        })),
      })),
    ],
  });
}

const actors = [
  ['HR专员', '招聘专员，负责岗位发布、简历筛选、面试安排、Offer发放等日常招聘工作'],
  ['部门经理', '用人部门经理，负责面试、评价候选人、确认录用'],
  ['系统管理员', '负责系统配置、用户管理、操作日志查看等管理工作'],
  ['候选人', '投递简历的应聘者，通过外部端口查看岗位和投递状态'],
];

const children = [
  // 封面
  new Paragraph({ children: [new TextRun({ text: '人力资源招聘管理系统', bold: true, size: 48 })], alignment: AlignmentType.CENTER, spacing: { before: 3000, after: 400 } }),
  new Paragraph({ children: [new TextRun({ text: '需求分析规格说明书', bold: true, size: 36 })], alignment: AlignmentType.CENTER, spacing: { after: 600 } }),
  new Paragraph({ children: [new TextRun('版本：V1.0')], alignment: AlignmentType.CENTER, spacing: { after: 200 } }),
  new Paragraph({ children: [new TextRun('日期：2026年6月')], alignment: AlignmentType.CENTER, spacing: { after: 3000 } }),
  new Paragraph({ children: [new TextRun('')], pageBreakBefore: true }),

  h1('1. 引言'),
  h2('1.1 编写目的'),
  p('本文档描述人力资源招聘管理系统的功能需求，作为系统设计和开发的依据。'),
  h2('1.2 项目背景'),
  p('传统招聘管理依赖手工操作和Excel记录，效率低、数据分散、协作困难。本系统通过信息化手段实现招聘全流程管理，并引入AI能力提升智能化水平。'),
  h2('1.3 参考资料'),
  p('《软件工程综合实训任务书》'),
  p('《人力资源招聘管理系统选型表》'),

  new Paragraph({ children: [new TextRun('')], pageBreakBefore: true }),
  h1('2. 任务概述'),
  h2('2.1 目标'),
  p('构建一个AI驱动的人力资源招聘管理平台，覆盖从岗位发布到入职的全流程，并提供数据分析和差异化创新功能。'),
  h2('2.2 用户特点'),
  p('HR专员：熟悉招聘业务流程，需要高效的工具支持日常工作。'),
  p('部门经理：关注候选人质量，需要便捷的面试和评价工具。'),
  p('系统管理员：具备系统管理知识，负责系统配置和维护。'),

  new Paragraph({ children: [new TextRun('')], pageBreakBefore: true }),
  h1('3. 需求分析'),
  h2('3.1 参与者（Actor）分析'),
  makeTable(['参与者', '职责描述'], actors),
  new Paragraph({ children: [new TextRun('')], spacing: { after: 200 } }),

  h2('3.2 功能需求列表'),
  p('系统功能模块包括：岗位管理、简历管理、面试管理、录用入职、报表统计、AI智能功能、系统管理等。'),

  new Paragraph({ children: [new TextRun('')], pageBreakBefore: true }),
  h1('4. 用例规约描述'),
  p('以下按模块对系统用例进行详细描述，共 ' + useCases.length + ' 个用例。'),
];

// 按模块分组输出用例
const modules = {
  '岗位管理模块': ['UC03','UC04','UC05','UC06','UC07'],
  '简历管理模块': ['UC08','UC09','UC10','UC11'],
  '面试管理模块': ['UC12','UC13','UC14'],
  '录用入职模块': ['UC15','UC16'],
  'AI智能功能模块': ['UC17','UC18'],
  '数据报表模块': ['UC19'],
  '差异化功能模块': ['UC20','UC21'],
  '系统管理模块': ['UC01','UC02','UC22'],
};

let ucIndex = 0;
for (const [mod, ucIds] of Object.entries(modules)) {
  children.push(h2('4.' + (Object.keys(modules).indexOf(mod) + 1) + ' ' + mod));
  for (const ucId of ucIds) {
    const uc = useCases.find(u => u.id === ucId);
    if (!uc) continue;
    ucIndex++;
    children.push(h3('用例 ' + uc.id + '：' + uc.name));
    children.push(boldP('用例编号：', uc.id));
    children.push(boldP('用例名称：', uc.name));
    children.push(boldP('参与者：', uc.actor));
    children.push(boldP('简要描述：', uc.desc));
    children.push(boldP('前置条件：', uc.pre));
    children.push(boldP('后置条件：', uc.post));
    children.push(p(''));
  }
}

children.push(new Paragraph({ children: [new TextRun('')], pageBreakBefore: true }));
children.push(h1('5. 非功能性需求'));
children.push(h2('5.1 性能需求'));
children.push(p('系统响应时间不超过3秒；支持同时在线用户数不少于50人；数据库查询在合理索引下不超过1秒。'));
children.push(h2('5.2 安全需求'));
children.push(p('用户密码采用BCrypt加密存储；JWT Token有效期24小时；操作日志完整记录。'));
children.push(h2('5.3 可用性需求'));
children.push(p('系统可用性达到99%；关键操作有确认提示；错误信息友好可读。'));

const doc = new Document({
  sections: [{
    properties: {
      page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } },
    },
    headers: { default: new Header({ children: [new Paragraph({ children: [new TextRun('人力资源招聘管理系统 — 需求分析规格说明书')], alignment: AlignmentType.CENTER })] }) },
    footers: { default: new Footer({ children: [new Paragraph({ children: [new TextRun('第 '), new TextRun({ children: [PageNumber.CURRENT] }), new TextRun(' 页')], alignment: AlignmentType.CENTER })] }) },
    children,
  }],
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync('2. 需求分析规格说明书-组号.docx', buf);
  console.log('Done: 需求分析规格说明书-组号.docx');
});
