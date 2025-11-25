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
    'fog': { type: 'fog', density: 60, color: '#B0C4DE', gradient: 'gray' },

    'light_haze': { type: 'fog', density: 30, color: '#B0C4DE', gradient: 'gray' },
    'moderate_haze': { type: 'fog', density: 60, color: '#B0C4DE', gradient: 'gray' },
    'heavy_haze': { type: 'fog', density: 90, color: '#90A4AE', gradient: 'gray' },

    'light_rain': { type: 'rain', count: 30, speed: 10, gradient: 'rain' },
    'moderate_rain': { type: 'rain', count: 60, speed: 15, gradient: 'rain' },
    'heavy_rain': { type: 'rain', count: 120, speed: 22, gradient: 'deep_rain' },
    'storm_rain': { type: 'rain', count: 180, speed: 25, gradient: 'deep_rain' },

    'light_snow': { type: 'snow', count: 30, speedY: 1, speedX: 0.5, gradient: 'snow' },
    'moderate_snow': { type: 'snow', count: 60, speedY: 2, speedX: 1, gradient: 'snow' },
    'heavy_snow': { type: 'snow', count: 100, speedY: 3, speedX: 1.5, gradient: 'snow' },
    'storm_snow': { type: 'snow', count: 150, speedY: 4, speedX: 2, gradient: 'storm_snow' },

    'dust': { type: 'fog', density: 40, color: '#E0C090', gradient: 'dust', opacity: 0.15 },
    'sand': { type: 'fog', density: 80, color: '#D2B48C', gradient: 'sand' },

    'lightning-rainy': { type: 'rain', count: 100, speed: 18, lightning: true, gradient: 'storm' },
    'hail': { type: 'rain', count: 50, speed: 25, gradient: 'storm' },
    'snowy-rainy': { type: 'rain', count: 60, speed: 12, gradient: 'cold' },
    'windy': { type: 'wind', count: 40, speed: 5, color: '#FFFFFF', gradient: 'windy' },
    'alert': { type: 'cloudy', density: 50, speed: 1, gradient: 'gray' },
    'day': { type: 'sunny', gradient: 'day' }
};

export const DEFAULT_CONFIG = { type: 'sunny', isNight: false, gradient: 'day' };