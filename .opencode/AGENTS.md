# 角色卡生成 Agent 全局规则

> 本文件由 OpenCode 自动加载到所有 agent 的上下文中,定义所有 Card* agent 必须共同遵守的强制规则。
> 
> 各 agent 提示词中**不必**重复以下规则,但**必须**遵守。
> 
> 详细规则参考手册见 `.opencode/instructions/` 目录。

## 适用范围

本文件中的规则**仅适用于以 Card 为前缀的 agent**(如 CardDirector、CardWorldview、CardNpc 等)。

非 Card* agent(如 Writer、general、explore)**不受**本规则约束。

## 强制规则 1:输出根目录

所有 Card* agent 生成的角色卡产物必须输出到项目根目录下的 `char/` 目录,不得使用 `角色卡/` 或其他名称。

完整产物路径表:

| Agent | 输出路径 | 文件类型 |
|-------|---------|---------|
| CardIndex | `char/index.yaml` | YAML(tavern_sync 固定格式,**禁止 markdown**) |
| CardWorldview | `char/世界书/世界设定.md` | Markdown(内嵌 XML+YAML) |
| CardFactions | `char/世界书/势力设定.md` | Markdown(内嵌 XML+YAML) |
| CardNarrativeStyle | `char/世界书/叙事风格.md` | Markdown(内嵌 XML+YAML) |
| CardUserProfile | `char/世界书/主角设定.md` | Markdown(内嵌 XML+YAML) |
| CardDramaCore | `char/世界书/戏剧核心.md` | Markdown(内嵌 XML+YAML) |
| CardNpc | `char/世界书/NPC/<NPC 名>.md` | Markdown(内嵌 XML+YAML) |
| CardFirstMessage | `char/第一条消息/0.md` | Markdown(内嵌叙事正文) |
| CardMvuSchema | `char/脚本/Zod.ts` | TypeScript(可执行脚本,**禁止 markdown**) |
| CardMvuRules | `char/世界书/变量/变量更新规则.md` | Markdown(内嵌 XML+YAML) |
| CardMvuInitVar | `char/世界书/变量/[initvar]初始化变量勿开.yaml` | YAML(MVU 框架要求纯 YAML,**禁止 markdown**) |

## 强制规则 1.1:文件扩展名规则

- **默认**:所有 Card* agent 输出的世界书条目、第一条消息使用 `.md` 扩展名(Markdown 包裹 + 内嵌 XML+YAML)。
- **例外 1 — `char/index.yaml`**:tavern_sync 固定格式,必须为纯 YAML,禁止任何 Markdown 包装或代码块。
- **例外 2 — `char/脚本/Zod.ts`**:可执行 TypeScript 脚本,必须为纯 TS 代码,禁止任何 Markdown 包装。
- **例外 3 — `char/世界书/变量/[initvar]初始化变量勿开.yaml`**:MVU 框架读取的变量初始值,必须为纯 YAML,禁止任何 Markdown 包装。

`tavern_sync` 工具支持以 `.md` 扩展名作为世界书条目内容文件;打包时它会读取 Markdown 全文(包括代码块、XML 标签)作为该条目发送给 LLM 的字符串。

## 强制规则 2:`{{user}}` 替换

在世界书条目、第一条消息、initvar 等所有"会被发送给 LLM"的**正文内容**中,禁止直接出现以下指代用户的字样,必须替换为 `{{user}}`:

- 主角 / 男主 / 女主 / 男主角 / 女主角 / 主人公
- 用户 / 玩家
- 你(指代用户时)
- pc / PC / Player Character

**绝对禁止使用 `{{user}}` 以及英文 `user`，必须使用名词 `主角` 代替的场景(例外):**

- **所有文件名**(例如: `char/世界书/主角设定.md`，不能用 `user设定.md` 或 `{{user}}设定.md`)
- **`index.yaml` 的键(Key)和条目标题(Title / name)**(例如: `[世界书]主角设定`)
- **MVU、Zod 及变量系统中的键名(Key)**(例如: `主角: z.object(...)` 代替 `user: z.object(...)`，`主角.物品栏` 代替 `user.物品栏`)
- XML 标签名(如 `<protagonist_profile>`)

**注意: 上述例外之外的所有场景(包括世界书的 YAML 键名、Markdown 标题等)，必须全部使用 `{{user}}`，禁止使用 `主角`、`男主`、`user` 等。**

完整规则、边界判定示例、自检流程见 `.opencode/instructions/user-replacement.md`。

## 强制规则 3:文件命名禁用 `{{user}}`

文件名中**绝对禁止**出现 `{{user}}` 或 `user` 字面量。需要表达"用户"概念时，**必须使用名词 `主角` 代替**。

例:
- ✅ `char/世界书/主角设定.md`
- ❌ `char/世界书/user设定.md`
- ❌ `char/世界书/{{user}}设定.md`

## 强制规则 4:禁止预设具体世界观

各 Card* agent 的提示词只包含**规则、格式、思维链**等通用信息,**禁止**预设任何具体的:

- 世界观主题(如"赛博朋克""校园""玄幻")
- 具体 NPC 设定(姓名、性格、背景)
- 具体写作风格(如"日式轻小说""硬派写实")
- 具体情节钩子或冲突类型

所有具体内容必须从用户输入中获取。如果用户输入缺失关键信息,agent **必须先向用户提问**,禁止臆测或自行编造。

## 强制规则 5:覆盖策略

`char/` 下已存在的文件**直接覆盖**,不需要二次确认。

CardDirector 在启动时一次性提示:"`char/` 下的文件将被覆盖"。

单个 Card* agent 被用户手动调用时直接覆盖,因为是用户主动操作。

## 强制规则 6:agent 间数据传递

如果一个 agent 需要参考另一个 agent 的产物(例如 CardMvuRules 需要读取 CardMvuSchema 输出的 `char/脚本/Zod.ts`),应当:

1. 先用 Read 工具读取目标文件
2. 若目标文件不存在,告知用户应先运行依赖的 agent
3. 禁止"假设性"地编造目标文件不存在时的内容

## 强制规则 7:输入缺失的处理

各 agent 启动后:

1. 先列出本次任务所需的输入信息
2. 比对用户已提供的信息,标记缺失项
3. 缺失关键项时,**先向用户提问**,获得回答后再生成
4. 缺失非关键项时,可以采用合理通用默认值,但需在输出后告知用户"我假设了 X = Y,如需修改请告诉我"

## 强制规则 8:自检清单

每个 Card* agent 在输出文件后,必须对照以下清单自检:

- [ ] 文件路径是否符合"强制规则 1"
- [ ] 文件名是否含 `{{user}}` 字面量(参见"强制规则 3")
- [ ] 正文中是否还有"主角""用户"等禁词(参见"强制规则 2")
- [ ] 是否预设了用户未提供的具体世界观(参见"强制规则 4")
- [ ] 输出格式是否符合该 agent 专属的格式规则
- [ ] 字段值是否为空、是否合理

自检失败的项必须修正后重新输出文件。

## 引用规则参考

各 Card* agent 提示词中的"专属规则"应优先内嵌(因为 OpenCode 不支持 `{file:...}` 占位符语法)。但**人类可读的完整规则手册**保留在 `.opencode/instructions/` 目录:

- `user-replacement.md` — `{{user}}` 替换详细规则
- `worldbook-format.md` — 世界书 XML+YAML 格式
- `tavern-sync-index.md` — index.md 固定格式
- `mvu-schema-rules.md` — zod schema 编写规则
- `mvu-update-rules.md` — 变量更新规则文件格式

修改这些文件时,**务必同步更新对应 agent 提示词中的内嵌副本**,避免规则漂移。
