const docx = require('docx');
const fs = require('fs');
const { Document, Packer, Paragraph, TextRun, Table, TableCell, TableRow, WidthType, AlignmentType, HeadingLevel, BorderStyle, VerticalAlign, Header, Footer, PageNumber } = docx;

const C_BLACK = '000000';
const C_ORANGE = 'FF8C00';
const C_WHITE = 'FFFFFF';

function h(level, text) {
    return new Paragraph({
        text,
        heading: level,
        spacing: { before: 200, after: 120 }
    });
}
function p(text, opts = {}) {
    return new Paragraph({
        children: [new TextRun({ text, ...opts })],
        spacing: { before: 60, after: 60 },
        alignment: opts.align || AlignmentType.JUSTIFIED
    });
}
function bold(text) {
    return new Paragraph({
        children: [new TextRun({ text, bold: true })],
        spacing: { before: 80, after: 60 }
    });
}

const thinBorder = {
    top: { style: BorderStyle.SINGLE, size: 1, color: C_BLACK },
    bottom: { style: BorderStyle.SINGLE, size: 1, color: C_BLACK },
    left: { style: BorderStyle.SINGLE, size: 1, color: C_BLACK },
    right: { style: BorderStyle.SINGLE, size: 1, color: C_BLACK }
};

function cell(text, opts = {}) {
    return new TableCell({
        children: [new Paragraph({
            children: [new TextRun({ text, bold: opts.bold, size: 21, font: '宋体' })],
            alignment: opts.align || AlignmentType.LEFT,
            spacing: { before: 40, after: 40 }
        })],
        borders: thinBorder,
        width: { size: opts.width || 50, type: WidthType.PERCENTAGE },
        shading: opts.shading ? { fill: opts.shading } : undefined,
        verticalAlign: VerticalAlign.CENTER
    });
}

function cellMultiline(lines, opts = {}) {
    return new TableCell({
        children: lines.map(line => new Paragraph({
            children: [new TextRun({ text: line, size: 21, font: '宋体' })],
            alignment: AlignmentType.LEFT,
            spacing: { before: 20, after: 20 }
        })),
        borders: thinBorder,
        width: { size: opts.width || 50, type: WidthType.PERCENTAGE },
        shading: opts.shading ? { fill: opts.shading } : undefined,
        verticalAlign: VerticalAlign.CENTER
    });
}

function makeUseCaseTable(uc) {
    const rows = [];
    // Header
    rows.push(new TableRow({
        children: [
            cell('项目', { bold: true, align: AlignmentType.CENTER, width: 25, shading: C_ORANGE }),
            cell('内容描述', { bold: true, align: AlignmentType.CENTER, width: 75, shading: C_ORANGE })
        ],
        tableHeader: true
    }));
    // Data rows
    const data = [
        ['用例编号', uc.id],
        ['用例名称', uc.name],
        ['用例描述', uc.desc],
        ['参与者', uc.actor],
        ['前置条件', uc.pre],
        ['触发条件', uc.trigger],
        ['后置条件', uc.post],
    ];
    data.forEach(([label, val]) => {
        rows.push(new TableRow({
            children: [
                cell(label, { bold: true, align: AlignmentType.CENTER, width: 25 }),
                cell(val || '', { width: 75 })
            ]
        }));
    });
    // Normal flow (multiline)
    const normalLines = uc.normal.map((s, i) => `${i + 1}.${s}`);
    rows.push(new TableRow({
        children: [
            cell('正常流程', { bold: true, align: AlignmentType.CENTER, width: 25 }),
            cellMultiline(normalLines, { width: 75 })
        ]
    }));
    // Extension flow
    const extLines = uc.ext.map(s => s);
    rows.push(new TableRow({
        children: [
            cell('扩展流程', { bold: true, align: AlignmentType.CENTER, width: 25 }),
            cellMultiline(extLines, { width: 75 })
        ]
    }));
    // Special requirements
    const specLines = uc.special.map((s, i) => `${i + 1}.${s}`);
    rows.push(new TableRow({
        children: [
            cell('特殊需求', { bold: true, align: AlignmentType.CENTER, width: 25 }),
            cellMultiline(specLines, { width: 75 })
        ]
    }));
    // Author
    rows.push(new TableRow({
        children: [
            cell('编写人', { bold: true, align: AlignmentType.CENTER, width: 25 }),
            cell('李亚恒', { width: 75 })
        ]
    }));

    return new Table({
        rows,
        width: { size: 100, type: WidthType.PERCENTAGE }
    });
}

// ============== Use Cases ==============
const useCases = [
    {
        id: 'UC01', name: '登录系统', actor: 'HR专员/部门经理/系统管理员/候选人',
        desc: '系统用户通过输入用户名和密码完成身份认证，获取系统访问权限。',
        pre: '用户已拥有系统账号，账号状态为正常。',
        trigger: '用户访问系统登录页面并点击"登录"按钮。',
        post: '登录成功：系统生成JWT Token并记录登录日志，跳转至系统首页；登录失败：系统提示错误信息，不生成Token。',
        normal: [
            '用户打开系统登录页面，启动用例；',
            '系统显示登录界面，要求输入用户名和密码；',
            '用户输入用户名和密码，点击"登录"按钮；',
            '系统验证用户名和密码的正确性；',
            '系统验证账号状态是否正常；',
            '系统生成JWT Token并记录登录日志，提示登录成功，用例结束。'
        ],
        ext: [
            '3a.如果用户未输入用户名或密码，系统提示"用户名和密码不能为空"，返回基本流步骤2；',
            '4a.如果用户名或密码不正确，系统提示"用户名或密码错误"，返回基本流步骤2；',
            '5a.如果账号已被禁用，系统提示"账号已被禁用，请联系管理员"，用例结束；',
            '5b.如果账号连续登录失败超过5次，系统提示"账号已被锁定，请30分钟后重试"，用例结束。'
        ],
        special: [
            '密码必须经过MD5加密后传输；',
            '系统必须记录每次登录操作的IP地址和时间；',
            'Token有效期为24小时。'
        ]
    },
    {
        id: 'UC02', name: '退出登录', actor: 'HR专员/部门经理/系统管理员/候选人',
        desc: '已登录用户主动退出系统，清除当前会话状态。',
        pre: '用户已登录系统。',
        trigger: '用户点击系统右上角"退出登录"按钮。',
        post: '系统清除用户会话和本地Token，跳转至登录页面。',
        normal: [
            '用户点击"退出登录"按钮，启动用例；',
            '系统弹出确认对话框，询问是否确认退出；',
            '用户点击"确认"按钮；',
            '系统清除本地Token和会话状态；',
            '系统记录登出日志，跳转至登录页面，用例结束。'
        ],
        ext: [
            '3a.如果用户点击"取消"按钮，系统关闭对话框，保持当前页面，用例结束；',
            '4a.如果Token已过期，系统直接跳转至登录页面，用例结束。'
        ],
        special: [
            '退出操作必须在1秒内完成响应；',
            '登出日志必须包含登出时间和用户ID。'
        ]
    },
    {
        id: 'UC03', name: '新建招聘岗位', actor: 'HR专员',
        desc: 'HR专员创建新的招聘岗位信息，填写岗位名称、所属部门、薪资范围、工作地点、岗位职责及任职要求等。',
        pre: 'HR专员已登录系统，拥有岗位管理权限。',
        trigger: 'HR专员进入岗位管理页面，点击"新建岗位"按钮。',
        post: '岗位信息成功保存到数据库，状态为"草稿"，系统提示创建成功。',
        normal: [
            'HR专员进入岗位管理页面，点击"新建岗位"按钮，启动用例；',
            '系统显示岗位信息录入表单；',
            'HR专员输入岗位名称、所属部门、薪资范围、工作地点、岗位职责、任职要求等信息；',
            'HR专员选择招聘流程模板或自定义流程；',
            '系统校验输入数据的完整性和合法性；',
            'HR专员点击"保存"按钮；',
            '系统将岗位信息保存到数据库，状态设为"草稿"；',
            '系统提示"岗位创建成功"，用例结束。'
        ],
        ext: [
            '5a.如果必填项未填写完整，系统提示"请完善必填信息"，返回基本流步骤3；',
            '5b.如果薪资范围格式不正确，系统提示"薪资范围格式错误"，返回基本流步骤3；',
            '5c.如果岗位名称已存在，系统提示"该岗位名称已存在"，返回基本流步骤3；',
            '6a.如果HR专员点击"取消"按钮，系统放弃保存并返回列表页，用例结束。'
        ],
        special: [
            '岗位名称为必填项，长度不超过50个字符；',
            '薪资范围格式为"最低薪资-最高薪资"，单位为元/月；',
            '岗位描述支持富文本编辑。'
        ]
    },
    {
        id: 'UC04', name: '发布招聘岗位', actor: 'HR专员',
        desc: 'HR专员将已创建的岗位状态从"草稿"变更为"招聘中"，岗位信息对外可见。',
        pre: 'HR专员已登录系统；存在状态为"草稿"的岗位。',
        trigger: 'HR专员在岗位列表中选择"草稿"状态的岗位，点击"发布"按钮。',
        post: '岗位状态变为"招聘中"，候选人可在投递页面看到该岗位。',
        normal: [
            'HR专员进入岗位管理页面，查看岗位列表，启动用例；',
            '系统显示所有岗位及其状态；',
            'HR专员选择一个状态为"草稿"的岗位；',
            'HR专员点击"发布"按钮；',
            '系统校验岗位信息是否完整；',
            '系统将岗位状态更新为"招聘中"；',
            '系统提示"岗位发布成功"，用例结束。'
        ],
        ext: [
            '5a.如果岗位信息不完整（缺少必填项），系统提示"岗位信息不完整，请先编辑完善"，返回基本流步骤2；',
            '3a.如果HR专员选择的岗位状态不是"草稿"，系统提示"只能发布草稿状态的岗位"，用例结束。'
        ],
        special: [
            '已发布的岗位不允许直接删除，需先关闭；',
            '发布操作必须记录操作日志。'
        ]
    },
    {
        id: 'UC05', name: '关闭招聘岗位', actor: 'HR专员',
        desc: 'HR专员将招聘中的岗位关闭，停止接受新的候选人投递。',
        pre: 'HR专员已登录系统；存在状态为"招聘中"的岗位。',
        trigger: 'HR专员在岗位列表中选择"招聘中"状态的岗位，点击"关闭"按钮。',
        post: '岗位状态变为"已关闭"，不再接受新的候选人投递，但历史投递记录保留。',
        normal: [
            'HR专员进入岗位管理页面，查看岗位列表，启动用例；',
            '系统显示所有岗位及其状态；',
            'HR专员选择一个状态为"招聘中"的岗位；',
            'HR专员点击"关闭"按钮；',
            '系统弹出确认对话框；',
            'HR专员点击"确认"按钮；',
            '系统将岗位状态更新为"已关闭"；',
            '系统提示"岗位已关闭"，用例结束。'
        ],
        ext: [
            '6a.如果HR专员点击"取消"按钮，系统关闭对话框，保持岗位状态不变，用例结束；',
            '3a.如果选择的岗位状态不是"招聘中"，系统提示"只能关闭招聘中的岗位"，用例结束。'
        ],
        special: [
            '关闭岗位不影响已投递候选人的面试安排；',
            '关闭操作必须记录操作日志。'
        ]
    },
    {
        id: 'UC06', name: '查询招聘岗位', actor: 'HR专员/部门经理/系统管理员/候选人',
        desc: '用户根据岗位名称、部门、状态等条件查询招聘岗位列表。',
        pre: '用户已登录系统（候选人可查看公开岗位无需登录）。',
        trigger: '用户进入岗位列表页面或在搜索框中输入查询条件后点击"查询"按钮。',
        post: '系统展示符合查询条件的岗位列表。',
        normal: [
            '用户进入岗位列表页面，启动用例；',
            '系统显示岗位列表和筛选条件区域；',
            '用户输入岗位名称关键词或选择部门、状态等筛选条件；',
            '用户点击"查询"按钮；',
            '系统根据条件检索数据库；',
            '系统展示符合条件的岗位列表，用例结束。'
        ],
        ext: [
            '3a.如果用户未输入任何条件直接点击"查询"，系统显示所有岗位列表；',
            '5a.如果没有符合条件的岗位，系统显示"暂无符合条件的数据"提示；',
            '5b.如果查询结果超过100条，系统进行分页展示，每页默认10条。'
        ],
        special: [
            '查询响应时间不超过2秒；',
            '岗位列表支持按创建时间、薪资范围排序；',
            '分页参数必须做安全校验。'
        ]
    },
    {
        id: 'UC07', name: '编辑招聘岗位', actor: 'HR专员',
        desc: 'HR专员对已创建的岗位信息进行修改和更新。',
        pre: 'HR专员已登录系统；存在可编辑的岗位。',
        trigger: 'HR专员在岗位列表中点击"编辑"按钮。',
        post: '岗位信息更新成功，系统提示保存成功。',
        normal: [
            'HR专员进入岗位管理页面，启动用例；',
            '系统显示岗位列表；',
            'HR专员选择需要编辑的岗位，点击"编辑"按钮；',
            '系统加载该岗位的现有信息并显示编辑表单；',
            'HR专员修改岗位信息；',
            '系统校验修改后数据的合法性；',
            'HR专员点击"保存"按钮；',
            '系统更新数据库中的岗位信息；',
            '系统提示"岗位信息更新成功"，用例结束。'
        ],
        ext: [
            '6a.如果必填项未填写完整，系统提示"请完善必填信息"，返回基本流步骤5；',
            '7a.如果HR专员点击"取消"按钮，系统放弃修改并返回列表页，用例结束；',
            '3a.如果选择的岗位已关闭且不允许编辑，系统提示"已关闭岗位不允许编辑"，用例结束。'
        ],
        special: [
            '已发布的岗位编辑后不影响已投递候选人的流程；',
            '编辑操作必须记录操作日志。'
        ]
    },
    {
        id: 'UC08', name: '上传并解析简历', actor: 'HR专员',
        desc: 'HR专员上传候选人简历文件，系统自动解析提取关键信息并生成简历记录。',
        pre: 'HR专员已登录系统。',
        trigger: 'HR专员进入简历管理页面，点击"上传简历"按钮并选择文件。',
        post: '简历文件保存到服务器，系统提取候选人姓名、联系方式、教育经历、工作经历等信息并创建简历记录。',
        normal: [
            'HR专员进入简历管理页面，点击"上传简历"按钮，启动用例；',
            '系统显示文件上传对话框，支持PDF、DOC、DOCX格式；',
            'HR专员选择本地简历文件；',
            '系统校验文件格式和大小（不超过10MB）；',
            'HR专员点击"确认上传"按钮；',
            '系统将文件保存到服务器指定目录；',
            '系统调用解析服务提取简历中的关键信息；',
            '系统创建简历记录并关联解析结果；',
            '系统提示"简历上传并解析成功"，用例结束。'
        ],
        ext: [
            '4a.如果文件格式不支持，系统提示"仅支持PDF、DOC、DOCX格式"，返回基本流步骤2；',
            '4b.如果文件大小超过10MB，系统提示"文件大小不能超过10MB"，返回基本流步骤2；',
            '7a.如果解析失败，系统保存文件但标记解析状态为"待处理"，提示"文件上传成功，解析待处理"，用例结束。'
        ],
        special: [
            '文件上传必须使用HTTPS传输；',
            '文件名需要做安全过滤，防止路径遍历攻击；',
            '解析失败的通知需通过WebSocket推送给HR专员。'
        ]
    },
    {
        id: 'UC09', name: '查询简历列表', actor: 'HR专员/部门经理',
        desc: 'HR专员或部门经理根据候选人姓名、技能、学历等条件查询简历。',
        pre: '用户已登录系统，拥有简历查看权限。',
        trigger: '用户进入简历管理页面，或在搜索框输入条件后点击"查询"按钮。',
        post: '系统展示符合查询条件的简历列表。',
        normal: [
            '用户进入简历管理页面，启动用例；',
            '系统显示简历列表和筛选条件区域；',
            '用户输入候选人姓名关键词、技能标签或选择学历要求等条件；',
            '用户点击"查询"按钮；',
            '系统根据条件检索数据库（支持MySQL全文搜索）；',
            '系统展示符合条件的简历列表，用例结束。'
        ],
        ext: [
            '3a.如果用户未输入条件直接点击"查询"，系统显示所有简历列表；',
            '5a.如果没有符合条件的简历，系统显示"暂无符合条件的简历"提示；',
            '5b.如果查询结果超过100条，系统进行分页展示。'
        ],
        special: [
            '简历查询响应时间不超过3秒；',
            '支持MySQL全文搜索（ngram分词）；',
            '查询结果中候选人联系方式需脱敏展示（部分隐藏）。'
        ]
    },
    {
        id: 'UC10', name: '查看简历详情', actor: 'HR专员/部门经理',
        desc: '用户查看单个候选人的完整简历信息，包括教育经历、工作经历、技能等。',
        pre: '用户已登录系统；存在已上传的简历记录。',
        trigger: '用户在简历列表中点击某条简历记录。',
        post: '系统展示该候选人的完整简历详情页面。',
        normal: [
            '用户在简历列表中点击某条简历记录，启动用例；',
            '系统根据简历ID查询数据库；',
            '系统加载候选人的基本信息、教育经历、工作经历、技能标签、附件列表；',
            '系统显示简历详情页面，用例结束。'
        ],
        ext: [
            '2a.如果简历ID不存在，系统提示"简历不存在或已被删除"，返回列表页，用例结束；',
            '3a.如果简历附件文件已损坏，系统提示"附件预览失败"，但仍展示文本解析结果。'
        ],
        special: [
            '查看简历详情操作需记录操作日志；',
            '简历详情页支持在线预览附件文件。'
        ]
    },
    {
        id: 'UC11', name: '候选人投递岗位', actor: '候选人',
        desc: '候选人浏览招聘中的岗位列表，选择感兴趣的岗位并提交个人申请。',
        pre: '候选人已登录系统（或作为访客投递）；目标岗位状态为"招聘中"。',
        trigger: '候选人在岗位详情页点击"立即投递"按钮。',
        post: '系统创建投递记录，关联候选人与岗位，状态为"待筛选"。',
        normal: [
            '候选人浏览岗位列表，选择感兴趣的岗位，启动用例；',
            '系统显示岗位详情页面；',
            '候选人点击"立即投递"按钮；',
            '系统校验候选人是否已登录；',
            '系统校验候选人是否已完善简历信息；',
            '系统校验候选人是否已投递过该岗位；',
            '系统创建投递记录，状态设为"待筛选"；',
            '系统提示"投递成功"，用例结束。'
        ],
        ext: [
            '4a.如果候选人未登录，系统跳转至登录页面，登录后返回基本流步骤3；',
            '5a.如果候选人未完善简历，系统提示"请先完善个人简历"，跳转至简历编辑页，用例结束；',
            '6a.如果候选人已投递过该岗位，系统提示"您已投递过该岗位，请勿重复投递"，用例结束。'
        ],
        special: [
            '同一候选人不能重复投递同一岗位；',
            '投递记录必须包含投递时间和来源渠道（如官网、内推等）。'
        ]
    },
    {
        id: 'UC12', name: '安排面试', actor: 'HR专员',
        desc: 'HR专员为通过初筛的候选人安排面试，确定面试时间、地点、形式（线上/线下）及面试官。',
        pre: 'HR专员已登录系统；存在状态为"待面试"的候选人投递记录。',
        trigger: 'HR专员在候选人列表中选择候选人，点击"安排面试"按钮。',
        post: '系统创建面试安排记录，发送通知给候选人和面试官，更新候选人状态为"面试中"。',
        normal: [
            'HR专员进入候选人管理页面，启动用例；',
            '系统显示候选人列表（筛选状态为"待面试"）；',
            'HR专员选择一个候选人，点击"安排面试"按钮；',
            '系统显示面试安排表单；',
            'HR专员选择面试类型（初试/复试）、面试形式（线上/线下）、面试时间、面试地点；',
            'HR专员从系统中选择面试官（支持多选）；',
            '系统校验面试时间的有效性（不能为过去时间）；',
            'HR专员点击"确认安排"按钮；',
            '系统创建面试安排记录；',
            '系统发送通知给候选人和面试官（邮件+WebSocket实时推送）；',
            '系统更新候选人状态为"面试中"；',
            '系统提示"面试安排成功"，用例结束。'
        ],
        ext: [
            '7a.如果面试时间早于当前时间，系统提示"面试时间不能早于当前时间"，返回基本流步骤5；',
            '7b.如果面试官在选定时间已有其他面试安排，系统提示"该面试官时间冲突"，返回基本流步骤6；',
            '8a.如果HR专员点击"取消"按钮，系统放弃安排并返回列表页，用例结束。'
        ],
        special: [
            '面试时间必须精确到分钟；',
            '每位面试官同一时间段只能安排一场面试；',
            '面试安排通知必须通过邮件和WebSocket双通道发送。'
        ]
    },
    {
        id: 'UC13', name: '填写面试评价', actor: '部门经理/面试官',
        desc: '面试官在面试结束后填写对候选人的评价，包括专业技能、沟通能力、综合评价及是否推荐录用。',
        pre: '面试官已登录系统；存在已完成的面试安排记录。',
        trigger: '面试官进入面试评价页面，选择对应的面试记录点击"填写评价"按钮。',
        post: '面试评价保存成功，系统更新候选人状态，若所有面试官均评价完毕则触发AI摘要生成。',
        normal: [
            '面试官进入面试管理页面，启动用例；',
            '系统显示面试官负责的所有面试记录；',
            '面试官选择一条已完成的面试记录，点击"填写评价"按钮；',
            '系统显示面试评价表单；',
            '面试官对候选人的专业技能、沟通能力、团队协作等方面进行评分（1-5分）；',
            '面试官填写综合评价文字描述及是否推荐录用；',
            '系统校验评分完整性；',
            '面试官点击"提交评价"按钮；',
            '系统保存面试评价记录；',
            '系统检查是否所有面试官均已提交评价；',
            '如果全部提交完毕，系统自动触发AI生成面试评价摘要；',
            '系统提示"评价提交成功"，用例结束。'
        ],
        ext: [
            '7a.如果必填评分项未填写，系统提示"请完成所有必填评分项"，返回基本流步骤5；',
            '3a.如果面试记录状态不是"已完成"，系统提示"只能对已完成的面试进行评价"，用例结束；',
            '10a.如果仅部分面试官提交评价，系统更新候选人状态为"面试评价中"，用例结束。'
        ],
        special: [
            '评分项必须包含专业技能、沟通能力、团队协作、综合评价四个维度；',
            '面试官提交评价后不允许修改（如需修改需管理员权限）；',
            '评价内容支持富文本编辑。'
        ]
    },
    {
        id: 'UC14', name: 'AI生成面试评价摘要', actor: '系统（AI）',
        desc: '当一轮面试的所有面试官均提交评价后，系统自动调用AI服务对多份评价进行汇总分析，生成综合评价摘要。',
        pre: '某轮面试的所有面试官均已提交评价；系统已配置DeepSeek API Key。',
        trigger: '最后一名面试官提交评价后，系统自动触发。',
        post: '系统生成面试评价摘要文本，保存到面试记录中，供HR专员和部门经理查看。',
        normal: [
            '最后一名面试官提交评价，启动用例；',
            '系统检测到该轮面试所有面试官均已评价完毕；',
            '系统收集所有面试官的评分和评价文本；',
            '系统构造AI提示词（Prompt），包含候选人信息和所有评价内容；',
            '系统调用DeepSeek API生成综合评价摘要；',
            '系统接收AI返回的摘要文本；',
            '系统将摘要保存到面试记录的summary字段；',
            '系统通过WebSocket推送通知给HR专员和部门经理；',
            '用例结束。'
        ],
        ext: [
            '5a.如果DeepSeek API调用失败，系统记录错误日志，标记摘要状态为"生成失败"，用例结束；',
            '5b.如果AI返回内容不符合预期格式，系统尝试重新生成一次，若仍失败则标记"需人工复核"，用例结束。'
        ],
        special: [
            'AI摘要生成必须在30秒内完成；',
            'API调用失败时需有降级策略（标记为待处理）；',
            '摘要内容需做敏感信息过滤。'
        ]
    },
    {
        id: 'UC15', name: '发送录用通知（Offer）', actor: 'HR专员',
        desc: 'HR专员对通过面试的候选人发送录用通知（Offer），包含薪资、入职时间、报到地点等信息。',
        pre: 'HR专员已登录系统；候选人面试评价结果为"推荐录用"。',
        trigger: 'HR专员在候选人列表中选择"面试通过"状态的候选人，点击"发送Offer"按钮。',
        post: '系统创建Offer记录，发送录用通知邮件给候选人，更新候选人状态为"Offer已发送"。',
        normal: [
            'HR专员进入候选人管理页面，筛选"面试通过"状态的候选人，启动用例；',
            '系统显示候选人列表；',
            'HR专员选择一个候选人，点击"发送Offer"按钮；',
            '系统显示Offer编辑页面，预填候选人信息和岗位薪资范围；',
            'HR专员录入最终薪资、入职时间、报到地点、试用期时长等信息；',
            '系统校验Offer信息的完整性；',
            'HR专员选择通知模板并点击"发送"按钮；',
            '系统创建Offer记录；',
            '系统发送录用通知邮件给候选人；',
            '系统更新候选人状态为"Offer已发送"；',
            '系统提示"Offer发送成功"，用例结束。'
        ],
        ext: [
            '6a.如果必填项未填写完整，系统提示"请完善Offer信息"，返回基本流步骤5；',
            '6b.如果最终薪资超出岗位薪资范围，系统提示"薪资超出岗位设定范围，请确认"，HR专员可选择继续或修改；',
            '3a.如果候选人状态不是"面试通过"，系统提示"只能向面试通过的候选人发送Offer"，用例结束。'
        ],
        special: [
            'Offer邮件必须通过系统邮件服务发送，支持邮件模板自定义；',
            'Offer发送后候选人需在7天内确认接受或拒绝；',
            '发送Offer操作必须记录操作日志。'
        ]
    },
    {
        id: 'UC16', name: '确认入职', actor: 'HR专员',
        desc: '候选人接受Offer后，HR专员确认候选人入职信息，创建员工档案并更新入职状态。',
        pre: 'HR专员已登录系统；候选人Offer状态为"已接受"。',
        trigger: 'HR专员在Offer管理页面选择"已接受"状态的候选人，点击"确认入职"按钮。',
        post: '系统创建员工档案记录，更新候选人状态为"已入职"，归档相关招聘材料。',
        normal: [
            'HR专员进入Offer管理页面，筛选"已接受"状态的候选人，启动用例；',
            '系统显示候选人列表；',
            'HR专员选择一个候选人，点击"确认入职"按钮；',
            '系统显示入职确认表单，预填候选人基本信息；',
            'HR专员录入工号、部门、入职日期等员工档案信息；',
            '系统校验档案信息的完整性；',
            'HR专员点击"确认入职"按钮；',
            '系统创建员工档案记录；',
            '系统更新候选人状态为"已入职"；',
            '系统归档该候选人的所有招聘相关材料；',
            '系统提示"入职确认成功"，用例结束。'
        ],
        ext: [
            '6a.如果必填项未填写完整，系统提示"请完善入职信息"，返回基本流步骤5；',
            '3a.如果候选人Offer状态不是"已接受"，系统提示"只能确认已接受Offer的候选人"，用例结束。'
        ],
        special: [
            '工号必须唯一，系统自动校验重复；',
            '入职确认后候选人流转状态不可逆；',
            '员工档案创建必须记录操作日志。'
        ]
    },
    {
        id: 'UC17', name: 'AI生成岗位JD', actor: 'HR专员',
        desc: 'HR专员输入岗位关键信息，系统自动调用AI服务生成专业的招聘岗位描述（JD）。',
        pre: 'HR专员已登录系统；系统已配置DeepSeek API Key。',
        trigger: 'HR专员在岗位创建/编辑页面点击"AI生成JD"按钮。',
        post: '系统调用DeepSeek API生成岗位JD文本，展示给HR专员，HR专员可选择采用或修改。',
        normal: [
            'HR专员进入岗位创建页面，启动用例；',
            '系统显示岗位信息录入表单；',
            'HR专员输入岗位名称、所属部门、核心要求等关键信息；',
            'HR专员点击"AI生成JD"按钮；',
            '系统校验输入信息是否足以生成JD；',
            '系统构造Prompt并调用DeepSeek API；',
            '系统接收AI生成的JD文本；',
            '系统将生成的JD展示在编辑框中；',
            'HR专员可查看、编辑或采用生成的JD；',
            '用例结束。'
        ],
        ext: [
            '5a.如果输入信息不足，系统提示"请至少填写岗位名称和部门"，返回基本流步骤3；',
            '7a.如果DeepSeek API调用失败，系统提示"AI服务暂不可用，请稍后重试"，用例结束；',
            '7b.如果AI返回内容为空或格式异常，系统提示"生成内容异常，请重试或手动编写"，用例结束。'
        ],
        special: [
            'AI生成请求需在15秒内完成；',
            '生成的JD必须包含岗位职责、任职要求、公司福利三部分；',
            'API调用需有重试机制（最多3次）。'
        ]
    },
    {
        id: 'UC18', name: 'AI候选人-岗位匹配评分', actor: 'HR专员/系统（AI）',
        desc: '系统自动对候选人的简历与目标岗位进行AI匹配分析，给出匹配度评分和推荐理由。',
        pre: 'HR专员已登录系统；存在候选人的简历记录和目标岗位信息；系统已配置DeepSeek API Key。',
        trigger: 'HR专员在候选人详情页点击"AI匹配分析"按钮，或在简历上传后自动触发。',
        post: '系统生成匹配评分报告（0-100分），包含匹配维度分析和推荐理由，保存到数据库。',
        normal: [
            'HR专员进入候选人详情页面，启动用例；',
            '系统显示候选人信息和"AI匹配分析"按钮；',
            'HR专员点击"AI匹配分析"按钮；',
            '系统校验候选人简历和岗位信息是否完整；',
            '系统构造Prompt，包含岗位JD和候选人简历信息；',
            '系统调用DeepSeek API进行匹配分析；',
            '系统接收AI返回的匹配评分（0-100分）和维度分析；',
            '系统将匹配结果保存到ai_match_record表；',
            '系统展示匹配评分报告给HR专员；',
            '用例结束。'
        ],
        ext: [
            '4a.如果候选人简历信息不完整，系统提示"候选人简历信息不完整，无法进行分析"，用例结束；',
            '6a.如果DeepSeek API调用失败，系统记录错误并提示"AI分析服务暂不可用"，用例结束；',
            '6b.如果API响应超时（超过30秒），系统提示"分析请求超时，请稍后重试"，用例结束。'
        ],
        special: [
            '匹配评分必须包含技能匹配度、经验匹配度、学历匹配度、综合评分四个维度；',
            '每次匹配分析需记录耗时和API调用成本；',
            '匹配结果支持导出为Excel报告。'
        ]
    },
    {
        id: 'UC19', name: '查看招聘数据大屏', actor: 'HR专员/部门经理/系统管理员',
        desc: '用户通过可视化大屏查看招聘数据实时统计信息，包括岗位数、简历数、面试数、入职数等关键指标。',
        pre: '用户已登录系统，拥有数据查看权限。',
        trigger: '用户点击导航栏"数据大屏"菜单进入大屏页面。',
        post: '系统展示招聘数据的实时统计图表和关键指标。',
        normal: [
            '用户点击"数据大屏"菜单，启动用例；',
            '系统加载大屏页面框架；',
            '系统查询数据库获取各维度统计数据（岗位统计、简历统计、面试统计、入职统计、渠道统计）；',
            '系统渲染ECharts图表（柱状图、饼图、折线图等）；',
            '大屏展示各招聘阶段转化率漏斗图；',
            '用例结束。'
        ],
        ext: [
            '3a.如果某类统计数据为空，系统显示"暂无数据"占位符，不影响其他图表展示；',
            '3b.如果数据库查询超时，系统展示缓存数据并提示"数据可能存在延迟"。'
        ],
        special: [
            '大屏页面加载时间不超过5秒；',
            '数据刷新频率不低于每5分钟一次；',
            '图表必须支持响应式布局，适配不同分辨率屏幕。'
        ]
    },
    {
        id: 'UC20', name: '管理招聘流程管道', actor: 'HR专员',
        desc: 'HR专员通过拖拽式看板管理候选人在各招聘阶段的流转，直观查看各阶段候选人数量。',
        pre: 'HR专员已登录系统；存在候选人投递记录。',
        trigger: 'HR专员进入"招聘管道"页面。',
        post: '系统展示按岗位分组的招聘看板，HR专员可将候选人卡片在不同阶段间拖拽移动。',
        normal: [
            'HR专员进入"招聘管道"页面，启动用例；',
            '系统显示岗位选择器和招聘流程看板；',
            'HR专员选择要查看的岗位；',
            '系统加载该岗位的招聘流程配置和候选人分布；',
            '系统展示各阶段（如待筛选、初筛通过、面试中、Offer发送、已入职）的候选人卡片；',
            'HR专员拖拽候选人卡片到目标阶段；',
            '系统校验目标阶段是否允许该状态的候选人进入；',
            '系统更新候选人的阶段状态；',
            '系统记录阶段变更日志；',
            '用例结束。'
        ],
        ext: [
            '4a.如果所选岗位未配置招聘流程，系统提示"请先为该岗位配置招聘流程"，用例结束；',
            '7a.如果目标阶段不允许当前状态进入（如从"已入职"拖拽回"面试中"），系统提示"非法的阶段流转"，候选人卡片返回原位置；',
            '7b.如果目标阶段人数达到上限（可配置），系统提示"该阶段人数已满"。'
        ],
        special: [
            '看板必须支持拖拽排序和跨列拖拽；',
            '每个阶段卡片显示候选人头像、姓名、当前评分、投递时间；',
            '阶段流转必须遵循预定义的流程规则，不允许逆向跳跃。'
        ]
    },
    {
        id: 'UC21', name: '管理通知模板', actor: '系统管理员',
        desc: '系统管理员对系统中的各类通知模板进行增删改查管理，包括面试通知、Offer通知、入职通知等。',
        pre: '系统管理员已登录系统。',
        trigger: '系统管理员进入"通知模板管理"页面。',
        post: '系统展示通知模板列表，管理员可进行新增、编辑、删除、启用/禁用操作。',
        normal: [
            '系统管理员进入"通知模板管理"页面，启动用例；',
            '系统显示所有通知模板列表（模板名称、类型、状态、更新时间）；',
            '系统管理员选择操作类型：',
            '  新增：点击"新增模板"按钮，填写模板名称、模板类型、标题、内容（支持变量占位符如{{name}}）；',
            '  编辑：选择模板点击"编辑"，修改模板内容；',
            '  删除：选择模板点击"删除"，系统弹出确认对话框；',
            '  启用/禁用：切换模板状态；',
            '系统校验输入数据的合法性；',
            '系统执行相应的数据库操作；',
            '系统提示操作成功，用例结束。'
        ],
        ext: [
            '6a.如果新增时模板名称已存在，系统提示"模板名称已存在"，返回编辑状态；',
            '6b.如果模板内容中包含非法变量格式，系统提示"变量格式不正确，请使用{{变量名}}格式"；',
            '4a.如果删除的是系统默认模板，系统提示"系统默认模板不允许删除"。'
        ],
        special: [
            '模板内容必须支持变量替换（{{name}}, {{position}}, {{time}}等）；',
            '每个模板类型至少保留一个启用状态的模板；',
            '模板编辑支持富文本编辑器和预览功能。'
        ]
    },
    {
        id: 'UC22', name: '查看操作日志', actor: '系统管理员',
        desc: '系统管理员查看系统中所有用户的操作日志，用于审计和问题追踪。',
        pre: '系统管理员已登录系统。',
        trigger: '系统管理员进入"操作日志"页面。',
        post: '系统展示操作日志列表，支持按用户、操作类型、时间范围等条件查询。',
        normal: [
            '系统管理员进入"操作日志"页面，启动用例；',
            '系统显示操作日志列表（默认显示最近7天的日志）；',
            '系统管理员可输入查询条件（用户名、操作类型、起始时间、终止时间）；',
            '系统管理员点击"查询"按钮；',
            '系统根据条件检索日志数据；',
            '系统展示符合条件的日志列表（包含操作人、操作时间、操作类型、操作内容、IP地址）；',
            '用例结束。'
        ],
        ext: [
            '3a.如果管理员未输入条件直接点击"查询"，系统显示最近30天的日志；',
            '5a.如果没有符合条件的日志，系统显示"暂无操作日志"；',
            '5b.如果查询时间范围超过90天，系统提示"查询时间范围不能超过90天"，返回基本流步骤3。'
        ],
        special: [
            '操作日志必须包含用户ID、操作时间、操作类型、操作详情、请求IP、操作结果；',
            '日志数据保留期限为1年，超期数据自动归档；',
            '日志查询响应时间不超过3秒。'
        ]
    }
];

// ============== Cover Page ==============
function coverTable() {
    return new Table({
        rows: [
            new TableRow({
                children: [
                    new TableCell({ children: [new Paragraph({ text: '山东理工大学', alignment: AlignmentType.CENTER, spacing: { before: 200, after: 200 } })], columnSpan: 2, borders: thinBorder, width: { size: 100, type: WidthType.PERCENTAGE } })
                ]
            }),
            new TableRow({
                children: [
                    new TableCell({ children: [new Paragraph({ text: '需求分析规格说明书', alignment: AlignmentType.CENTER, spacing: { before: 100, after: 100 } })], columnSpan: 2, borders: thinBorder })
                ]
            }),
            new TableRow({ children: [cell('项目名称', { bold: true, align: AlignmentType.CENTER, width: 30 }), cell('人力资源招聘管理系统', { width: 70 })] }),
            new TableRow({ children: [cell('所属团队', { bold: true, align: AlignmentType.CENTER, width: 30 }), cell('第13组', { width: 70 })] }),
            new TableRow({ children: [cell('组长姓名', { bold: true, align: AlignmentType.CENTER, width: 30 }), cell('李亚恒', { width: 70 })] }),
            new TableRow({ children: [cell('成员姓名', { bold: true, align: AlignmentType.CENTER, width: 30 }), cell('李亚恒', { width: 70 })] }),
            new TableRow({ children: [cell('指导教师', { bold: true, align: AlignmentType.CENTER, width: 30 }), cell('', { width: 70 })] }),
            new TableRow({ children: [cell('完成日期', { bold: true, align: AlignmentType.CENTER, width: 30 }), cell('2026年6月', { width: 70 })] }),
        ],
        width: { size: 100, type: WidthType.PERCENTAGE }
    });
}

// ============== Score Table ==============
function scoreTable() {
    return new Table({
        rows: [
            new TableRow({ children: [cell('考核项目', { bold: true, align: AlignmentType.CENTER, width: 20, shading: C_ORANGE }), cell('考核内容', { bold: true, align: AlignmentType.CENTER, width: 50, shading: C_ORANGE }), cell('分值', { bold: true, align: AlignmentType.CENTER, width: 15, shading: C_ORANGE }), cell('得分', { bold: true, align: AlignmentType.CENTER, width: 15, shading: C_ORANGE })] }),
            new TableRow({ children: [cell('工作量', { bold: true, align: AlignmentType.CENTER, width: 20 }), cell('项目组交付物数量、项目组工作量饱满程度', { width: 50 }), cell('20', { align: AlignmentType.CENTER, width: 15 }), cell('', { width: 15 })] }),
            new TableRow({ children: [cell('功能性', { bold: true, align: AlignmentType.CENTER, width: 20 }), cell('实现功能的完善程度、系统的健壮性', { width: 50 }), cell('20', { align: AlignmentType.CENTER, width: 15 }), cell('', { width: 15 })] }),
            new TableRow({ children: [cell('文档质量', { bold: true, align: AlignmentType.CENTER, width: 20 }), cell('文档内容的准确性、规范性和完整性', { width: 50 }), cell('15', { align: AlignmentType.CENTER, width: 15 }), cell('', { width: 15 })] }),
            new TableRow({ children: [cell('系统创新性', { bold: true, align: AlignmentType.CENTER, width: 20 }), cell('系统的创意程度、系统的技术含量', { width: 50 }), cell('15', { align: AlignmentType.CENTER, width: 15 }), cell('', { width: 15 })] }),
            new TableRow({ children: [cell('团队协作', { bold: true, align: AlignmentType.CENTER, width: 20 }), cell('项目组成员分工情况、项目组成员协作情况', { width: 50 }), cell('10', { align: AlignmentType.CENTER, width: 15 }), cell('', { width: 15 })] }),
            new TableRow({ children: [cell('表达能力', { bold: true, align: AlignmentType.CENTER, width: 20 }), cell('项目答辩过程中的表达能力、对问题的理解能力', { width: 50 }), cell('10', { align: AlignmentType.CENTER, width: 15 }), cell('', { width: 15 })] }),
            new TableRow({ children: [cell('系统演示', { bold: true, align: AlignmentType.CENTER, width: 20 }), cell('系统演示效果、系统操作的流畅程度', { width: 50 }), cell('10', { align: AlignmentType.CENTER, width: 15 }), cell('', { width: 15 })] }),
            new TableRow({ children: [cell('总分', { bold: true, align: AlignmentType.CENTER, width: 20, shading: C_ORANGE }), cell('100', { align: AlignmentType.CENTER, width: 50, shading: C_ORANGE }), cell('100', { align: AlignmentType.CENTER, width: 15, shading: C_ORANGE }), cell('', { width: 15, shading: C_ORANGE })] }),
        ],
        width: { size: 100, type: WidthType.PERCENTAGE }
    });
}

// ============== Team Table ==============
function teamTable() {
    return new Table({
        rows: [
            new TableRow({ children: [cell('组长', { bold: true, align: AlignmentType.CENTER, width: 20 }), cell('姓名', { bold: true, align: AlignmentType.CENTER, width: 20 }), cell('学号', { bold: true, align: AlignmentType.CENTER, width: 30 }), cell('成绩', { bold: true, align: AlignmentType.CENTER, width: 30 })] }),
            new TableRow({ children: [cell('是', { align: AlignmentType.CENTER, width: 20 }), cell('李亚恒', { align: AlignmentType.CENTER, width: 20 }), cell('', { align: AlignmentType.CENTER, width: 30 }), cell('', { width: 30 })] }),
            new TableRow({ children: [cell('成员', { bold: true, align: AlignmentType.CENTER, width: 20 }), cell('姓名', { bold: true, align: AlignmentType.CENTER, width: 20 }), cell('学号', { bold: true, align: AlignmentType.CENTER, width: 30 }), cell('成绩', { bold: true, align: AlignmentType.CENTER, width: 30 })] }),
            new TableRow({ children: [cell('', { align: AlignmentType.CENTER, width: 20 }), cell('', { align: AlignmentType.CENTER, width: 20 }), cell('', { align: AlignmentType.CENTER, width: 30 }), cell('', { width: 30 })] }),
        ],
        width: { size: 100, type: WidthType.PERCENTAGE }
    });
}

// ============== Use Case List Table ==============
function ucListTable() {
    const rows = [
        new TableRow({ children: [
            cell('参与者', { bold: true, align: AlignmentType.CENTER, width: 25, shading: C_ORANGE }),
            cell('用例编号', { bold: true, align: AlignmentType.CENTER, width: 15, shading: C_ORANGE }),
            cell('用例名称', { bold: true, align: AlignmentType.CENTER, width: 30, shading: C_ORANGE }),
            cell('简要描述', { bold: true, align: AlignmentType.CENTER, width: 30, shading: C_ORANGE })
        ]})
    ];
    useCases.forEach(uc => {
        rows.push(new TableRow({ children: [
            cell(uc.actor.split('/')[0], { align: AlignmentType.CENTER, width: 25 }),
            cell(uc.id, { align: AlignmentType.CENTER, width: 15 }),
            cell(uc.name, { align: AlignmentType.CENTER, width: 30 }),
            cell(uc.desc.substring(0, 30) + (uc.desc.length > 30 ? '...' : ''), { width: 30 })
        ] }));
    });
    return new Table({ rows, width: { size: 100, type: WidthType.PERCENTAGE } });
}

// ============== Build Document ==============
const children = [];

// Cover
children.push(coverTable());
children.push(new Paragraph({ spacing: { before: 400 } }));

// Score standard
children.push(h(HeadingLevel.HEADING_2, '评分标准'));
children.push(scoreTable());
children.push(new Paragraph({ spacing: { before: 200 } }));

// Team eval
children.push(h(HeadingLevel.HEADING_2, '成绩评价'));
children.push(teamTable());
children.push(new Paragraph({ spacing: { before: 200 } }));

// TOC placeholder
children.push(h(HeadingLevel.HEADING_1, '目录'));
children.push(p('（请在Word中右键点击此处→"更新域"→"更新整个目录"以生成自动目录）', { italics: true }));
children.push(new Paragraph({ pageBreakBefore: true }));

// Chapter 1
children.push(h(HeadingLevel.HEADING_1, '1 需求概述'));
children.push(h(HeadingLevel.HEADING_2, '1.1 文档目的'));
children.push(p('本文档为人力资源招聘管理系统（HR Recruit Management System）的需求分析规格说明书，旨在明确系统的功能需求、非功能需求及用例模型，为系统的设计、开发和测试提供依据。'));
children.push(h(HeadingLevel.HEADING_2, '1.2 读者对象'));
children.push(p('本文档面向项目团队成员、指导教师、系统开发人员和测试人员。'));
children.push(h(HeadingLevel.HEADING_2, '1.3 参考文档'));
children.push(p('《软件工程综合实训指导书》、分组选题表、Spring Boot官方文档、Spring AI官方文档。'));
children.push(h(HeadingLevel.HEADING_2, '1.4 原始功能需求'));
children.push(bold('（1）基本功能模块：'));
children.push(p('招聘岗位管理：新建、发布、关闭、编辑、查询岗位信息，支持岗位分类和状态管理。'));
children.push(p('简历信息管理：上传简历文件（PDF/DOC/DOCX），系统自动解析提取关键信息，支持全文搜索。'));
children.push(p('面试安排管理：安排面试时间、地点、面试官，支持多轮面试和面试委员会。'));
children.push(p('录用入职管理：发送Offer通知、候选人确认入职、创建员工档案。'));
children.push(p('员工档案管理：入职员工信息归档，支持档案查询和维护。'));
children.push(p('数据统计分析：招聘数据实时统计、可视化大屏展示各阶段转化率。'));
children.push(bold('（2）差异化创新功能：'));
children.push(p('AI生成岗位JD：基于岗位信息自动生成专业招聘描述。'));
children.push(p('AI生成面试题：基于岗位要求自动生成面试题目。'));
children.push(p('AI面试评价摘要：多面试官评价汇总后自动生成AI摘要。'));
children.push(p('AI候选人-岗位匹配评分：智能分析简历与岗位匹配度。'));
children.push(p('招聘流程管道看板：按岗位配置招聘流程，拖拽式看板管理候选人流转。'));
children.push(p('通知模板系统：面试通知、Offer通知等模板化管理。'));
children.push(p('候选人时间线：记录候选人在招聘流程中的完整流转历史。'));
children.push(p('多轮面试+面试委员会：支持多轮面试和多人面试委员会。'));
children.push(p('人才储备库/黑名单：未录用候选人归入储备库，支持黑名单管理。'));
children.push(p('文件在线预览：简历附件在线预览。'));
children.push(p('WebSocket实时通知：面试安排、状态变更实时推送。'));
children.push(p('MySQL全文搜索：基于ngram解析器的简历全文检索。'));
children.push(p('AOP操作日志：记录用户操作日志用于审计。'));

children.push(h(HeadingLevel.HEADING_2, '1.5 非功能性需求'));
children.push(bold('（1）安全性：'));
children.push(p('系统采用JWT认证机制，密码使用MD5加密存储；接口访问需携带有效Token；操作日志记录所有关键操作；简历等敏感信息脱敏展示。'));
children.push(bold('（2）性能：'));
children.push(p('页面响应时间不超过3秒；数据大屏加载时间不超过5秒；数据库查询支持索引优化；MySQL全文搜索响应时间不超过2秒。'));
children.push(bold('（3）可用性：'));
children.push(p('系统界面采用Element Plus组件库，操作直观友好；关键操作有确认提示和防重复提交机制；表单校验实时反馈。'));
children.push(bold('（4）兼容性：'));
children.push(p('后端兼容MySQL 8.0+；前端兼容Chrome、Firefox、Edge等主流浏览器；支持响应式布局。'));
children.push(bold('（5）可维护性：'));
children.push(p('代码遵循Spring Boot分层架构（Controller/Service/Mapper/Entity）；数据库迁移使用Flyway管理；接口文档规范统一。'));

// Chapter 2
children.push(new Paragraph({ pageBreakBefore: true }));
children.push(h(HeadingLevel.HEADING_1, '2 用例模型'));
children.push(h(HeadingLevel.HEADING_2, '2.1 用例列表'));
children.push(p('本系统共定义22个用例，涉及4类参与者，覆盖人力资源招聘管理的完整业务流程。'));
children.push(ucListTable());

children.push(h(HeadingLevel.HEADING_2, '2.2 用例图'));
children.push(p('（请在此处插入用例图，建议按照系统边界划分，将4类参与者与22个用例的关系以图形方式展示。）'));
children.push(p('用例图说明：'));
children.push(p('HR专员作为核心参与者，涉及岗位管理、简历管理、面试安排、Offer发送、招聘管道管理等核心业务用例。'));
children.push(p('部门经理/面试官主要负责面试评价和查看数据大屏。'));
children.push(p('系统管理员负责通知模板管理和操作日志查看。'));
children.push(p('候选人仅参与投递岗位用例。'));
children.push(p('AI生成类用例由系统（AI）自动触发执行。'));

children.push(h(HeadingLevel.HEADING_2, '2.3 用例规格说明（用例描述）'));
children.push(p('说明：小组成员根据自己的分工，分别选择不同的用例，每人创建2个用例规约。不应包括注册、登录等常规操作。建议选择用例为核心业务用例+数据增改操作用例。'));
children.push(p('选择描述的用例功能不能过于简单，基本事件流至少应包含2次交互（4个步骤）；扩展流至少应包含2种异常处理情况。'));
children.push(p('选择描述的用例粒度不宜过大，用例图及用例规约描述中用例名称应避免采用"**管理"字样。'));

// 22 use case tables
useCases.forEach((uc, idx) => {
    children.push(h(HeadingLevel.HEADING_3, `2.3.${idx + 1} ${uc.id} ${uc.name}用例`));
    children.push(makeUseCaseTable(uc));
    children.push(new Paragraph({ spacing: { before: 200, after: 200 } }));
});

const doc = new Document({
    sections: [{
        properties: { page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
        children,
        headers: { default: new Header({ children: [new Paragraph({ text: '需求分析规格说明书 - 人力资源招聘管理系统', alignment: AlignmentType.CENTER, spacing: { after: 100 } })] }) },
        footers: { default: new Footer({ children: [new Paragraph({ children: [new TextRun({ children: ['第 ', PageNumber.CURRENT, ' 页'] }), new TextRun({ text: ' / ', size: 20 }), new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 20 })], alignment: AlignmentType.CENTER })] }) }
    }]
});

Packer.toBuffer(doc).then(buf => {
    fs.writeFileSync('2. 需求分析规格说明书-13.docx', buf);
    console.log('Done: 2. 需求分析规格说明书-13.docx generated');
}).catch(err => {
    console.error('Error:', err);
});
