// 状态映射：API 状态 -> 标准状态 Key
export const CONDITION_MAP = {
    'CLEAR_DAY': 'sunny', 'CLEAR_NIGHT': 'clear-night',
    'PARTLY_CLOUDY_DAY': 'partlycloudy', 'PARTLY_CLOUDY_NIGHT': 'partlycloudy',
    'CLOUDY': 'cloudy',
    'LIGHT_HAZE': 'light_haze', 'MODERATE_HAZE': 'moderate_haze', 'HEAVY_HAZE': 'heavy_haze',
    'LIGHT_RAIN': 'light_rain', 'MODERATE_RAIN': 'moderate_rain', 'HEAVY_RAIN': 'heavy_rain', 'STORM_RAIN': 'storm_rain',
    'FOG': 'fog',
    'LIGHT_SNOW': 'light_snow', 'MODERATE_SNOW': 'moderate_snow', 'HEAVY_SNOW': 'heavy_snow', 'STORM_SNOW': 'storm_snow',
    'DUST': 'dust', 'SAND': 'sand',
    'THUNDER_SHOWER': 'lightning-rainy', 'HAIL': 'hail', 'SLEET': 'snowy-rainy', 'WIND': 'windy',
    'HAZE': 'moderate_haze', 'RAIN': 'moderate_rain', 'SNOW': 'moderate_snow',

    // 保持原有兼容
    'sunny': 'sunny', 'clear': 'sunny', 'night': 'clear-night', 'clear-night': 'clear-night',
    'partlycloudy': 'partlycloudy', 'cloudy': 'cloudy', 'fog': 'fog', 'haze': 'moderate_haze',
    'rainy': 'moderate_rain', 'pouring': 'heavy_rain', 'lightning-rainy': 'lightning-rainy',
    'snowy': 'moderate_snow', 'snowy-rainy': 'snowy-rainy', 'hail': 'hail', 'windy': 'windy', 'exceptional': 'alert'
};

// 中文显示映射
export const LABEL_MAP = {
    'sunny': '晴', 'clear-night': '晴', 'partlycloudy': '多云', 'cloudy': '阴',
    'light_haze': '轻度雾霾', 'moderate_haze': '中度雾霾', 'heavy_haze': '重度雾霾', 'fog': '雾',
    'light_rain': '小雨', 'moderate_rain': '中雨', 'heavy_rain': '大雨', 'storm_rain': '暴雨',
    'light_snow': '小雪', 'moderate_snow': '中雪', 'heavy_snow': '大雪', 'storm_snow': '暴雪',
    'dust': '浮尘', 'sand': '沙尘', 'lightning-rainy': '雷阵雨', 'hail': '冰雹',
    'snowy-rainy': '雨夹雪', 'windy': '大风', 'alert': '极端'
};

// 视觉/动画配置
export const VISUAL_CONFIG = {
    'sunny': { type: 'sunny', gradient: 'day' },
    'clear-night': { type: 'sunny', isNight: true, gradient: 'night' },
    'partlycloudy': { type: 'cloudy', density: 20, speed: 0.5, gradient: 'cloudy_day' },
    'cloudy': { type: 'cloudy', density: 40, speed: 0.3, gradient: 'gray' },
    'fog': { type: 'fog', density: 25, color: '#B0C4DE', gradient: 'gray' },

    'light_haze': { type: 'fog', density: 20, color: '#B0C4DE', gradient: 'gray' },
    'moderate_haze': { type: 'fog', density: 25, color: '#B0C4DE', gradient: 'gray' },
    'heavy_haze': { type: 'fog', density: 30, color: '#90A4AE', gradient: 'gray' },

    'light_rain': { type: 'rain', count: 30, speed: 10, gradient: 'rain' },
    'moderate_rain': { type: 'rain', count: 60, speed: 15, gradient: 'rain' },
    'heavy_rain': { type: 'rain', count: 120, speed: 22, gradient: 'deep_rain' },
    'storm_rain': { type: 'rain', count: 180, speed: 25, gradient: 'deep_rain' },

    'light_snow': { type: 'snow', count: 30, speedY: 1, speedX: 0.5, gradient: 'snow' },
    'moderate_snow': { type: 'snow', count: 60, speedY: 2, speedX: 1, gradient: 'snow' },
    'heavy_snow': { type: 'snow', count: 100, speedY: 3, speedX: 1.5, gradient: 'snow' },
    'storm_snow': { type: 'snow', count: 150, speedY: 4, speedX: 2, gradient: 'storm_snow' },

    'dust': { type: 'fog', density: 25, color: '#E0C090', gradient: 'dust', opacity: 0.15 },
    'sand': { type: 'fog', density: 35, color: '#D2B48C', gradient: 'sand' },

    'lightning-rainy': { type: 'rain', count: 100, speed: 18, lightning: true, gradient: 'storm' },
    'hail': { type: 'hail', count: 50, speed: 25, gradient: 'storm' },
    'snowy-rainy': { type: 'sleet', count: 60, speed: 12, gradient: 'cold' },
    'windy': { type: 'wind', count: 40, speed: 5, color: '#FFFFFF', gradient: 'windy' },
    'alert': { type: 'cloudy', density: 50, speed: 1, gradient: 'gray' },
    'day': { type: 'sunny', gradient: 'day' }
};

export const DEFAULT_CONFIG = { type: 'sunny', isNight: false, gradient: 'day' };

export const QWEATHER_ICON_MAP = {
    '100': 'sunny', '150': 'clear-night', // 晴
    '101': 'partlycloudy', '151': 'partlycloudy', // 多云
    '102': 'partlycloudy', '152': 'partlycloudy', // 少云
    '103': 'partlycloudy', '153': 'partlycloudy', // 晴间多云
    '104': 'cloudy', // 阴

    '300': 'light_rain', '350': 'light_rain', // 阵雨
    '301': 'moderate_rain', '351': 'moderate_rain', // 强阵雨
    '302': 'lightning-rainy', // 雷阵雨
    '303': 'lightning-rainy', // 强雷阵雨
    '304': 'hail', // 雷阵雨伴有冰雹
    '305': 'light_rain', // 小雨
    '306': 'moderate_rain', // 中雨
    '307': 'heavy_rain', // 大雨
    '308': 'storm_rain', // 极端降雨
    '309': 'light_rain', // 毛毛雨/细雨
    '310': 'storm_rain', // 暴雨
    '311': 'storm_rain', // 大暴雨
    '312': 'storm_rain', // 特大暴雨
    '313': 'sleet', // 冻雨 (Visualized as sleet/ice)
    '314': 'moderate_rain', // 小到中雨
    '315': 'heavy_rain', // 中到大雨
    '316': 'storm_rain', // 大到暴雨
    '317': 'storm_rain', // 暴雨到大暴雨
    '318': 'storm_rain', // 大暴雨到特大暴雨
    '399': 'moderate_rain', // 雨

    '400': 'light_snow', // 小雪
    '401': 'moderate_snow', // 中雪
    '402': 'heavy_snow', // 大雪
    '403': 'storm_snow', // 暴雪
    '404': 'sleet', // 雨夹雪
    '405': 'sleet', // 雨雪天气
    '406': 'sleet', '456': 'sleet', // 阵雨夹雪
    '407': 'light_snow', '457': 'light_snow', // 阵雪
    '408': 'moderate_snow', // 小到中雪
    '409': 'heavy_snow', // 中到大雪
    '410': 'storm_snow', // 大到暴雪
    '499': 'moderate_snow', // 雪

    '500': 'light_haze', // 薄雾
    '501': 'fog', // 雾
    '502': 'moderate_haze', // 霾
    '503': 'sand', // 扬沙
    '504': 'dust', // 浮尘
    '507': 'sand', // 沙尘暴
    '508': 'sand', // 强沙尘暴
    '509': 'fog', // 浓雾
    '510': 'fog', // 强浓雾
    '511': 'moderate_haze', // 中度霾
    '512': 'heavy_haze', // 重度霾
    '513': 'heavy_haze', // 严重霾
    '514': 'fog', // 大雾
    '515': 'fog', // 特强浓雾

    '900': 'sunny', // 热
    '901': 'cloudy', // 冷
    '999': 'sunny' // 未知
};