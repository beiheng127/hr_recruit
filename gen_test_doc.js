const fs = require('fs');
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
        AlignmentType, WidthType, BorderStyle, ShadingType, VerticalAlign,
        HeadingLevel, PageNumber, Header, Footer } = require('docx');

// ========== 软件测试分析报告 ==========
// 测试用例与用例规约对齐，实际输出/结果/分析留空

const testCases = [
  // 登录模块
  { id: 'TC01', name: '正常登录', module: '登录模块', pre: '用户未登录', steps: '1.输入正确账号密码 2.点击登录', expect: '登录成功，跳转首页', actual: '', result: '', analysis: '' },
  { id: 'TC02', name: '错误密码登录', module: '登录模块', pre: '用户未登录', steps: '1.输入正确账号 2.输入错误密码 3.点击登录', expect: '提示"账号或密码错误"', actual: '', result: '', analysis: '' },
  { id: 'TC03', name: '空账号登录', module: '登录模块', pre: '用户未登录', steps: '1.账号密码留空 2.点击登录', expect: '提示"请输入账号和密码"', actual: '', result: '', analysis: '' },

  // 岗位管理模块
  { id: 'TC04', name: '新建岗位保存', module: '岗位管理', pre: 'HR已登录', steps: '1.点新建 2.填岗位名称/部门/要求 3.点保存', expect: '提示保存成功，列表显示新岗位', actual: '', result: '', analysis: '' },
  { id: 'TC05', name: '发布岗位', module: '岗位管理', pre: '岗位状态为草稿', steps: '1.选草稿岗位 2.点发布', expect: '状态变为已发布', actual: '', result: '', analysis: '' },
  { id: 'TC06', name: '关闭岗位', module: '岗位管理', pre: '岗位状态为已发布', steps: '1.选已发布岗位 2.点关闭', expect: '状态变为已关闭，不再接收投递', actual: '', result: '', analysis: '' },
  { id: 'TC07', name: '编辑岗位', module: '岗位管理', pre: '岗位为草稿或已关闭', steps: '1.点编辑 2.修改信息 3.保存', expect: '信息更新成功', actual: '', result: '', analysis: '' },

  // 简历管理模块
  { id: 'TC08', name: '上传简历文件', module: '简历管理', pre: 'HR已登录', steps: '1.点上传 2.选文件 3.确认', expect: '文件上传成功，简历记录创建', actual: '', result: '', analysis: '' },
  { id: 'TC09', name: 'AI解析简历', module: '简历管理', pre: '简历文件已上传', steps: '1.点解析按钮', expect: '解析成功，结构化信息显示', actual: '', result: '', analysis: '' },
  { id: 'TC10', name: '查询简历列表', module: '简历管理', pre: '系统中有简历数据', steps: '1.进入简历列表 2.输入关键词搜索', expect: '列表显示匹配结果', actual: '', result: '', analysis: '' },

  // 面试管理模块
  { id: 'TC11', name: '安排面试', module: '面试管理', pre: '简历已投递岗位', steps: '1.选简历 2.点安排面试 3.填时间/地点/面试官', expect: '面试安排成功，通知发送', actual: '', result: '', analysis: '' },
  { id: 'TC12', name: '填写面试评价', module: '面试管理', pre: '面试已完成', steps: '1.进入面试记录 2.填写评分和评价 3.保存', expect: '评价保存成功', actual: '', result: '', analysis: '' },
  { id: 'TC13', name: 'AI生成评价摘要', module: '面试管理', pre: '有多条面试评价', steps: '1.点生成摘要', expect: 'AI摘要生成成功', actual: '', result: '', analysis: '' },

  // 录用入职模块
  { id: 'TC14', name: '发送Offer', module: '录用入职', pre: '面试通过', steps: '1.选候选人 2.点发Offer 3.填薪资/入职时间', expect: 'Offer生成成功，候选人收到通知', actual: '', result: '', analysis: '' },
  { id: 'TC15', name: '确认入职', module: '录用入职', pre: '候选人接受Offer', steps: '1.点确认入职', expect: '状态变已入职，员工档案创建', actual: '', result: '', analysis: '' },

  // AI功能模块
  { id: 'TC16', name: 'AI生成岗位JD', module: 'AI功能', pre: 'HR已登录', steps: '1.进入AI中心 2.填岗位信息 3.点生成JD', expect: 'JD文本生成成功', actual: '', result: '', analysis: '' },
  { id: 'TC17', name: 'AI匹配评分', module: 'AI功能', pre: '简历和岗位均存在', steps: '1.选简历和岗位 2.点匹配评分', expect: '匹配评分生成并显示', actual: '', result: '', analysis: '' },
  { id: 'TC18', name: 'AI智能问答', module: 'AI功能', pre: 'HR已登录', steps: '1.进入AI中心 2.输入招聘相关问题 3.发送', expect: '返回专业回答', actual: '', result: '', analysis: '' },

  // 差异化功能模块
  { id: 'TC19', name: '招聘管道看板拖拽', module: '差异化功能', pre: '有候选人数据', steps: '1.进入管道看板 2.拖拽候选人到下一阶段', expect: '阶段更新成功，触发通知', actual: '', result: '', analysis: '' },
  { id: 'TC20', name: '数据大屏查看', module: '差异化功能', pre: 'HR已登录', steps: '1.进入数据大屏', expect: '显示各维度统计数据', actual: '', result: '', analysis: '' },
  { id: 'TC21', name: '候选人加入人才库', module: '差异化功能', pre: '简历存在', steps: '1.选简历 2.点加入人才库', expect: '状态更新为人才库', actual: '', result: '', analysis: '' },
  { id: 'TC22', name: '全文搜索简历', module: '差异化功能', pre: '有简历数据', steps: '1.输入关键词搜索', expect: '返回匹配的简历列表', actual: '', result: '', analysis: '' },
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
function p(text, align = 'left') {
  return new Paragraph({ children: [new TextRun(text || '')], alignment: align === 'center' ? AlignmentType.CENTER : AlignmentType.LEFT, spacing: { after: 80 } });
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

const children = [
  // 封面
  new Paragraph({ children: [new TextRun({ text: '人力资源招聘管理系统', bold: true, size: 48 })], alignment: AlignmentType.CENTER, spacing: { before: 3000, after: 400 } }),
  new Paragraph({ children: [new TextRun({ text: '软件测试分析报告', bold: true, size: 36 })], alignment: AlignmentType.CENTER, spacing: { after: 600 } }),
  new Paragraph({ children: [new TextRun('版本：V1.0')], alignment: AlignmentType.CENTER, spacing: { after: 200 } }),
  new Paragraph({ children: [new TextRun('日期：2026年6月')], alignment: AlignmentType.CENTER, spacing: { after: 3000 } }),
  new Paragraph({ children: [new TextRun('')], pageBreakBefore: true }),

  h1('1. 引言'),
  h2('1.1 编写目的'),
  p('本文档记录系统测试过程与结果，验证系统功能是否符合需求规格说明。'),
  h2('1.2 测试范围'),
  p('测试覆盖所有功能模块：登录、岗位管理、简历管理、面试管理、录用入职、AI功能、差异化功能。'),
  new Paragraph({ children: [new TextRun('')], pageBreakBefore: true }),

  h1('2. 测试环境'),
  makeTable(['项目', '描述'], [
    ['操作系统', 'Windows 11 / macOS'],
    ['浏览器', 'Chrome 120+'],
    ['后端', 'Spring Boot 3.2 + MySQL 8.0'],
    ['前端', 'Vue 3 + Element Plus'],
    ['AI服务', 'DeepSeek API（Spring AI调用）'],
  ]),
  new Paragraph({ children: [new TextRun('')], spacing: { after: 200 } }),
  new Paragraph({ children: [new TextRun('')], pageBreakBefore: true }),

  h1('3. 测试用例与结果'),
  p('注：实际输出、测试结果、测试结果分析三列待系统开发完成后填写。'),
  new Paragraph({ children: [new TextRun('')], spacing: { after: 200 } }),
];

// 按模块分组输出测试用例
const modules = [...new Set(testCases.map(tc => tc.module))];
let modIdx = 0;
for (const mod of modules) {
  modIdx++;
  children.push(h2(`3.${modIdx} ${mod}测试`));
  const modCases = testCases.filter(tc => tc.module === mod);
  children.push(makeTable(
    ['用例编号', '用例名称', '前置条件', '测试步骤', '预期输出', '实际输出', '测试结果', '测试结果分析'],
    modCases.map(tc => [tc.id, tc.name, tc.pre, tc.steps, tc.expect, tc.actual, tc.result, tc.analysis])
  ));
  children.push(new Paragraph({ children: [new TextRun('')], spacing: { after: 200 } }));
}

children.push(new Paragraph({ children: [new TextRun('')], pageBreakBefore: true }));
children.push(h1('4. 测试结论'));
children.push(p('待系统开发完成后，根据测试用例执行结果填写本章。'));
children.push(p('预期结论：所有测试用例通过，系统功能符合需求规格说明，可以交付。'));

const doc = new Document({
  sections: [{
    properties: {
      page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } },
    },
    headers: { default: new Header({ children: [new Paragraph({ children: [new TextRun('人力资源招聘管理系统 — 软件测试分析报告')], alignment: AlignmentType.CENTER })] }) },
    footers: { default: new Footer({ children: [new Paragraph({ children: [new TextRun('第 '), new TextRun({ children: [PageNumber.CURRENT] }), new TextRun(' 页')], alignment: AlignmentType.CENTER })] }) },
    children,
  }],
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync('4. 软件测试分析报告-组号.docx', buf);
  console.log('Done: 软件测试分析报告-组号.docx');
});
