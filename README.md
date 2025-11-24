# iOS Weather Card

一个仿 iOS 18 天气应用风格的 Home Assistant 自定义卡片。

![Preview](preview.png)

## ✨ 特性

- 🎨 **iOS 18 风格设计**：精致的布局和排版，完美复刻原生体验。
- 🎬 **动态背景动画**：基于 HTML5 Canvas 的高性能动态天气背景（晴天光晕、雨滴、雪花、云层飘动等）。
- 🌡️ **细粒度天气支持**：支持区分小/中/大/暴雨、小/中/大/暴雪、轻/中/重度雾霾等多种天气状态。
- 🛠️ **可视化编辑器**：支持 Home Assistant UI 可视化编辑配置。
- 🖼️ **自定义图标**：使用 SVG 文件图标，易于替换和定制。

## 📦 安装

### 手动安装

1. 下载本项目的所有文件。
2. 将 `ios-weather-card` 文件夹上传到你的 Home Assistant 配置目录下的 `www` 文件夹中（即 `/config/www/ios-weather-card`）。
3. 在 Home Assistant 中添加资源引用：
   - 进入 **配置** -> **仪表盘** -> **资源**。
   - 点击 **添加资源**。
   - URL 输入：`/local/ios-weather-card/ios-weather-card.js`
   - 资源类型选择：`JavaScript Module`。
4. 刷新浏览器。

## ⚙️ 配置

你可以在仪表盘编辑模式下，点击“添加卡片”，搜索 **iOS Weather Card** 进行可视化配置。

### YAML 配置示例

```yaml
type: custom:ios-weather-card
entity: weather.home  # 必填，天气实体
show_current: true    # 可选，是否显示当前天气，默认 true
show_forecast: true   # 可选，是否显示预报，默认 true
forecast_rows: 5      # 可选，预报显示行数，默认 5
forecast_type: daily  # 可选，预报类型 'daily' (按天) 或 'hourly' (按小时)，默认 'daily'
secondary_info_attribute: humidity # 可选，副标题显示的属性（如湿度）
secondary_info_unit: '%' # 可选，副标题单位
```

## 📂 文件结构

- `ios-weather-card.js`: 核心逻辑代码。
- `ios-weather-style.js`: 样式文件。
- `ios-weather-const.js`: 常量定义、天气映射配置。
- `ios-weather-editor.js`: 可视化编辑器代码。
- `ios-weather-icons.js`: 图标映射文件。
- `weathericons/`: 存放 SVG 天气图标的文件夹。

## 📝 注意事项

- 请确保 `weathericons` 文件夹下的图标文件完整，否则可能导致图标无法显示。
- 推荐使用彩云天气等支持丰富天气状态的集成，以获得最佳视觉体验。
