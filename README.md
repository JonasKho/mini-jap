# 美琳工作小助手

独立密码登录的日语内部客诉邮件与简体中文外贸整改报告工具。保留暖色界面、Twinkle Twinkle星星人与轻量日语鼓励。

## 当前行为

- 中文详情与日语译文并列，固定句式按适度商务敬语编写。提供中文字段对照，手动编辑日语后需重新核对。
- 用户选择不连接外部AI，因此当前自动翻译未启用。不发送用户内容给AI，不声称能够翻译任意中文。可选固定问题、客户诉求，或粘贴人工审核译文。后端保留默认禁用的翻译适配器；无API密钥和模型时返回明确错误，不生成伪造译文。
- D1保存账号下的客诉、邮件草稿、整改字段、文稿正文、附件文件名及检查状态。历史可按客户、订单、产品和处理状态检索。乐观版本控制防止跨窗口覆盖。
- 输入停顿后自动保存到账号。网络失败时在当前浏览器保留未同步恢复草稿，成功同步后移除对应本机备份。示例不保存到正式历史。
- 同一条客诉共用基础信息，可由邮件关联整改报告，不覆盖已有调查结论和措施。
- 公司已审定词库与范文存储在账号下。已审定术语可精确匹配产品名，并附加到人工翻译校对指令；范文仅作措辞参考。
- TXT、原生可编辑DOCX导出；PDF使用浏览器打印另存为PDF。Word采用A4、黑色标题、中文字体回退、章节和页码，导出正文不包含吉祥物。
- 发送前检查收件人、附件、译文、数量金额、负责人期限与客户诉求。系统不自动发送邮件。结案状态需完整原因、措施、实际完成、验证合格、审核通过及最终结案确认。
- 邮件原附件栏只记录文件名；新增案件证据区将图片/PDF存入受登录保护的R2，可跨设备下载。每份8 MB、每案30份。

## 构建与验证

```
node scripts/test-generation.cjs
node scripts/test-stars.cjs
node scripts/test-api.mjs
node scripts/assemble.mjs
bash scripts/build.sh
node scripts/validate-artifact.mjs
node scripts/test-auth.mjs
```

数据库schema位于db/schema.ts。新增迁移使用npm run db:generate，检查并提交SQL、快照和journal；已应用迁移不可修改。Sites打包时复制drizzle目录并在发布时应用迁移。绑定为DB。

开发预览使用sites-preview start /workspace/sites/complaint-mail，Node本地SQLite置于被忽略的.sites-runtime/preview.db，不接触生产数据。预览仅用于UI与API行为，生产认证由Worker执行。

Word内部QA：使用主运行时执行scripts/test-docx.cjs，再运行文档技能render_docx.py，逐页检查输出；CJK字体使用系统可用中文字体回退。已检查样本的两页中文排版，无缺字、标题孤行或措施跨页拆散。

## 日语参考

固定模板依据公开教材原则独立编写，不代表官方审核或母语审校，不替代公司术语审定。

- 文化厅《敬语的指针》：https://www.bunka.go.jp/seisaku/bunkashingikai/kokugo/hokoku/pdf/93927001_09.pdf
- 文化厅《敬语趣味咨询室》第二话：https://www.bunka.go.jp/seisaku/kokugo_nihongo/kokugo_shisaku/keigo/chapter2/detail.html
- 国際交流基金《いろどり》初级1第9课p.20：https://www.irodori.jpf.go.jp/assets/data/elementary01/pdf/Y_L09.pdf

## 身份和访问

账号及密码哈希通过Sites服务端密钥配置。应用采用加盐PBKDF2验证及HMAC签名的Secure、HttpOnly、SameSite=Lax Cookie，会话12小时。所有应用资产及API均验证会话，账号数据由服务端LOGIN_EMAIL确定，不接受客户端指定账号。写操作检查同源Origin和JSON格式。历史与词库共享同一登录账号的权限。

## 星星人

每整理2或3份不同文稿出现日语鼓励，附中文释义。示例和重复生成不累计；可手动召唤、关闭或本次静音。只在sessionStorage保存小计数和提醒偏好，不保存客诉内容；不会写入导出文稿。动画尊重减少动态效果偏好。

角色素材为POP MART官网公开的Twinkle Twinkle透明底头像，角色版权归原权利人所有，本工具非官方产品，不声称已获得授权。
来源：https://www.popmart.com/us/products/9061/twinkle-twinkle-live-the-ordinary-series-figures
原图：https://prod-america-res.popmart.com/default/20240913_145606_544461____1_____180x180.png
文件：ui/assets/official-twinkle-avatar.png。未修改用户上传的参考图。

## 家具与包袋外贸升级

- 产品类别：家具、包袋、其他；问题类型覆盖组装/五金、稳定性/承重、缝线/肩带、拉链/扣具、异味/霉变、包装标签错发。
- 临时处置、根因整改、预防措施分别记录计划和实际完成日期；有效验证要求批次、抽样量、不良数、方法/标准、结果及验证审核人员。
- 首页跟进：最近500个未结案案件的客户回复、内部反馈、未填实际完成日期的措施期限。日期按所选固定时区解释，24小时内提醒、逾期优先；提醒只在页面内显示，不自动邮件催办。勾选内部已反馈/已回复客户后停止对应期限提醒。
- 相似客诉：匹配相同客户或完全相同产品名，并按所选问题类型筛选；最多检查最近100个候选，不代表自动判定重复。
- 每次案件保存与版本快照通过D1 batch原子执行。最多查看/导出最近50次保存；旧案件升级前的历史不追溯。共享账号操作者为自行填写，不是独立身份审计。
- 证据按客诉/整改/验证分类，受会话与案件账号隔离；仅JPG/PNG/WebP/PDF，以文件头校验类型。文件只允许下载，不在页面执行。此版不提供文件删除。
- ZIP案件包包含填写数据、已生成Word文稿、中文对照、证据、最近50次版本；过期文稿文件名明确标注。PDF继续使用浏览器打印保存。
- 日语承诺性表达与数量遗漏检查为规则提示，需要人工核对；未接入AI翻译。

## 国内云托管测试部署

新增 `deploy/cloudbase/`：独立腾讯云文档数据库/私有云存储适配、Node容器入口、Dockerfile、锁文件和部署说明。本地适配检查通过；真实云端部署与大陆网络测试尚待账号授权完成。原站继续运行，旧数据不自动搬迁。
