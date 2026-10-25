(function(root){
const clean=x=>String(x??'').trim();const jp=x=>clean(x)||'確認中';const cn=x=>clean(x)||'待补充';
const issues={color:['颜色 / 材质与确认样不符','製品の色や材質が承認見本と異なるとのご指摘をいただいております。'],scratch:['刮伤 / 污渍','製品表面に擦り傷や汚れがあるとのご指摘をいただいております。'],size:['尺寸不符','製品の寸法が仕様と異なるとのご指摘をいただいております。'],glue:['粘合不良 / 开胶','製品に接着不良や剥離があるとのご指摘をいただいております。'],damage:['破损 / 变形','製品に破損や変形があるとのご指摘をいただいております。'],shortage:['数量短缺','納品数量が不足しているとのご連絡をいただいております。'],delay:['交期延误','納期の遅延についてご指摘をいただいております。']};
Object.assign(issues,{assembly:['家具组装 / 五金配件问题','家具の組み立てや金具・付属部品に不具合があるとのご指摘をいただいております。'],stability:['家具稳定性 / 承重问题','家具の安定性や耐荷重に問題があるとのご指摘をいただいております。'],sewing:['包袋缝线 / 肩带问题','バッグの縫製やストラップに不具合があるとのご指摘をいただいております。'],zipper:['拉链 / 扣具问题','ファスナーや留め具に不具合があるとのご指摘をいただいております。'],odor:['异味 / 霉变','製品に異臭やカビがあるとのご指摘をいただいております。'],packing:['包装 / 标签 / 错发','梱包や表示の不備、または誤出荷についてご指摘をいただいております。']});
const requests={correction:'原因調査ならびに是正・再発防止策の提出',compensation:'補償に関する協議',replacement:'代替品の納入',stopProduction:'生産の停止',stopShipment:'出荷の停止'};
function date(x,tz){if(!clean(x))return '確認中';return clean(x).replace(/^(\d{4})-(\d{2})-(\d{2})T?/,'$1年$2月$3日 ').trim()+'（'+jp(tz).replace(/[（）]/g,' ').replace(/\s+/g,' ').trim()+'）';}
function lintJapanese(s){const w=[];if(!clean(s))return w;if(/客户|问题|颜色|补货|整改|这批|赔款|出货|请尽快/.test(s))w.push('自由文本可能包含未翻译的中文，请确认日语译文');if(/ご確認してください|ご連絡してください|おっしゃられ|お読みになられ|ご覧になられ/.test(s))w.push('自由文本含疑似敬语误用，请人工校对');if(/させていただ/.test(s))w.push('请确认「させていただく」是否符合许可与受益语境');return w;}
function build(input,files=[]){
const d={...input,product:input.productJa||input.product};
const warnings=[];const needed={customer:'客户名称',order:'订单号',product:'产品名称',total:'订单数量',quantity:'投诉数量',received:'投诉时间',timezone:'时区',qa:'品保负责人',owner:'相关部门处理人',internalDeadline:'内部反馈期限',customerDeadline:'客户回复期限'};
for(const [k,label] of Object.entries(needed))if(!clean(d[k]))warnings.push('缺少'+label);
if(!issues[d.issue]&&!clean(d.translation))warnings.push('缺少日语问题详情');
if(clean(d.original)&&!clean(d.translation))warnings.push('客户原话尚未翻译');
if(!d.requests?.some(k=>requests[k])&&!clean(d.requestDetail))warnings.push('客户诉求待确认');
if(d.verification!=='confirmed')warnings.push('事实仍待核实');
if(d.phone!=='done')warnings.push('尚待电话通知');
if(d.phone==='done'&&!clean(d.phoneDetail))warnings.push('缺少电话通知对象 / 时间');
if(d.meeting==='yes'&&(!d.meetingTime||!clean(d.attendees)))warnings.push('缺少会议时间或与会人员');
if(d.internalDeadline&&d.customerDeadline&&d.internalDeadline>d.customerDeadline)warnings.push('内部反馈晚于客户回复期限，请调整');
if(d.received&&d.customerDeadline&&d.customerDeadline<d.received)warnings.push('客户回复期限早于投诉时间，请核对');
if(files.length)warnings.push('发送邮件时须手动添加附件');warnings.push(...lintJapanese([d.translation,d.requestDetail].filter(Boolean).join('\n')));
const statuses={pending:'事実関係は現在確認中です。不具合の有無および責任の所在は、現時点では確定しておりません。',confirmed:'申告された不具合について、社内で事実確認を行いました。責任の所在および対応方針は、別途確認のうえ決定いたします。',disputed:'申告内容に確認を要する点があるため、関連資料に基づき、引き続き事実関係を調査しております。'};
const detail=[issues[d.issue]?.[1],clean(d.translation)].filter(Boolean).join('\n')||'詳細は確認中です。';const req=(d.requests||[]).filter(k=>requests[k]).map(k=>'・'+requests[k]);if(clean(d.requestDetail))req.push('・'+clean(d.requestDetail));
const meeting=d.meeting==='yes'?'営業部門にて、下記のとおり対策検討会を開催する予定です。\n開催日時：'+date(d.meetingTime,d.timezone)+'\n出席者：'+jp(d.attendees):d.meeting==='no'?'現時点では開催を予定しておりません。必要に応じて、営業部門より改めてご案内いたします。':'開催の要否を営業部門にてご判断いただき、必要な場合は、開催日時および出席者のご連絡をお願いいたします。';
const body=`関係各位\n\nお疲れ様です。\nお客様より下記のクレームに関するご連絡をいただきましたので、取り急ぎご報告いたします。\n\n【顧客・製品情報】\n顧客名：${jp(d.customer)}\n注文番号：${jp(d.order)}\n製品名：${jp(d.product)}\n注文数量：${jp(d.total)}\nクレーム対象数量：${jp(d.quantity)}\nクレーム受付日時：${date(d.received,d.timezone)}\n\n【確認状況】\n${statuses[d.verification]||statuses.pending}\n\n【クレーム内容】\n${detail}${clean(d.original)&&!clean(d.translation)?'\nお客様からのご連絡内容の日本語訳は、現在確認中です。':''}\n\n【お客様のご要望】\n${req.length?req.join('\n'):'現在確認中です。'}\n※上記はお客様のご要望であり、当社として実施を確約するものではございません。実施の可否および対応方針については、関係部門にてご確認をお願いいたします。\n\n【対応担当者・回答期限】\n品質保証センター担当者：${jp(d.qa)}\n関連部門の副責任者・対応担当者：${jp(d.owner)}\n社内報告期限：${date(d.internalDeadline,d.timezone)}\nお客様への回答期限：${date(d.customerDeadline,d.timezone)}\n\n【写真・関連資料】\n${files.length?files.map(x=>'・'+x).join('\n')+'\n※送信時に、上記資料の添付をお願いいたします。':'写真・関連資料の有無は、現在確認中です。'}\n\n【電話による連絡】\n${d.phone==='done'?'関係者への電話連絡は実施済みです。':'関係者への電話連絡は未実施です。速やかにご連絡くださいますようお願いいたします。'}\n連絡先・連絡日時：${jp(d.phoneDetail)}\n\n【対策検討会】\n${meeting}\n\n品質保証センターおよび主要関連部門の副責任者の皆様には、事実関係、発生原因、影響範囲、暫定対応ならびに是正・再発防止策についてご確認のうえ、上記の社内報告期限までにご報告をお願いいたします。\n調査が完了していない場合も、進捗状況および次回の報告予定日時をお知らせください。\n営業担当者の皆様には、お客様への回答およびその後のご意見の確認を継続して行っていただきますようお願いいたします。\n\nお忙しいところ恐れ入りますが、ご対応のほど、よろしくお願いいたします。`;
return {subject:'クレーム－'+jp(d.customer),body,warnings,recipients:clean(d.recipients)};
}
function buildReport(input){
const d={...input,timezone:input.reportTimezone||input.timezone};
const warnings=[];const required={customer:'客户名称',order:'订单号',product:'产品名称',quantity:'投诉数量',factory:'供应商 / 责任部门',reportNo:'报告编号',reportDate:'报告日期',batch:'批次',problem:'问题描述',rootCause:'发生原因',escapeCause:'流出原因',author:'编制人'};
for(const [k,label]of Object.entries(required))if(!clean(d[k]))warnings.push('缺少'+label);
for(const [k,label]of [['containment','临时遏制'],['corrective','纠正措施'],['preventive','预防再发']]){if(!clean(d[k]))warnings.push('缺少'+label);if(!clean(d[k+'Owner'])||!clean(d[k+'Due']))warnings.push(label+'缺少责任人或计划日期');}
const proofKeys=['completion','validationPlan','validationResult','validator','validationDate','reviewer','reviewDate','rootCause','escapeCause','containment','corrective','preventive'];
const ready=proofKeys.every(k=>clean(d[k])&&!/^(待补充|待调查|待验证|待确认|未验证|未完成|无|暂无)$/.test(clean(d[k])))&&clean(d.validationBatch)&&Number.isSafeInteger(Number(d.sampleCount))&&Number(d.sampleCount)>0&&clean(d.defectCount)!==''&&Number.isSafeInteger(Number(d.defectCount))&&Number(d.defectCount)>=0&&Number(d.defectCount)<=Number(d.sampleCount)&&d.validationOutcome==='pass'&&d.reviewDecision==='approved';
const states={draft:'调查中 / 整改计划',progress:'整改实施中',verification:'措施已完成，效果待验证',closed:ready?'申请结案（已填验证及审核记录，待最终结案确认）':'申请结案未满足条件，暂不结案'};
if(d.reportStatus==='closed'&&!ready)warnings.push('结案资料不完整或验证 / 审核未通过，不得标记已结案');
if(d.reportStatus==='verification'&&!clean(d.completion))warnings.push('缺少实际完成记录，无法确认措施已完成');
if(d.validationOutcome==='pass'&&(!clean(d.validationResult)||!clean(d.validator)||!d.validationDate))warnings.push('验证合格缺少证据、验证人或日期');
if(d.reviewDecision==='approved'&&(!clean(d.reviewer)||!d.reviewDate))warnings.push('审核通过缺少审核人或日期');
let status=states[d.reportStatus]||states.draft;if(d.reportStatus==='verification'&&!clean(d.completion))status='完成情况待核实，尚不能确认已完成';
if(d.validationOutcome==='fail')warnings.push('验证不合格，应继续整改');if(d.reviewDecision==='rejected')warnings.push('审核退回，应补充整改及证据');
const block=(title,k)=>`${title}\n措施内容：${cn(d[k])}\n责任人：${cn(d[k+'Owner'])}\n计划完成日期：${cn(d[k+'Due'])}\n实际完成日期：${cn(d[k+'Done'])}`;
const body=`外贸客诉整改报告\n\n一、基本信息\n报告编号：${cn(d.reportNo)}\n报告日期：${cn(d.reportDate)}\n供应商 / 责任部门：${cn(d.factory)}\n客户名称：${cn(d.customer)}\n订单号：${cn(d.order)}\n产品名称 / 型号：${cn(d.productCn||d.product)}\n批次 / 生产日期：${cn(d.batch)}\n订单数量：${cn(d.total)}\n投诉 / 不良数量：${cn(d.quantity)}\n投诉时间：${clean(d.received)?d.received.replace('T',' '):'待补充'}\n投诉时间所属时区：${({'日本時間（JST）':'日本时间 JST','中国標準時（UTC+8）':'中国时间 UTC+8','英国夏時間（BST）':'英国夏令时 BST','グリニッジ標準時（GMT）':'英国冬令时 GMT'})[d.timezone]||'待补充'}\n当前状态：${status}\n\n二、问题描述及影响范围\n${cn(d.problem)}\n\n三、原因分析\n发生原因：${cn(d.rootCause)}\n流出原因：${cn(d.escapeCause)}\n\n四、整改措施与计划\n${block('1. 临时遏制措施','containment')}\n\n${block('2. 纠正措施','corrective')}\n\n${block('3. 预防再发措施','preventive')}\n\n五、实际完成情况\n${cn(d.completion)}\n说明：上述计划日期不等于实际完成日期；实际执行情况以记录及证据为准。\n\n六、效果验证\n验证方法与验收标准：${cn(d.validationPlan)}\n验证结果及证据：${cn(d.validationResult)}\n填报的验证结论：${({pending:'待验证',pass:'验证合格（需核对证据）',fail:'验证不合格'})[d.validationOutcome]||'待验证'}\n验证批次：${cn(d.validationBatch)}\n抽检数量：${cn(d.sampleCount)}\n不良数量：${cn(d.defectCount)}\n验证人：${cn(d.validator)}\n验证日期：${cn(d.validationDate)}\n\n七、客户反馈与审核\n客户反馈：${cn(d.customerFeedback)}\n编制人：${cn(d.author)}\n审核人：${cn(d.reviewer)}\n审核日期：${cn(d.reviewDate)}\n填报的审核结论：${({pending:'待审核',approved:'审核通过（需核对审核记录）',rejected:'审核退回'})[d.reviewDecision]||'待审核'}\n结案状态：${status}\n\n本报告根据填写内容整理。未填写项目保留“待补充”，不代表原因已确认、措施已执行或效果已合格。申请结案后仍须按公司流程完成最终批准。`;
return {subject:'客诉整改报告－'+cn(d.customer)+'－'+cn(d.reportNo),body,warnings,recipients:''};
}
function buildMailChinese(d,files=[]){
const requestMap={correction:'原因调查及纠正、预防再发措施',compensation:'协商补偿',replacement:'补货',stopProduction:'停止生产',stopShipment:'停止出货'};
const req=(d.requests||[]).filter(k=>requestMap[k]).map(k=>'· '+requestMap[k]);if(clean(d.requestDetailCn))req.push('· '+clean(d.requestDetailCn));else if(clean(d.requestDetail))req.push('· 补充要求（日语）：'+clean(d.requestDetail));
const dateCn=x=>clean(x)?x.replace('T',' ')+'（'+({'日本時間（JST）':'日本时间 JST','中国標準時（UTC+8）':'中国时间 UTC+8','英国夏時間（BST）':'英国夏令时 BST','グリニッジ標準時（GMT）':'英国冬令时 GMT'}[d.timezone]||'时区待确认')+'）':'待确认';
return `内部客诉通知中文对照

客户：${cn(d.customer)}
订单：${cn(d.order)}
产品：${cn(d.product)}
订单数量：${cn(d.total)}
投诉数量：${cn(d.quantity)}
接诉时间：${dateCn(d.received)}

核实状态：${d.verification==='confirmed'?'已在内部核实不良事实；责任归属和处理方针仍须确认。':d.verification==='disputed'?'申诉内容存在待确认事项，继续调查。':'事实待核实，尚未确认不良是否成立及责任归属。'}

客诉描述：
${clean(d.original)||issues[d.issue]?.[0]||'待补充'}

客户诉求：
${req.length?req.join('\n'):'待确认'}
以上为客户要求，不代表公司已承诺或执行。

品保负责人：${cn(d.qa)}
相关部门处理人：${cn(d.owner)}
内部反馈期限：${dateCn(d.internalDeadline)}
客户回复期限：${dateCn(d.customerDeadline)}

资料：${files.length?files.join('、')+'（需手动附上文件）':'有无待确认'}
电话通知：${d.phone==='done'?'已执行':'待执行'}；对象及时间：${cn(d.phoneDetail)}
检讨会议：${d.meeting==='yes'?'拟由业务组织；时间：'+dateCn(d.meetingTime)+'；参加人：'+cn(d.attendees):d.meeting==='no'?'目前不安排，必要时另行通知。':'由业务判断是否需要，必要时通知时间和人员。'}

请品保中心及相关部门副责任人核实事实、原因、影响范围及临时、纠正和预防措施，在内部期限前反馈。调查未完成也需反馈进度及下次报告时间。业务持续跟进客户回复和反馈。`;
}
root.ComplaintCore={build,buildReport,buildMailChinese,lintJapanese,issues};if(typeof module!=='undefined')module.exports={build,buildReport,buildMailChinese,lintJapanese,issues};
})(typeof window!=='undefined'?window:globalThis);
