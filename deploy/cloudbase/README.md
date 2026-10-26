# 美琳工作小助手 CloudBase 测试部署

此目录提供国内云托管适配，保留同一套页面、独立密码登录、案件/词库/版本记录、私有证据文件与文稿导出。原 Sites 网站继续运行。此版本尚未在真实腾讯云环境部署，不能将本地测试结果当作大陆访问验证。

## 部署配置

1. 在腾讯云中国站创建 CloudBase 测试环境。选择文档型数据库运行模式；本适配不使用 PostgreSQL 模式。实名、服务条款、角色授权、计费选择由账号所有者确认。
2. 创建 `meilin_cases`、`meilin_versions`、`meilin_settings`、`meilin_evidence` 四个集合。客户端权限设置为禁止直接读写；所有读写由本服务验证登录后执行。云存储也禁止公共读写，不使用公开文件链接。
3. 为 `meilin_cases` 建立 `account + updatedAt` 索引，为 `meilin_versions` 和 `meilin_evidence` 建立 `account + caseId + updatedAt` 索引。按照控制台提示使用实际支持的复合索引方向，当前查询按 updatedAt 降序。
4. 云托管使用 GitHub 项目根目录作为构建上下文，Dockerfile 为 `deploy/cloudbase/Dockerfile`，容器端口 `8080`，健康检查 `/healthz`。不要把仅此子目录作为构建上下文。构建时通过锁文件安装官方 SDK，运行时不依赖 chatgpt.site 或 Cloudflare。
5. 在平台服务端配置 `.env.example` 中变量：`CLOUDBASE_ENV_ID` 为当前环境；`PUBLIC_ORIGIN` 是平台分配的 HTTPS 测试服务地址，只含协议和主机，不含路径或结尾斜杠。登录仍使用 `LOGIN_EMAIL / LOGIN_SALT / LOGIN_HASH / SESSION_KEY`。账号所有者在密钥配置中填写；不要放入 GitHub 或网页代码。若平台先分配域名后部署，先取得服务地址再填入并启动服务。
6. 后端 SDK 使用服务角色授权。若该云托管环境不提供自动角色凭据，需由账号所有者在平台密钥中设置仅针对该测试环境的腾讯云服务凭据；不得将主账号长期密钥发送到聊天或写入代码。缺少有效权限时不能读写数据库或文件。
7. 平台默认域名仅用于测试，可能出现访问提示中间页、请求限频或功能限制。若默认域名阻止登录 Cookie 或附件接口，需按实际平台限制处理，不能声称默认域名适用于正式服务。
8. 分别用大陆手机流量和公司网络测试：打开登录页、登录、保存案件、重开页面恢复、上传与下载图片、生成报告、导出Word/ZIP。全部通过后再分享测试地址。

## 数据和限制

- 国内测试环境与原站数据隔离；此部署不会自动迁移原站记录或照片。不要直接重置原站密钥或关闭原站。
- 共享账号下的操作者姓名仍为自行填写。所有 API 均检查服务端账号和签名会话，写操作检查同源 Origin。
- 案件保存和版本快照采用数据库事务。测试版每次检索最多读取最近1000条案件；跟进区显示最近500条未结案记录，版本区显示最近50次保存。
- 每案30份证据、每份8 MB；文件存储私有，由登录后的下载接口返回，不对外暴露云文件ID。上传计数采用事务，失败时释放配额。
- 自动翻译保持关闭，不连接外部AI；固定模板与人工日语仍可用。
- 测试版登录频率限制在单实例内执行，并按容器网络来源分组。平台网关可能让多个访客共享限制；正式使用应在网关增加适当限频和独立账号。
- 不允许把数据库或照片保存到容器本地磁盘。容器重启或扩容后依旧使用云数据库及云存储。

## 本地检查

在项目根目录执行：

```sh
node deploy/cloudbase/prepare.mjs
node deploy/cloudbase/test.mjs
```

测试使用模拟文档数据库和文件存储，覆盖会话保护、CRUD、同版本并发冲突、原子版本记录、账号隔离、结案校验、词库、证据上传下载和CSRF。真实SDK/平台角色、索引配置、默认域名Cookie和大陆网络仍需上线检查。

官方参考：

- https://docs.cloudbase.net/quick-start/create-env
- https://docs.cloudbase.net/database/transaction
- https://github.com/TencentCloudBase/node-sdk/blob/master/docs/storage.md
- https://docs.cloudbase.net/service/alias
